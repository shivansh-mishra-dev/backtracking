from backend import database, models
from sqlalchemy import text

db = database.SessionLocal()
try:
    print(db.query(models.Dentist).count())
    db.query(models.Dentist).delete()
    db.commit()
    print(db.query(models.Dentist).count())
except Exception as e:
    print(e)
