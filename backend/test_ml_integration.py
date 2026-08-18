import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from datetime import date

# Ensure DB tables are created
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_ml_flow():
    print("--- 1. Testing GET /api/ml/info ---")
    res = client.get("/api/ml/info")
    print("Status:", res.status_code)
    print("Data:", res.json())
    assert res.status_code == 200
    assert res.json()["model_loaded"] == True

    print("\n--- 2. Creating test child ---")
    child_res = client.post("/api/children", json={
        "name": "Test Baby ML",
        "date_of_birth": "2024-06-15",
        "sex": "female"
    })
    print("Child Status:", child_res.status_code)
    child_data = child_res.json()
    child_id = child_data["id"]
    print("Child ID:", child_id)

    print("\n--- 3. Adding growth measurement ---")
    growth_res = client.post(f"/api/children/{child_id}/measurements", json={
        "height_cm": 82.5,
        "weight_kg": 11.2,
        "measurement_date": "2026-08-01"
    })
    print("Growth Status:", growth_res.status_code)
    assert growth_res.status_code == 201

    print("\n--- 4. Submitting milestone assessment ---")
    # Fetch questions for 24m
    q_res = client.get("/api/milestones/questions?age_months=24")
    questions = q_res.json()["questions"]
    
    responses = [
        {"question_id": q["id"], "answer": "achieved"} for q in questions[:8]
    ] + [
        {"question_id": q["id"], "answer": "not_yet_observed"} for q in questions[8:]
    ]

    assess_res = client.post(f"/api/children/{child_id}/assessments", json={
        "assessment_date": "2026-08-10",
        "responses": responses
    })
    print("Assessment Status:", assess_res.status_code)
    assess_data = assess_res.json()
    assess_id = assess_data["id"]
    print("Assessment ID:", assess_id)

    print("\n--- 5. Generating ML prediction ---")
    pred_res = client.post(f"/api/children/{child_id}/predict", json={
        "milestone_assessment_id": assess_id
    })
    print("Predict Status:", pred_res.status_code)
    pred_data = pred_res.json()
    print("Prediction Data:")
    print("  Status:", pred_data["status"])
    print("  Probability:", pred_data["monitoring_probability"], "%")
    print("  Class:", pred_data["predicted_class"])
    print("  Factors:", len(pred_data["contributing_factors"]), "factors analyzed")
    assert pred_res.status_code == 201

    print("\n--- 6. Retrieving prediction history ---")
    hist_res = client.get(f"/api/children/{child_id}/predictions")
    print("History Status:", hist_res.status_code)
    print("History Items Count:", len(hist_res.json()))
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

    print("\nSUCCESS: All Week 3 ML integration tests passed clean!")

if __name__ == "__main__":
    test_ml_flow()
