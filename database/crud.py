from sqlalchemy.orm import Session

from . import models
from . import schemas

def get_record(db: Session, record_id: int) -> models.DiabetesRecord | None:
    return db.query(models.DiabetesRecord).filter(models.DiabetesRecord.id == record_id).first()

def get_records(db: Session, skip: int = 0, limit: int = 100) -> list[models.DiabetesRecord]:
    return db.query(models.DiabetesRecord).order_by(models.DiabetesRecord.id.desc()).offset(skip).limit(limit).all()

def create_diabetes_record(db: Session, record: schemas.DiabetesCreate, outcome: int) -> int:
    data_dict = record.model_dump()
    data_dict["outcome"] = outcome
    db_record = models.DiabetesRecord(**data_dict)
    try:
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()  # Rollback in case of an error
        raise e

def get_patient_count(db: Session) -> models.DiabetesRecord:
    return db.query(models.DiabetesRecord).count()