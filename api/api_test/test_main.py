def test_predict_endpoint_applies_imputation(client):
    """
    Test that /predict/ applies KNN imputation to zero-valued fields
    and correctly tracks which fields were modified in the 'imputed_fields' array.
    """
    new_data = {
        "pregnancies": 1,
        "glucose": 0,
        "blood_pressure": 0,
        "skin_thickness": 0,
        "insulin": 0,
        "bmi": 0.0,
        "diabetes_pedigree_function": 0.5,
        "age": 45,
        "user_id": "test_123",
    }

    post_response = _post_predict(client, new_data)
    
    if post_response is None:
        return

    created = post_response.json()

    assert created["glucose"] != 0, "glucose should be imputed (not 0)"
    assert created["blood_pressure"] != 0, "blood_pressure should be imputed (not 0)"
    assert created["skin_thickness"] != 0, "skin_thickness should be imputed (not 0)"
    assert created["insulin"] != 0, "insulin should be imputed (not 0)"
    assert created["bmi"] != 0.0, "bmi should be imputed (not 0.0)"

    assert "diabetes_pedigree_function" in created
    assert created["diabetes_pedigree_function"] > 0, (
        "DPF should be automatically calculated"
    )

    assert "imputed_fields" in created
    expected_imputed = ["glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"]
    for field in expected_imputed:
        assert field in created["imputed_fields"], (
            f"'{field}' should be present in imputed_fields list"
        )


def test_read_root(client):
    """Test the root endpoint for basic API availability."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to DiaScore API"}


def test_read_records_list(client):
    """Test fetching the paginated list of training records."""
    response = client.get("/records/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_single_record_not_found(client):
    """Test fetching a non-existent training record to ensure proper 404 handling."""
    response = client.get("/records/")
    current_records = response.json()

    # Determine an ID that is guaranteed not to exist
    if current_records:
        non_exist_id = max(r["id"] for r in current_records) + 1000
    else:
        non_exist_id = 999

    response = client.get(f"/records/{non_exist_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Patient record not found"


def _post_predict(client, data):
    """Helper: POST /predict/ and handle 503 (model not loaded in CI)."""
    response = client.post("/predict/", json=data)
    if response.status_code == 503:
        return None
    assert response.status_code == 201
    return response


def test_create_and_then_read_record(client):
    """
    Test creating a prediction with fully valid data and fetching the stored result.
    Ensures that no fields are falsely marked as imputed.
    """
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

    post_response = _post_predict(client, new_data)
    if post_response is None:
        return  # Model not available in CI

    created_record = post_response.json()
    record_id = created_record["id"]

    # Fetch it back from the history endpoint
    get_response = client.get(f"/predictions/{record_id}")
    assert get_response.status_code == 200

    fetched_data = get_response.json()

    # Validate the data was stored and returned identically
    assert fetched_data["id"] == record_id
    assert fetched_data["glucose"] == 100
    assert fetched_data["age"] == 25
    assert "diabetes_pedigree_function" in fetched_data
    assert fetched_data["diabetes_pedigree_function"] > 0
    assert "risk_score" in fetched_data

    # Validate that fully provided data results in an empty imputed_fields list
    assert "imputed_fields" in fetched_data
    assert len(fetched_data["imputed_fields"]) == 0, (
        "No fields should be marked as imputed if user provided all data"
    )


def test_database_updates_immediately(client):
    """Test that a newly created prediction is immediately available in the history endpoint."""
    initial_response = client.get("/predictions/")
    initial_top_id = initial_response.json()[0]["id"] if initial_response.json() else 0

    new_data = {
        "pregnancies": 1,
        "glucose": 105,
        "blood_pressure": 75,
        "skin_thickness": 25,
        "insulin": 0,  # Intentional missing value to check targeted tracking
        "bmi": 99.9,
        "age": 40,
        "has_family_history": "unknown",
        "family_members": [],
        "user_id": "test_123",
    }

    post_response = _post_predict(client, new_data)
    if post_response is None:
        return  # Model not available in CI

    created_id = post_response.json()["id"]

    updated_response = client.get("/predictions/")
    new_record = updated_response.json()[0]

    assert new_record["id"] == created_id
    assert new_record["id"] != initial_top_id

    # Verify that ONLY insulin is tracked as imputed
    assert "insulin" in new_record["imputed_fields"]
    assert "glucose" not in new_record["imputed_fields"]


def test_new_record_is_at_the_top_of_history(client):
    """Test that the prediction history returns the newest records first (descending order)."""
    test_glucose = 500  # Unique marker
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

    post_response = _post_predict(client, new_data)
    if post_response is None:
        return  # Model not available in CI

    created_id = post_response.json()["id"]

    history_response = client.get("/predictions/")
    records = history_response.json()

    first_record = records[0]

    # The most recently created record should be the first element in the list
    assert first_record["id"] == created_id
    assert first_record["glucose"] == test_glucose


def test_predict_fails_on_missing_required_age(client):
    """Test that the API properly rejects payloads missing required schema fields (e.g., 'age')."""
    invalid_data = {
        "glucose": 100,
        "bmi": 25.0,
        "has_family_history": "unknown",
        "user_id": "test_123",
    }
    response = client.post("/predict/", json=invalid_data)

    # 422 Unprocessable Entity is expected from Pydantic validation failure
    assert response.status_code == 422
