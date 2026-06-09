import pytest
from database import crud, models, schemas


# Optional helper fixture to insert a known test record
@pytest.fixture(scope="function")
def seed_record(db_session):
    """Insert a controlled test training record into the database."""
    record = models.DiabetesRecord(
        pregnancies=2,
        glucose=120,
        blood_pressure=70,
        skin_thickness=25,
        insulin=80,
        bmi=26.5,
        diabetes_pedigree_function=0.45,
        age=30,
        outcome=0,
    )

    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)

    return record


def test_get_patient_count(db_session):
    """Verify that the count function returns a valid integer greater than or equal to 0."""
    count = crud.get_patient_count(db_session)

    assert isinstance(count, int)
    assert count >= 0


def test_get_records_limit(db_session):
    """Ensure the limit parameter is respected when querying records."""
    limit = 50
    records = crud.get_records(db_session, skip=0, limit=limit)

    assert isinstance(records, list)
    assert len(records) <= limit


def test_get_single_record(db_session, seed_record):
    """Ensure we can retrieve a specific record by ID and the data matches."""
    record = crud.get_record(db_session, record_id=seed_record.id)

    assert record is not None
    assert record.id == seed_record.id
    assert record.age == seed_record.age
    assert record.glucose == seed_record.glucose


def test_create_and_get_prediction(db_session):
    """Test saving a new prediction to the database, including the imputed_fields JSON array."""
    prediction_data = schemas.PatientPredictionCreate(
        pregnancies=1,
        glucose=100,
        blood_pressure=80,
        skin_thickness=20,
        insulin=50,
        bmi=25.0,
        diabetes_pedigree_function=0.5,
        age=30,
        user_id="test_user_123",
        risk_score=0.25,
        imputed_fields=["insulin", "bmi"]  # Simulating that these fields were imputed
    )

    # Save to database
    db_prediction = crud.create_prediction(db_session, prediction=prediction_data)
    assert db_prediction.id is not None
    assert db_prediction.user_id == "test_user_123"
    
    # Ensure the JSON column correctly stored the list
    assert db_prediction.imputed_fields == ["insulin", "bmi"]

    # Retrieve from database
    user_predictions = crud.get_predictions_by_user(db_session, user_id="test_user_123")
    assert len(user_predictions) == 1
    assert user_predictions[0].user_id == "test_user_123"
    
    # Ensure the JSON column correctly deserializes the list on read
    assert user_predictions[0].imputed_fields == ["insulin", "bmi"]

    # Test retrieving for a non-existent user
    empty_predictions = crud.get_predictions_by_user(db_session, user_id="wrong_user")
    assert len(empty_predictions) == 0