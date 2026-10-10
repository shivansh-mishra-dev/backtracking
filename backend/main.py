from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from services.scheduler import run_scheduler

from typing import List
from pathlib import Path
import pandas as pd
import models
import database
import time
import os

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="DentalSched API")

# Configure CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://shivansn013.duckdns.org",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "DentalSched API is running"}


progress_state = {
    "is_running": False,
    "start_time": 0,
    "runtime_ms": 0,
    "states_explored": 0,
    "backtracks": 0,
    "algorithm": "",
}


@app.get("/progress")
def get_progress():
    if progress_state["is_running"]:
        progress_state["runtime_ms"] = (
            time.time() - progress_state["start_time"]
        ) * 1000
    return progress_state


@app.post("/load_dataset")
def load_dataset(case: str, db: Session = Depends(database.get_db)):
    """
    Endpoint to load CSV files (doctors, rooms, requests) for a specific case from local storage.
    """
    case_map = {
        "Tiny (Brute Force Demo)": "case0_tiny_demo",
        "Small Realistic": "case1_small_realistic",
        "Medium Synthetic": "case2_medium_synthetic",
        "Large Synthetic": "case3_large_synthetic",
        "Huge Synthetic": "case4_huge_synthetic",
        "Extreme Synthetic": "case5_extreme_synthetic",
    }

    folder_name = case_map.get(case)
    if not folder_name:
        raise HTTPException(status_code=400, detail="Invalid case selection")

    base_path = Path(__file__).parent / "assets" / "data" / folder_name

    db.query(models.Dentist).delete()
    db.query(models.Room).delete()
    db.query(models.Request).delete()

    conn = db.connection()

    # Doctors
    df_docs = pd.read_csv(base_path / "doctors.csv")
    df_docs.rename(
        columns={
            "doctor_id": "id",
            "name": "name",
            "working_hours_start": "start_time",
            "working_hours_end": "end_time",
        },
        inplace=True,
    )
    df_docs = df_docs[["id", "name", "start_time", "end_time"]]
    df_docs.to_sql("dentists", con=conn, if_exists="append", index=False)

    # Rooms
    df_rooms = pd.read_csv(base_path / "rooms.csv")
    df_rooms.rename(columns={"room_id": "id", "room_type": "room_type"}, inplace=True)
    df_rooms = df_rooms[["id", "room_type"]]
    df_rooms.to_sql("rooms", con=conn, if_exists="append", index=False)

    # Requests
    df_reqs = pd.read_csv(base_path / "requests.csv")
    df_reqs.rename(
        columns={
            "request_id": "id",
            "patient": "patient",
            "doctor_id": "dentist_id",
            "procedure_type": "procedure",
            "acceptable_room_type": "acceptable_room_type",
            "requested_start": "requested_time",
            "duration_min": "duration_min",
        },
        inplace=True,
    )
    df_reqs = df_reqs[
        [
            "id",
            "patient",
            "dentist_id",
            "procedure",
            "acceptable_room_type",
            "requested_time",
            "duration_min",
        ]
    ]
    df_reqs.to_sql("requests", con=conn, if_exists="append", index=False)

    db.commit()

    # Return the loaded data to the frontend so it can populate AppContext
    requests = db.query(models.Request).all()
    rooms = db.query(models.Room).all()
    dentists = db.query(models.Dentist).all()

    return {
        "status": "Loaded successfully",
        "dentists": dentists,
        "rooms": rooms,
        "requests": requests,
    }


@app.post("/upload_custom")
async def upload_custom(
    doctors_file: UploadFile = File(...),
    rooms_file: UploadFile = File(...),
    requests_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    """
    Endpoint to process 3 custom uploaded CSV files using pandas and sqlite.
    """

    # Clear existing
    db.query(models.Dentist).delete()
    db.query(models.Room).delete()
    db.query(models.Request).delete()

    conn = db.connection()

    # Process Doctors
    df_docs = pd.read_csv(doctors_file.file)
    df_docs.rename(
        columns={
            "doctor_id": "id",
            "name": "name",
            "working_hours_start": "start_time",
            "working_hours_end": "end_time",
        },
        inplace=True,
    )
    df_docs = df_docs[["id", "name", "start_time", "end_time"]]
    df_docs.to_sql("dentists", con=conn, if_exists="append", index=False)

    # Process Rooms
    df_rooms = pd.read_csv(rooms_file.file)
    df_rooms.rename(columns={"room_id": "id", "room_type": "room_type"}, inplace=True)
    df_rooms = df_rooms[["id", "room_type"]]
    df_rooms.to_sql("rooms", con=conn, if_exists="append", index=False)

    # Process Requests
    df_reqs = pd.read_csv(requests_file.file)
    df_reqs.rename(
        columns={
            "request_id": "id",
            "patient": "patient",
            "doctor_id": "dentist_id",
            "procedure_type": "procedure",
            "acceptable_room_type": "acceptable_room_type",
            "requested_start": "requested_time",
            "duration_min": "duration_min",
        },
        inplace=True,
    )
    df_reqs = df_reqs[
        [
            "id",
            "patient",
            "dentist_id",
            "procedure",
            "acceptable_room_type",
            "requested_time",
            "duration_min",
        ]
    ]
    df_reqs.to_sql("requests", con=conn, if_exists="append", index=False)

    db.commit()

    # Return the loaded data
    requests = db.query(models.Request).all()
    rooms = db.query(models.Room).all()
    dentists = db.query(models.Dentist).all()

    return {
        "status": "Custom datasets uploaded successfully",
        "dentists": dentists,
        "rooms": rooms,
        "requests": requests,
    }


@app.post("/schedule")
def generate_schedule(algorithm: str, db: Session = Depends(database.get_db)):
    """
    Trigger the scheduling algorithm (Brute Force, Backtracking, BT+FC).
    Returns the final assignment and the visualizer step logs.
    """
    # Fetch current data from database
    requests = db.query(models.Request).all()
    rooms = db.query(models.Room).all()
    dentists = db.query(models.Dentist).all()

    if not requests or not rooms or not dentists:
        raise HTTPException(
            status_code=400,
            detail="Database is missing data. Please upload CSVs first.",
        )

    progress_state["is_running"] = True
    progress_state["start_time"] = time.time()
    progress_state["runtime_ms"] = 0
    progress_state["states_explored"] = 0
    progress_state["backtracks"] = 0
    progress_state["algorithm"] = algorithm

    try:
        result = run_scheduler(requests, rooms, dentists, algorithm, progress_state)
    finally:
        progress_state["is_running"] = False

    return result
