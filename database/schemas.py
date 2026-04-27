from pydantic import BaseModel

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

    class Config:
        from_attributes = True # Pozwala na współpracę z SQLAlchemy