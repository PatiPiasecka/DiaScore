import pytest
import shutil
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.database import Base
from api.main import app, get_db

ORIGINAL_DB = "./database/diabetes.db"
TEST_DB = "./database/test_diabetes.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB}"

pytest.fixture(scope="module", autouse=True)


def setup_test_db():
    # Copy original database
    if os.path.exists(ORIGINAL_DB):
        shutil.copyfile(ORIGINAL_DB, TEST_DB)
    else:
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        Base.metadata.create_all(bind=engine)

    yield

    # delete after test
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


@pytest.fixture(scope="module")
def override_get_db():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def _get_test_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()
