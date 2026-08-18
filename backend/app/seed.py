import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import date
from app.database import SessionLocal, engine, Base
from app.models.child import Child
from app.models.growth import GrowthMeasurement
from app.services.growth_service import calculate_bmi, validate_growth_measurement

from app.models.milestone import MilestoneAssessment
from app.rules.rule_engine import evaluate_milestone_assessment
import json

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(Child).count() > 0:
        if db.query(MilestoneAssessment).count() == 0:
            print("Seeding sample milestone assessments for existing children...")
            children = db.query(Child).all()
            for child in children:
                # Seed a sample milestone assessment
                responses = [
                    {"question_id": f"gm_24_1", "answer": "achieved"},
                    {"question_id": f"gm_24_2", "answer": "achieved"},
                    {"question_id": f"fm_24_1", "answer": "achieved"},
                    {"question_id": f"lang_24_1", "answer": "achieved"},
                    {"question_id": f"cog_24_1", "answer": "achieved"},
                    {"question_id": f"se_24_1", "answer": "achieved"},
                ]
                eval_res = evaluate_milestone_assessment(child.date_of_birth, date.today(), responses)
                assessment = MilestoneAssessment(
                    child_id=child.id,
                    age_months=eval_res["age_months"],
                    age_group=eval_res["age_group"],
                    assessment_date=date.today(),
                    gross_motor_score=eval_res["gross_motor_score"],
                    fine_motor_score=eval_res["fine_motor_score"],
                    language_score=eval_res["language_score"],
                    cognitive_score=eval_res["cognitive_score"],
                    social_emotional_score=eval_res["social_emotional_score"],
                    not_observed_count=eval_res["not_observed_count"],
                    unsure_count=eval_res["unsure_count"],
                    completion_ratio=eval_res["completion_ratio"],
                    status=eval_res["status"],
                    guidance_json=json.dumps(eval_res["guidance"]),
                    responses_json=json.dumps(eval_res["responses_map"]),
                )
                db.add(assessment)
            db.commit()
            print("Milestone assessments seeded successfully!")
        else:
            print("Database already contains records. Skipping seed.")
        db.close()
        return

    print("Seeding sample child profiles and growth measurements...")

    # Sample Child 1: Aarav (2.5 years old)
    aarav = Child(
        name="Aarav Sharma",
        date_of_birth=date(2023, 2, 15),
        sex="male"
    )
    db.add(aarav)
    db.flush()

    aarav_measurements = [
        {"date": date(2023, 3, 15), "h": 54.0, "w": 4.2},
        {"date": date(2023, 8, 15), "h": 67.5, "w": 7.8},
        {"date": date(2024, 2, 15), "h": 75.0, "w": 9.8},
        {"date": date(2024, 8, 15), "h": 83.5, "w": 11.4},
        {"date": date(2025, 2, 15), "h": 89.2, "w": 12.9},
        {"date": date(2025, 7, 10), "h": 92.8, "w": 13.8},
    ]

    for m in aarav_measurements:
        bmi = calculate_bmi(m["h"], m["w"])
        db.add(GrowthMeasurement(
            child_id=aarav.id,
            height_cm=m["h"],
            weight_kg=m["w"],
            bmi=bmi,
            measurement_date=m["date"]
        ))

    # Sample Child 2: Ananya (1.5 years old)
    ananya = Child(
        name="Ananya Verma",
        date_of_birth=date(2024, 1, 10),
        sex="female"
    )
    db.add(ananya)
    db.flush()

    ananya_measurements = [
        {"date": date(2024, 2, 10), "h": 52.5, "w": 3.9},
        {"date": date(2024, 7, 10), "h": 64.0, "w": 7.1},
        {"date": date(2025, 1, 10), "h": 72.8, "w": 9.2},
        {"date": date(2025, 6, 20), "h": 78.4, "w": 10.5},
    ]

    for m in ananya_measurements:
        bmi = calculate_bmi(m["h"], m["w"])
        db.add(GrowthMeasurement(
            child_id=ananya.id,
            height_cm=m["h"],
            weight_kg=m["w"],
            bmi=bmi,
            measurement_date=m["date"]
        ))

    # Sample Child 3: Vihaan (4 years old)
    vihaan = Child(
        name="Vihaan Patel",
        date_of_birth=date(2021, 11, 5),
        sex="male"
    )
    db.add(vihaan)
    db.flush()

    vihaan_measurements = [
        {"date": date(2022, 11, 5), "h": 75.2, "w": 9.6},
        {"date": date(2023, 11, 5), "h": 87.0, "w": 12.2},
        {"date": date(2024, 11, 5), "h": 96.5, "w": 14.8},
        {"date": date(2025, 5, 1), "h": 101.2, "w": 16.1},
    ]

    for m in vihaan_measurements:
        bmi = calculate_bmi(m["h"], m["w"])
        db.add(GrowthMeasurement(
            child_id=vihaan.id,
            height_cm=m["h"],
            weight_kg=m["w"],
            bmi=bmi,
            measurement_date=m["date"]
        ))

    # Seed sample milestone assessments for each child
    for child in [aarav, ananya, vihaan]:
        responses = [
            {"question_id": f"gm_24_1", "answer": "achieved"},
            {"question_id": f"gm_24_2", "answer": "achieved"},
            {"question_id": f"fm_24_1", "answer": "achieved"},
            {"question_id": f"lang_24_1", "answer": "achieved"},
            {"question_id": f"cog_24_1", "answer": "achieved"},
            {"question_id": f"se_24_1", "answer": "achieved"},
        ]
        eval_res = evaluate_milestone_assessment(child.date_of_birth, date.today(), responses)
        assessment = MilestoneAssessment(
            child_id=child.id,
            age_months=eval_res["age_months"],
            age_group=eval_res["age_group"],
            assessment_date=date.today(),
            gross_motor_score=eval_res["gross_motor_score"],
            fine_motor_score=eval_res["fine_motor_score"],
            language_score=eval_res["language_score"],
            cognitive_score=eval_res["cognitive_score"],
            social_emotional_score=eval_res["social_emotional_score"],
            not_observed_count=eval_res["not_observed_count"],
            unsure_count=eval_res["unsure_count"],
            completion_ratio=eval_res["completion_ratio"],
            status=eval_res["status"],
            guidance_json=json.dumps(eval_res["guidance"]),
            responses_json=json.dumps(eval_res["responses_map"]),
        )
        db.add(assessment)

    db.commit()
    print("Database successfully seeded with children, growth records, and milestone assessments!")
    db.close()

if __name__ == "__main__":
    seed_database()


if __name__ == "__main__":
    seed_database()
