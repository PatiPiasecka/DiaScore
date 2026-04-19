from pathlib import Path
import pandas as pd
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

def import_csv_to_db(csv_file_path: str):
    df = pd.read_csv(csv_file_path)
    
    db = SessionLocal()
    
    try:
        print(f"Starting the import for {len(df)} records...")
        
        for _, row in df.iterrows():
            db_record = models.DiabetesRecord(
                pregnancies=int(row['Pregnancies']),
                glucose=int(row['Glucose']),
                blood_pressure=int(row['BloodPressure']),
                skin_thickness=int(row['SkinThickness']),
                insulin=int(row['Insulin']),
                bmi=float(row['BMI']),
                diabetes_pedigree_function=float(row['DiabetesPedigreeFunction']),
                age=int(row['Age']),
                outcome=int(row['Outcome'])
            )
            db.add(db_record)
        
        db.commit()
        print("Import was succesful")
        
    except Exception as e:
        print(f"There was an error during import: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent  # database/
    file_path = BASE_DIR.parent / "data" / "diabetes.csv"
    
    import_csv_to_db(file_path)