from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from . import schemas
from database import models, crud
from database.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DiaScore API",
    description="API for diabates risk prediction",
    version="1.0.0"
)

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", tags=["General"])
async def root():
    return {"message": "Welcome to DiaScore API"}

@app.get("/records/", response_model=List[schemas.DiabetesRecord], tags=["Data Management"])
def read_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = crud.get_records(db, skip=skip, limit=limit)
    return records

@app.get("/records/{record_id}", response_model=schemas.DiabetesRecord)
def read_record(record_id: int, db: Session = Depends(get_db)):
    record = crud.get_record(db, record_id=record_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Patient record not found"
        )
    return record 

@app.post("/predict/", status_code=status.HTTP_201_CREATED, response_model=schemas.DiabetesPrediction, tags=["AI, Prediction"])
def create_prediction(data: schemas.DiabetesCreate, db: Session = Depends(get_db)):
    """
        1. Receive Patient Data
        2. Runs the ML prediction (in future)
        3. Save the record to the database for future analysis
        4. Returns the risk score and classification
    """
    # ML MODEL LOGIC (Placeholder)
    mock_risk = 1 if data.glucose > 140 else 0
    crud.create_diabetes_record(db=db, record=data, outcome=mock_risk)
    
    return schemas.DiabetesPrediction(
        risk_score=mock_risk,
        is_diabetic_risk=mock_risk > 0.5
    )