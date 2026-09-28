from sqlalchemy import Column, Integer, String, Time
from .database import Base

class Dentist(Base):
    __tablename__ = "dentists"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    start_time = Column(String)  # Storing as string "HH:MM" for simplicity in JSON
    end_time = Column(String)

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    room_type = Column(String, index=True)

class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, index=True)
    patient = Column(String)
    dentist_id = Column(String)
    procedure = Column(String)
    requested_time = Column(String)
    duration_min = Column(Integer)
