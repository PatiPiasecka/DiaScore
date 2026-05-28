# TODO: test outcome of prediction by model


def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to DiaScore API"}


def test_read_records_list(client):
    response = client.get("/records/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_single_record_not_found(client):
    response = client.get("/records/")
    current_records = response.json()

    if current_records:
        non_exist_id = max(r["id"] for r in current_records) + 1000
    else:
        non_exist_id = 999

    response = client.get(f"/records/{non_exist_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Patient record not found"


def test_create_and_then_read_record(client):
    """Test creating a prediction and fetching the stored result."""
    new_data = {
        "pregnancies": 0,
        "glucose": 100,
        "blood_pressure": 70,
        "skin_thickness": 20,
        "insulin": 50,
        "bmi": 22.0,
        "age": 25,
        "has_family_history": "yes",
        "family_members": [
            {"relationship": "parent", "earlyOnset": True, "otherDiseases": []}
        ],
        "user_id": "test_123",
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created_record = post_response.json()
    record_id = created_record["id"]

    get_response = client.get(f"/predictions/{record_id}")
    assert get_response.status_code == 200

    fetched_data = get_response.json()

    # Validate the data was stored and returned correctly
    assert fetched_data["id"] == record_id
    assert fetched_data["glucose"] == 100
    assert fetched_data["age"] == 25
    assert "diabetes_pedigree_function" in fetched_data
    assert fetched_data["diabetes_pedigree_function"] > 0
    assert "risk_score" in fetched_data


def test_database_updates_immediately(client):
    initial_response = client.get("/predictions/")
    initial_top_id = initial_response.json()[0]["id"] if initial_response.json() else 0

    new_data = {
        "pregnancies": 1,
        "glucose": 105,
        "blood_pressure": 75,
        "skin_thickness": 25,
        "insulin": 0,
        "bmi": 99.9,
        "age": 40,
        "has_family_history": "unknown",
        "family_members": [],
        "user_id": "test_123",
    }

    post_response = client.post("/predict/", json=new_data)
    created_id = post_response.json()["id"]
    assert post_response.status_code == 201

    updated_response = client.get("/predictions/")
    new_top_id = updated_response.json()[0]["id"]

    assert new_top_id == created_id
    assert new_top_id != initial_top_id


def test_new_record_is_at_the_top_of_history(client):
    # unique glucose
    test_glucose = 500
    new_data = {
        "pregnancies": 0,
        "glucose": test_glucose,
        "blood_pressure": 80,
        "skin_thickness": 0,
        "insulin": 0,
        "bmi": 25.0,
        "age": 30,
        "has_family_history": "no",
        "family_members": [],
        "user_id": "test_123",
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created_id = post_response.json()["id"]

    history_response = client.get("/predictions/")
    records = history_response.json()

    first_record = records[0]

    assert first_record["id"] == created_id
    assert first_record["glucose"] == test_glucose


def test_predict_fails_on_missing_required_age(client):
    """Test that the API rejects a payload missing the required 'age' field."""
    invalid_data = {
        "glucose": 100,
        "bmi": 25.0,
        "has_family_history": "unknown",
        "user_id": "test_123",
    }
    response = client.post("/predict/", json=invalid_data)
    # 422 Unprocessable Entity from Pydantic validation
    assert response.status_code == 422
