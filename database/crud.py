from sqlalchemy.orm import Session

from . import models
from . import schemas


def get_record(db: Session, record_id: int) -> models.DiabetesRecord | None:
    return (
        db.query(models.DiabetesRecord)
        .filter(models.DiabetesRecord.id == record_id)
        .first()
    )


def get_records(
    db: Session, skip: int = 0, limit: int = 100
) -> list[models.DiabetesRecord]:
    return (
        db.query(models.DiabetesRecord)
        .order_by(models.DiabetesRecord.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_diabetes_record(
    db: Session, record: schemas.DiabetesCreate, outcome: int
) -> models.DiabetesRecord:
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


def get_patient_count(db: Session) -> int:
    return db.query(models.DiabetesRecord).count()


# Patient Predictions
def create_prediction(
    db: Session, prediction: schemas.PatientPredictionCreate
) -> models.PatientPrediction:
    """Save a user prediction to the database."""
    db_prediction = models.PatientPrediction(**prediction.model_dump())
    try:
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        return db_prediction
    except Exception as e:
        db.rollback()
        raise e


def get_prediction(db: Session, prediction_id: int) -> models.PatientPrediction | None:
    return (
        db.query(models.PatientPrediction)
        .filter(models.PatientPrediction.id == prediction_id)
        .first()
    )


def get_predictions(
    db: Session, skip: int = 0, limit: int = 100
) -> list[models.PatientPrediction]:
    return (
        db.query(models.PatientPrediction)
        .order_by(models.PatientPrediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_predictions_by_user(
    db: Session, user_id: str, skip: int = 0, limit: int = 100
) -> list[models.PatientPrediction]:
    return (
        db.query(models.PatientPrediction)
        .filter(models.PatientPrediction.user_id == user_id)
        .order_by(models.PatientPrediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_predictions_count(db: Session) -> int:
    return db.query(models.PatientPrediction).count()


def delete_prediction(db: Session, prediction_id: int) -> bool:
    """Delete a patient prediction by id. Returns True if deleted, False if not found."""
    prediction = (
        db.query(models.PatientPrediction)
        .filter(models.PatientPrediction.id == prediction_id)
        .first()
    )
    if prediction is None:
        return False

    try:
        db.delete(prediction)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise


def delete_predictions_by_user(db: Session, user_id: str) -> int:
    """Delete all predictions for a specific user. Returns the number of deleted rows."""
    try:
        deleted_count = (
            db.query(models.PatientPrediction)
            .filter(models.PatientPrediction.user_id == user_id)
            .delete()
        )
        db.commit()
        return deleted_count
    except Exception:
        db.rollback()
        raise
