from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class DiabetesBase(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20, description="Count of pregnacies")
    glucose: int = Field(
        ..., ge=0, le=500, description="Plasma glucose concentration (mg/dL)"
    )
    blood_pressure: int = Field(
        ..., ge=0, le=300, description="Diastolic blood pressure (mmHg)"
    )
    skin_thickness: int = Field(
        ..., ge=0, le=100, description="Triceps skin fold thickness (mm)"
    )
    insulin: int = Field(
        ..., ge=0, le=1000, description="2-Hour serum insulin (mu U/ml)"
    )
    bmi: float = Field(
        ..., ge=0, le=100, description="Body mass index (weight in kg/(height in m)^2)"
    )
    diabetes_pedigree_function: float = Field(
        ..., gt=0, description="Diabetes pedigree function (genetic score)"
    )
    age: int = Field(..., ge=0, le=120, description="Patient age (years)")


class DiabetesCreate(DiabetesBase):
    pass


class DiabetesRecord(DiabetesBase):
    # Schema for reading training data from the database (GET /records/)
    id: int = Field(...)
    outcome: int = Field(...)

    model_config = ConfigDict(
        from_attributes=True, extra="ignore", str_strip_whitespace=True
    )


class PredictionResponse(BaseModel):
    # Response from /predict/ endpoint
    id: int
    risk_score: float = Field(..., description="Probability of diabetes (0.0-1.0)")
    is_diabetic_risk: bool = Field(...)

    model_config = ConfigDict(from_attributes=True)


class PredictionHistory(BaseModel):
    # Full prediction record for history endpoint
    id: int
    created_at: datetime
    pregnancies: int
    glucose: int
    blood_pressure: int
    skin_thickness: int
    insulin: int
    bmi: float
    diabetes_pedigree_function: float
    age: int
    risk_score: float = Field(..., description="Probability of diabetes (0.0-1.0)")

    model_config = ConfigDict(from_attributes=True)
