from pydantic import BaseModel, ConfigDict

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