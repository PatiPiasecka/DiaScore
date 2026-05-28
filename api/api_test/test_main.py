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
    new_data = {
        "pregnancies": 0,
        "glucose": 100,
        "blood_pressure": 70,
        "skin_thickness": 20,
        "insulin": 50,
        "bmi": 22.0,
        "diabetes_pedigree_function": 0.1,
        "age": 25,
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created_record = post_response.json()
    record_id = created_record["id"]

    get_response = client.get(f"/predictions/{record_id}")

    assert get_response.status_code == 200
    fetched_data = get_response.json()

    assert fetched_data["id"] == record_id

    for key, value in new_data.items():
        assert fetched_data[key] == value

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
        "diabetes_pedigree_function": 0.5,
        "age": 40,
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
        "diabetes_pedigree_function": 0.5,
        "age": 30,
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created_id = post_response.json()["id"]

    history_response = client.get("/predictions/")
    records = history_response.json()

    first_record = records[0]

    assert first_record["id"] == created_id
    assert first_record["glucose"] == test_glucose
