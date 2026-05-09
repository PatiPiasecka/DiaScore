from sqlalchemy import Column, Integer, Float
from .database import Base


class DiabetesRecord(Base):
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
    outcome = Column(Integer)  # 0 lub 1
