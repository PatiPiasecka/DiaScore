from sqlalchemy import Column, Integer, Float, DateTime, String
from datetime import datetime, timezone
from .database import Base


class DiabetesRecord(Base):
    """Training dataset: real patient data with verified outcomes."""

    __tablename__ = "diabetes_records"

    id = Column(Integer, primary_key=True, index=True)
    pregnancies = Column(Integer)
    glucose = Column(Integer)
    blood_pressure = Column(Integer)
    skin_thickness = Column(Integer)
    insulin = Column(Integer)
    bmi = Column(Float)
    diabetes_pedigree_function = Column(Float)
    age = Column(Integer)
    outcome = Column(Integer)  # 0 or 1 - verified outcome from training data


class PatientPrediction(Base):
    """User predictions: API predictions with probability scores."""

    __tablename__ = "patient_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    pregnancies = Column(Integer)
    glucose = Column(Integer)
    blood_pressure = Column(Integer)
    skin_thickness = Column(Integer)
    insulin = Column(Integer)
    bmi = Column(Float)
    diabetes_pedigree_function = Column(Float)
    age = Column(Integer)
    risk_score = Column(Float)  # 0.0 to 1.0 - probability score
