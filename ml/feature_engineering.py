"""
Feature Engineering and Preprocessing Pipeline for Smart Growth Tracker.
Defines 18 comprehensive features including WHO Z-scores & domain interaction metrics.
"""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

# 18 Standard input feature column names expected by the ML model
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

NUMERICAL_FEATURES = [
    "age_months",
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

PASSTHROUGH_FEATURES = ["sex"]


def build_preprocessor():
    """
    Builds a robust ColumnTransformer that imputes missing numerical values
    and scales features for model training and inference.
    """
    numerical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_transformer, NUMERICAL_FEATURES),
            ("pass", "passthrough", PASSTHROUGH_FEATURES)
        ],
        remainder="drop"
    )
    
    return preprocessor
