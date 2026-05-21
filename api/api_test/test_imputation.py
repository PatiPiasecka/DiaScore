def test_predict_endpoint_applies_imputation(client):
    """Test that /predict/ applies KNN imputation to zero-valued fields."""
    new_data = {
        "pregnancies": 1,
        "glucose": 0,
        "blood_pressure": 0,
        "skin_thickness": 0,
        "insulin": 0,
        "bmi": 0.0,
        "diabetes_pedigree_function": 0.5,
        "age": 45,
    }

    post_response = client.post("/predict/", json=new_data)
    assert post_response.status_code == 201
    created = post_response.json()
    record_id = created["id"]

    resp = client.get(f"/records/{record_id}")
    assert resp.status_code == 200
    rec = resp.json()

    # Imputer should have replaced zeros in these fields
    assert rec["glucose"] != 0, "glucose should be imputed (not 0)"
    assert rec["blood_pressure"] != 0, "blood_pressure should be imputed (not 0)"
    assert rec["skin_thickness"] != 0, "skin_thickness should be imputed (not 0)"
    assert rec["insulin"] != 0, "insulin should be imputed (not 0)"
    assert rec["bmi"] != 0.0, "bmi should be imputed (not 0.0)"

