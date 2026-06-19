import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from . import schemas
from ml.src.predict import load_model, predict_diabetes_risk
from database import models, crud
from database.database import SessionLocal, engine
from database import preprocessing
import joblib

models.Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    base = Path(__file__).resolve().parent.parent / "database"
    imputer_path = base / "imputer.joblib"
    try:
        app.state.imputer = joblib.load(imputer_path)
    except Exception as exc:
        logger.warning("Failed to load imputer from %s: %s", imputer_path, exc)
        app.state.imputer = None

    # load prediction model
    try:
        app.state.model = load_model()
    except Exception as exc:
        logger.error("Failed to load ML model: %s", exc)
        app.state.model = None
    yield


app = FastAPI(
    title="DiaScore API",
    description="API for diabetes risk prediction",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
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
    1. Check user's history for logical consistency (age, pregnancies).
    2. Receive Patient Data and Apply Imputation.
    3. Run the ML prediction.
    4. Save the prediction to the database.
    """

    # 1. LOGICAL VALIDATION AGAINST HISTORY
    if data.user_id:
        # Fetch the most recent prediction for this user
        history = crud.get_predictions_by_user(
            db, user_id=data.user_id, skip=0, limit=1
        )

        if history:
            last_record = history[0]

            # Validate Pregnancies: cannot be lower than the previous record
            if data.pregnancies < last_record.pregnancies:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Number of pregnancies cannot be lower than in your previous record ({last_record.pregnancies}).",
                )

            # Validate Age: check logical progression over time
            last_date = last_record.created_at
            current_date = datetime.now(timezone.utc)
            years_diff = current_date.year - last_date.year

            last_age = last_record.age
            min_logical_age = last_age  # Age cannot decrease
            max_logical_age = last_age + years_diff + 1  # +1 to account for birthdays

            if data.age < min_logical_age:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Age cannot be lower than your previously recorded age ({last_age}).",
                )

            if data.age > max_logical_age:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Provided age ({data.age}) is logically inconsistent with your history. Based on your last record from {last_date.year}, your maximum age should be {max_logical_age}.",
                )

    # DATA IMPUTATION
    imputer = getattr(app.state, "imputer", None)
    if imputer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction temporarily unavailable because the imputer is not loaded.",
        )

    data_dict = data.model_dump()
    data_dict = preprocessing.impute_record(data_dict, imputer)

    features = [
        float(data_dict["pregnancies"]),
        float(data_dict["glucose"]),
        float(data_dict["blood_pressure"]),
        float(data_dict["skin_thickness"]),
        float(data_dict["insulin"]),
        float(data_dict["bmi"]),
        float(data_dict["diabetes_pedigree_function"]),
        float(data_dict["age"]),
    ]

    # ML MODEL PREDICTION
    model = getattr(app.state, "model", None)
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction temporarily unavailable because the ML model is not loaded.",
        )

    try:
        risk_score = predict_diabetes_risk(features, model)
    except Exception as e:
        logger.error("Prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Prediction logic failed.")

    # SAVE PREDICTION TO DATABASE
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
        user_id=data.user_id,
        risk_score=risk_score,
        imputed_fields=data_dict.get("imputed_fields", []),
    )
    db_prediction = crud.create_prediction(db=db, prediction=prediction_data)

    return schemas.PredictionResponse(
        id=db_prediction.id,
        user_id=data.user_id,
        pregnancies=data_dict["pregnancies"],
        glucose=data_dict["glucose"],
        blood_pressure=data_dict["blood_pressure"],
        skin_thickness=data_dict["skin_thickness"],
        insulin=data_dict["insulin"],
        bmi=data_dict["bmi"],
        diabetes_pedigree_function=data_dict["diabetes_pedigree_function"],
        age=data_dict["age"],
        risk_score=risk_score,
        is_diabetic_risk=risk_score > 0.5,
        imputed_fields=data_dict.get("imputed_fields", []),
    )


@app.get(
    "/predictions/",
    response_model=List[schemas.PredictionHistory],
    tags=["Data Management"],
)
def read_predictions(
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve prediction history (user predictions, not training data)."""
    if user_id:
        return crud.get_predictions_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return crud.get_predictions(db, skip=skip, limit=limit)


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
