"""
Enhanced Dataset Generator for Smart Growth Tracker ML Model.
Generates 3,000 synthetic child records with WHO-aligned Z-scores,
CDC domain milestone performance, and cross-domain interaction metrics.
"""

import os
import json
import numpy as np
import pandas as pd

np.random.seed(42)


def calculate_who_z_scores(age_months: int, sex: int, height_cm: float, weight_kg: float, bmi: float):
    """
    Computes WHO growth standard Z-score approximations for height-for-age,
    weight-for-age, and BMI-for-age.
    """
    # WHO Median and SD approximations
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


def generate_growth_and_milestone_dataset(num_samples=3000, output_path=None):
    records = []

    for i in range(num_samples):
        age_months = int(np.random.choice(range(1, 61)))
        sex = int(np.random.choice([0, 1]))

        # Base physical stats
        if age_months <= 24:
            base_height = 50.0 + age_months * 1.05
            base_weight = 3.3 + age_months * 0.42
        else:
            base_height = 50.0 + 24 * 1.05 + (age_months - 24) * 0.6
            base_weight = 3.3 + 24 * 0.42 + (age_months - 24) * 0.22

        sex_adj_h = 0.8 if sex == 1 else 0.0
        sex_adj_w = 0.3 if sex == 1 else 0.0

        height_cm = round(float(np.random.normal(base_height + sex_adj_h, 3.2)), 1)
        weight_kg = round(float(np.random.normal(base_weight + sex_adj_w, 1.1)), 2)

        height_cm = max(42.0, min(130.0, height_cm))
        weight_kg = max(2.2, min(35.0, weight_kg))

        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m ** 2), 2)

        height_z, weight_z, bmi_z = calculate_who_z_scores(age_months, sex, height_cm, weight_kg, bmi)

        # Milestone scores simulation across 5 domains
        # 78% typical development, 22% varying delay patterns (isolated speech delay, motor delay, or multi-domain)
        delay_type = np.random.choice(["none", "speech_only", "motor_only", "global"], p=[0.78, 0.08, 0.07, 0.07])

        if delay_type == "none":
            gm_score = np.random.beta(9, 1.5)
            fm_score = np.random.beta(9, 1.5)
            lang_score = np.random.beta(9, 1.5)
            cog_score = np.random.beta(9, 1.5)
            soc_score = np.random.beta(9, 1.5)
            not_obs = np.random.poisson(0.3)
            unsure = np.random.poisson(0.3)
        elif delay_type == "speech_only":
            gm_score = np.random.beta(8, 2)
            fm_score = np.random.beta(8, 2)
            lang_score = np.random.beta(3, 7)  # Significant isolated speech delay
            cog_score = np.random.beta(7, 3)
            soc_score = np.random.beta(6, 4)
            not_obs = np.random.poisson(2.0)
            unsure = np.random.poisson(1.2)
        elif delay_type == "motor_only":
            gm_score = np.random.beta(3, 7)  # Significant gross motor delay
            fm_score = np.random.beta(4, 6)
            lang_score = np.random.beta(8, 2)
            cog_score = np.random.beta(8, 2)
            soc_score = np.random.beta(8, 2)
            not_obs = np.random.poisson(2.2)
            unsure = np.random.poisson(1.5)
        else:  # global delay
            gm_score = np.random.beta(3.5, 6.5)
            fm_score = np.random.beta(3.5, 6.5)
            lang_score = np.random.beta(3, 7)
            cog_score = np.random.beta(3.5, 6.5)
            soc_score = np.random.beta(3.5, 6.5)
            not_obs = np.random.poisson(3.5)
            unsure = np.random.poisson(2.5)

        gm_score = round(float(np.clip(gm_score, 0.0, 1.0)), 2)
        fm_score = round(float(np.clip(fm_score, 0.0, 1.0)), 2)
        lang_score = round(float(np.clip(lang_score, 0.0, 1.0)), 2)
        cog_score = round(float(np.clip(cog_score, 0.0, 1.0)), 2)
        soc_score = round(float(np.clip(soc_score, 0.0, 1.0)), 2)

        not_obs = int(max(0, min(10, not_obs)))
        unsure = int(max(0, min(10, unsure)))

        total_q = 12
        completion_ratio = round(float(max(0.4, (total_q - unsure) / total_q)), 2)

        # Advanced interaction features
        domain_list = [gm_score, fm_score, lang_score, cog_score, soc_score]
        avg_domain_score = round(float(np.mean(domain_list)), 2)
        min_domain_score = round(float(np.min(domain_list)), 2)
        domain_score_std = round(float(np.std(domain_list)), 2)

        # Target label logic: 1 = Additional Monitoring Recommended
        # Triggered by global delay, severe single-domain drop (<0.40), physical stunting/wasting (Z-score < -2.0), or combined indicators
        is_growth_stunted = height_z < -2.0 or weight_z < -2.0 or bmi_z < -2.0 or bmi_z > 2.5
        
        if (
            avg_domain_score < 0.65
            or min_domain_score < 0.42
            or (avg_domain_score < 0.72 and not_obs >= 3)
            or (is_growth_stunted and avg_domain_score < 0.78)
            or delay_type == "global"
        ):
            monitoring_recommended = 1
        else:
            monitoring_recommended = 0

        records.append({
            "age_months": age_months,
            "sex": sex,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "bmi": bmi,
            "height_z_score": height_z,
            "weight_z_score": weight_z,
            "bmi_z_score": bmi_z,
            "gross_motor_score": gm_score,
            "fine_motor_score": fm_score,
            "language_score": lang_score,
            "cognitive_score": cog_score,
            "social_emotional_score": soc_score,
            "avg_domain_score": avg_domain_score,
            "min_domain_score": min_domain_score,
            "domain_score_std": domain_score_std,
            "not_observed_count": not_obs,
            "unsure_count": unsure,
            "completion_ratio": completion_ratio,
            "monitoring_recommended": monitoring_recommended
        })

    df = pd.DataFrame(records)

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Enhanced Dataset saved to {output_path} ({len(df)} records).")

    return df


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_csv = os.path.join(script_dir, "data", "synthetic_growth_milestones.csv")
    generate_growth_and_milestone_dataset(3000, out_csv)
