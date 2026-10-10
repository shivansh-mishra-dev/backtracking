import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import time
from services.scheduler import run_scheduler
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from models import Request, Room, Dentist
from fastapi import Depends

def main():
    db = next(get_db())
    requests = db.query(Request).all()
    rooms = db.query(Room).all()
    dentists = db.query(Dentist).all()
    print(f"Requests: {len(requests)}, Rooms: {len(rooms)}, Dentists: {len(dentists)}")
    
    start = time.time()
    result = run_scheduler(requests, rooms, dentists, "Backtracking + Forward Checking")
    print(f"Runtime: {result['runtime_ms']}ms, States: {result['states_explored']}, Backtracks: {result['backtracks']}")
    
if __name__ == "__main__":
    main()
