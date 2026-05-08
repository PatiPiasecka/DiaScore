from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class DiabetesBase(BaseModel):
    pregnancies: int = Field(..., ge=0, description="Count of pregnacies")
    glucose: int = Field(..., ge=0, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: int = Field(
        ..., ge=0, le=300, description="Diastolic blood pressure (mm Hg)"
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
    # Schema for incoming data from the doctor (POST)
    outcome: Optional[int] = Field(
        None, ge=0, le=1, description="Result: (0: No, 1: Yes)"
    )


class DiabetesRecord(DiabetesBase):
    # Schema for reading data from the database (GET)
    id: int = Field(...)
    outcome: int = Field(...)

    model_config = ConfigDict(
        from_attributes=True, extra="ignore", str_strip_whitespace=True
    )


class DiabetesPrediction(BaseModel):
    # Response from our AI Model
    id: int
    risk_score: float = Field(..., description="Probability of diabetes")
    is_diabetic_risk: bool = Field(...)

    model_config = ConfigDict(from_attributes=True)
