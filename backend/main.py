from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, database

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="DentalSched API")

# Configure CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "DentalSched API is running"}

@app.post("/upload/{dataset_type}")
async def upload_dataset(dataset_type: str, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    """
    Endpoint to upload and parse CSV files (doctors, rooms, requests).
    dataset_type should be one of: 'doctors', 'rooms', 'requests'
    """
    if dataset_type not in ["doctors", "rooms", "requests"]:
        raise HTTPException(status_code=400, detail="Invalid dataset type")
        
    content = await file.read()
    decoded_content = content.decode('utf-8').splitlines()
    import csv
    reader = csv.DictReader(decoded_content)
    
    # Clear existing data for this type
    if dataset_type == "doctors":
        db.query(models.Dentist).delete()
        for row in reader:
            db.add(models.Dentist(id=row['Dentist ID'], name=row['Name'], start_time=row['Start Time'], end_time=row['End Time']))
    elif dataset_type == "rooms":
        db.query(models.Room).delete()
        for row in reader:
            db.add(models.Room(id=row['Operatory ID'], room_type=row['Type']))
    elif dataset_type == "requests":
        db.query(models.Request).delete()
        for row in reader:
            db.add(models.Request(
                id=row['Req ID'], 
                patient=row['Patient'], 
                dentist_id=row['Dentist'], # Assuming CSV dentist name/id matches models
                procedure=row['Procedure'],
                requested_time=row['Requested Time'],
                duration_min=int(row['Duration (min)'])
            ))
            
    db.commit()
    
    return {"filename": file.filename, "type": dataset_type, "status": "Uploaded successfully"}

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
        raise HTTPException(status_code=400, detail="Database is missing data. Please upload CSVs first.")
        
    from .services.scheduler import run_scheduler
    
    result = run_scheduler(requests, rooms, dentists, algorithm)
    return result
