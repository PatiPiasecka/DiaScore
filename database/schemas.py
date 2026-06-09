from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List


class DiabetesBase(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    skin_thickness: int
    insulin: int
    bmi: float
    diabetes_pedigree_function: float
    age: int
    outcome: int


class DiabetesCreate(DiabetesBase):
    pass


class Diabetes(DiabetesBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PatientPredictionBase(BaseModel):
    pregnancies: int
    glucose: int
    blood_pressure: int
    skin_thickness: int
    insulin: int
    bmi: float
    diabetes_pedigree_function: float
    age: int
    risk_score: float
    user_id: str
    imputed_fields: List[str] = Field(default_factory=list)


class PatientPredictionCreate(PatientPredictionBase):
    pass


class PatientPrediction(PatientPredictionBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
