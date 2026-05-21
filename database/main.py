from pathlib import Path
import joblib
import pandas as pd

from .database import SessionLocal, engine
from .preprocessing import fill_missing_values
import models

models.Base.metadata.create_all(bind=engine)


def import_csv_to_db(csv_file_path: str):
    df = pd.read_csv(csv_file_path)

    base_dir = Path(__file__).resolve().parent
    imputer_path = base_dir / "imputer.joblib"
    imputer = None
    if imputer_path.exists():
        imputer = joblib.load(imputer_path)

    df = fill_missing_values(df, imputer)

    db = SessionLocal()

    try:
        print(f"Starting the import for {len(df)} records...")

        records = df.to_dict(orient="records")

        db.bulk_insert_mappings(
            models.DiabetesRecord,
            [
                {
                    "pregnancies": int(row["Pregnancies"]),
                    "glucose": int(row["Glucose"]),
                    "blood_pressure": int(row["BloodPressure"]),
                    "skin_thickness": int(row["SkinThickness"]),
                    "insulin": int(row["Insulin"]),
                    "bmi": float(row["BMI"]),
                    "diabetes_pedigree_function": float(
                        row["DiabetesPedigreeFunction"]
                    ),
                    "age": int(row["Age"]),
                    "outcome": int(row["Outcome"]),
                }
                for row in records
            ],
        )

        db.commit()
        print("Import was successful")
    except Exception as e:
        print(f"There was an error during import: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent  # database/
    file_path = BASE_DIR.parent / "data" / "diabetes.csv"

    import_csv_to_db(file_path)
