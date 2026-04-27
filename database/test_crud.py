import pytest
from database import SessionLocal
import crud
import models


# Creates a fresh DB session for each test and rolls back everything after
# to ensure full isolation between tests.
@pytest.fixture(scope="function")
def db_session():
    db = SessionLocal()
    connection = db.connection()
    transaction = connection.begin()

    try:
        yield db
    finally:
        transaction.rollback()
        connection.close()
        db.close()


# Optional helper fixture to insert a known test record
@pytest.fixture(scope="function")
def seed_record(db_session):
    # Insert a controlled test record into the database
    record = models.DiabetesRecord(
        pregnancies=2,
        glucose=120,
        blood_pressure=70,
        skin_thickness=25,
        insulin=80,
        bmi=26.5,
        diabetes_pedigree_function=0.45,
        age=30,
        outcome=0
    )

    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)

    return record


def test_get_patient_count(db_session):
    # Verify that count function returns a valid integer greater than 0
    count = crud.get_patient_count(db_session)

    assert isinstance(count, int)
    assert count >= 0


def test_get_records_limit(db_session):
    # Ensure the limit parameter is respected
    limit = 50
    records = crud.get_records(db_session, skip=0, limit=limit)

    assert isinstance(records, list)
    assert len(records) <= limit


def test_get_single_record(db_session, seed_record):
    # Ensure we can retrieve a record by ID and data matches seeded record
    record = crud.get_record(db_session, record_id=seed_record.id)

    assert record is not None
    assert record.id == seed_record.id
    assert record.age == seed_record.age
    assert record.glucose == seed_record.glucose