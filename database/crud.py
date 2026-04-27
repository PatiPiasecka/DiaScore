from sqlalchemy.orm import Session

from . import models
from . import schemas

def get_record(db: Session, record_id: int):
    return db.query(models.DiabetesRecord).filter(models.DiabetesRecord.id == record_id).first()

def get_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DiabetesRecord).offset(skip).limit(limit).all()

def create_diabetes_record(db: Session, record: schemas.DiabetesCreate):
    db_record = models.DiabetesRecord(**record.model_dump())
    try:
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()  # Rollback in case of an error
        raise e

def get_patient_count(db: Session):
    return db.query(models.DiabetesRecord).count()