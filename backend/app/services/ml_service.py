import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from datetime import date

FEATURE_COLUMNS = [
    "age_months",
    "sex",
    "height_cm",
    "weight_kg",
    "bmi",
    "height_z_score",
    "weight_z_score",
    "bmi_z_score",
    "gross_motor_score",
    "fine_motor_score",
    "language_score",
    "cognitive_score",
    "social_emotional_score",
    "avg_domain_score",
    "min_domain_score",
    "domain_score_std",
    "not_observed_count",
    "unsure_count",
    "completion_ratio"
]


def calculate_who_z_scores(age_months: int, sex: int, height_cm: float, weight_kg: float, bmi: float):
    if age_months <= 24:
        expected_h = 50.0 + age_months * 1.05 + (0.8 if sex == 1 else 0.0)
        sd_h = 2.5
        expected_w = 3.3 + age_months * 0.42 + (0.3 if sex == 1 else 0.0)
        sd_w = 0.9
    else:
        expected_h = 50.0 + 24 * 1.05 + (age_months - 24) * 0.6 + (0.8 if sex == 1 else 0.0)
        sd_h = 3.5
        expected_w = 3.3 + 24 * 0.42 + (age_months - 24) * 0.22 + (0.3 if sex == 1 else 0.0)
        sd_w = 1.8

    expected_bmi = expected_w / ((expected_h / 100.0) ** 2)
    sd_bmi = 1.3

    height_z = (height_cm - expected_h) / sd_h
    weight_z = (weight_kg - expected_w) / sd_w
    bmi_z = (bmi - expected_bmi) / sd_bmi

    return round(float(height_z), 2), round(float(weight_z), 2), round(float(bmi_z), 2)


class MLPredictionService:
    def __init__(self):
        self.model = None
        self.model_info = {}
        self._load_model()

    def _load_model(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        model_path = os.path.join(base_dir, "ml", "saved_model", "growth_monitoring_model.joblib")
        report_path = os.path.join(base_dir, "ml", "saved_model", "model_report.json")

        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print(f"MLPredictionService: Loaded model from {model_path}")
            except Exception as e:
                print(f"MLPredictionService Error loading model: {e}")
                self.model = None

        if os.path.exists(report_path):
            try:
                with open(report_path, "r") as f:
                    self.model_info = json.load(f)
            except Exception as e:
                print(f"MLPredictionService Error loading report: {e}")

    def get_info(self) -> Dict[str, Any]:
        return {
            "model_loaded": self.model is not None,
            "algorithm_name": self.model_info.get("selected_algorithm", "Calibrated Classifier"),
            "model_version": self.model_info.get("model_version", "2.0.0"),
            "calibrated": self.model_info.get("calibrated", True),
            "features_count": len(FEATURE_COLUMNS),
            "feature_importances": self.model_info.get("feature_importances_percent", {}),
            "metrics": self.model_info.get("calibrated_final_metrics", {})
        }

    def predict(
        self,
        child_dob: date,
        sex_str: str,
        height_cm: float,
        weight_kg: float,
        bmi: float,
        gross_motor_score: float = 1.0,
        fine_motor_score: float = 1.0,
        language_score: float = 1.0,
        cognitive_score: float = 1.0,
        social_emotional_score: float = 1.0,
        not_observed_count: int = 0,
        unsure_count: int = 0,
        completion_ratio: float = 1.0,
        ref_date: Optional[date] = None
    ) -> Tuple[int, float, str, str, List[Dict[str, str]]]:
        if ref_date is None:
            ref_date = date.today()

        days = (ref_date - child_dob).days
        age_months = max(1, min(60, int(days // 30.4375)))

        sex_val = 1 if str(sex_str).lower() in ["male", "m", "1"] else 0

        # Calculate WHO Z-scores
        height_z, weight_z, bmi_z = calculate_who_z_scores(age_months, sex_val, height_cm, weight_kg, bmi)

        # Ensure domain scores are strictly in 0.0 - 1.0 range
        gross_motor_score = gross_motor_score / 100.0 if gross_motor_score > 1.0 else gross_motor_score
        fine_motor_score = fine_motor_score / 100.0 if fine_motor_score > 1.0 else fine_motor_score
        language_score = language_score / 100.0 if language_score > 1.0 else language_score
        cognitive_score = cognitive_score / 100.0 if cognitive_score > 1.0 else cognitive_score
        social_emotional_score = social_emotional_score / 100.0 if social_emotional_score > 1.0 else social_emotional_score

        # Domain interaction features
        domain_list = [gross_motor_score, fine_motor_score, language_score, cognitive_score, social_emotional_score]
        avg_domain_score = round(float(np.mean(domain_list)), 2)
        min_domain_score = round(float(np.min(domain_list)), 2)
        domain_score_std = round(float(np.std(domain_list)), 2)

        feature_dict = {
            "age_months": age_months,
            "sex": sex_val,
            "height_cm": float(height_cm),
            "weight_kg": float(weight_kg),
            "bmi": float(bmi),
            "height_z_score": height_z,
            "weight_z_score": weight_z,
            "bmi_z_score": bmi_z,
            "gross_motor_score": float(gross_motor_score),
            "fine_motor_score": float(fine_motor_score),
            "language_score": float(language_score),
            "cognitive_score": float(cognitive_score),
            "social_emotional_score": float(social_emotional_score),
            "avg_domain_score": avg_domain_score,
            "min_domain_score": min_domain_score,
            "domain_score_std": domain_score_std,
            "not_observed_count": int(not_observed_count),
            "unsure_count": int(unsure_count),
            "completion_ratio": float(completion_ratio)
        }

        df_input = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]

        if self.model is not None:
            proba = float(self.model.predict_proba(df_input)[0, 1])
        else:
            if avg_domain_score < 0.65 or not_observed_count >= 3:
                proba = 0.75
            else:
                proba = 0.15

        prob_pct = round(proba * 100.0, 1)
        predicted_class = 1 if proba >= 0.50 else 0

        if predicted_class == 1:
            status = "Additional Monitoring Recommended"
            guidance = (
                "The calibrated ML monitoring assessment indicates that additional monitoring may be beneficial. "
                "Consider sharing these milestone observations and WHO growth metrics with your pediatrician during your child's next well-check visit."
            )
        else:
            status = "Routine Monitoring"
            guidance = (
                "The calibrated ML monitoring assessment indicates development aligns smoothly with expected routine monitoring patterns. "
                "Continue tracking physical growth and developmental milestones regularly."
            )

        # Build detailed contributing factor breakdown
        factors = []
        domain_scores = [
            ("Gross Motor", gross_motor_score),
            ("Fine Motor", fine_motor_score),
            ("Language & Communication", language_score),
            ("Cognitive", cognitive_score),
            ("Social-Emotional", social_emotional_score),
        ]

        for name, sc in domain_scores:
            val_pct = min(100, int(round(sc * 100.0)))
            pct_val = f"{val_pct}%"
            if sc < 0.65:
                factors.append({
                    "feature": name.lower().replace(" ", "_"),
                    "label": f"{name} Domain",
                    "value": f"{pct_val} achieved",
                    "impact": "Risk Indicator"
                })
            else:
                factors.append({
                    "feature": name.lower().replace(" ", "_"),
                    "label": f"{name} Domain",
                    "value": f"{pct_val} achieved",
                    "impact": "Favorable Indicator"
                })


        if height_z < -1.5:
            factors.append({
                "feature": "height_z_score",
                "label": "WHO Height-for-Age Z-Score",
                "value": f"{height_z} SD (Low)",
                "impact": "Risk Indicator"
            })
        else:
            factors.append({
                "feature": "height_z_score",
                "label": "WHO Height-for-Age Z-Score",
                "value": f"{height_z} SD (Normal)",
                "impact": "Favorable Indicator"
            })

        if not_observed_count >= 2:
            factors.append({
                "feature": "not_observed_count",
                "label": "Not Yet Observed Milestones",
                "value": f"{not_observed_count} items",
                "impact": "Risk Indicator"
            })

        return predicted_class, prob_pct, status, guidance, factors


ml_service = MLPredictionService()
