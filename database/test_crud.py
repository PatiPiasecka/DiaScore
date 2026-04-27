import pytest
from database.database import SessionLocal
from database import crud

# Fixture that sets up the database session before the tests run
# and safely closes it after they complete.
@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_get_patient_count(db_session):
    """Tests that the count of patients in the database is exactly 768."""
    count = crud.get_patient_count(db_session)
    assert count == 768

def test_get_records_limit(db_session):
    """Tests that the get_records function correctly limits the output to 50 records."""
    records = crud.get_records(db_session, skip=0, limit=50)
    assert len(records) == 50

def test_get_single_record(db_session):
    """Tests fetching a single patient record by ID and verifies the data integrity."""
    record = crud.get_record(db_session, record_id=1)
    assert record is not None
    assert record.id == 1
    # Verify that the age matches the first row
    assert record.age == 50