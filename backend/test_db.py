import database, models
import pandas as pd

db = database.SessionLocal()
try:
    print("Before delete:", db.query(models.Dentist).count())
    db.query(models.Dentist).delete()
    db.commit()
    print("After delete:", db.query(models.Dentist).count())
    
    # Try inserting with pandas to_sql
    df = pd.DataFrame([{"id": "D1", "name": "Doctor 1", "start_time": "09:00", "end_time": "13:00"}])
    conn = db.connection()
    df.to_sql("dentists", con=conn, if_exists="append", index=False)
    db.commit()
    print("After insert:", db.query(models.Dentist).count())
except Exception as e:
    print("ERROR:", e)
