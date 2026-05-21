import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import schemas
from database import models, crud
from database.database import SessionLocal, engine
from database import preprocessing
import joblib

models.Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    base = Path(__file__).resolve().parent.parent / "database"
    imputer_path = base / "imputer.joblib"
    try:
        app.state.imputer = joblib.load(imputer_path)
    except Exception as exc:
        logger.warning("Failed to load imputer from %s: %s", imputer_path, exc)
        app.state.imputer = None
    yield


app = FastAPI(
    title="DiaScore API",
    description="API for diabates risk prediction",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get(
    "/records/", response_model=List[schemas.DiabetesRecord], tags=["Data Management"]
)
def read_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = crud.get_records(db, skip=skip, limit=limit)
    return records


@app.get("/records/{record_id}", response_model=schemas.DiabetesRecord)
def read_record(record_id: int, db: Session = Depends(get_db)):
    record = crud.get_record(db, record_id=record_id)

    if record is None:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return record


@app.post(
    "/predict/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.PredictionResponse,
    tags=["AI, Prediction"],
)
def create_prediction(data: schemas.DiabetesCreate, db: Session = Depends(get_db)):
    """
    1. Receive Patient Data
    2. Runs the ML prediction (in future)
    3. Save the prediction to the database
    4. Returns the risk score and classification
    """
    # Apply imputation for missing markers (0 values) if imputer is available
    imputer = getattr(app.state, "imputer", None)
    if imputer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction temporarily unavailable because the imputer is not loaded.",
        )

    data_dict = data.model_dump()
    data_dict = preprocessing.impute_record(data_dict, imputer)

    # ML MODEL LOGIC (Placeholder) - returns risk score as float 0.0-1.0
    glucose = data_dict.get("glucose", data.glucose)
    risk_score = 0.8 if glucose > 140 else 0.3

    # Create prediction record with float risk_score
    from database import schemas as db_schemas

    prediction_data = db_schemas.PatientPredictionCreate(
        pregnancies=data_dict["pregnancies"],
        glucose=data_dict["glucose"],
        blood_pressure=data_dict["blood_pressure"],
        skin_thickness=data_dict["skin_thickness"],
        insulin=data_dict["insulin"],
        bmi=data_dict["bmi"],
        diabetes_pedigree_function=data_dict["diabetes_pedigree_function"],
        age=data_dict["age"],
        risk_score=risk_score,
    )
    db_prediction = crud.create_prediction(db=db, prediction=prediction_data)

    return schemas.PredictionResponse(
        id=db_prediction.id, risk_score=risk_score, is_diabetic_risk=risk_score > 0.5
    )


@app.get(
    "/predictions/",
    response_model=List[schemas.PredictionHistory],
    tags=["Data Management"],
)
def read_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve prediction history (user predictions, not training data)."""
    predictions = crud.get_predictions(db, skip=skip, limit=limit)
    return predictions


@app.get(
    "/predictions/{prediction_id}",
    response_model=schemas.PredictionHistory,
    tags=["Data Management"],
)
def read_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get a specific prediction by ID."""
    prediction = crud.get_prediction(db, prediction_id=prediction_id)

    if prediction is None:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    return prediction
