from sqlalchemy.orm import Session

from . import models
from . import schemas

def get_record(db: Session, record_id: int):
    return db.query(models.DiabetesRecord).filter(models.DiabetesRecord.id == record_id).first()

def get_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DiabetesRecord).offset(skip).limit(limit).all()

def create_diabetes_record(db: Session, record: schemas.DiabetesCreate):
    db_record = models.DiabetesRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_patient_count(db: Session):
    return db.query(models.DiabetesRecord).count()