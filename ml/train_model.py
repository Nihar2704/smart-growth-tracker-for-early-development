"""
Advanced ML Training, Hyperparameter Tuning, Evaluation, Calibration, and Serialization Script.
Compares Logistic Regression, Tuned Random Forest, and Tuned Gradient Boosting.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)

from generate_dataset import generate_growth_and_milestone_dataset
from feature_engineering import build_preprocessor, FEATURE_COLUMNS


def evaluate_model_performance(model, X_test, y_test, model_name="Model"):
    """
    Computes standard evaluation metrics for a trained classifier.
    """
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    pr_auc = float(average_precision_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    metrics = {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": cm
    }
    
    print(f"--- {model_name} Metrics ---")
    print(f"  Accuracy:  {metrics['accuracy']}")
    print(f"  Precision: {metrics['precision']}")
    print(f"  Recall:    {metrics['recall']}")
    print(f"  F1 Score:  {metrics['f1_score']}")
    print(f"  ROC-AUC:   {metrics['roc_auc']}")
    print(f"  PR-AUC:    {metrics['pr_auc']}")
    print(f"  Confusion Matrix: {cm}")
    print()
    
    return metrics


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")
    csv_path = os.path.join(data_dir, "synthetic_growth_milestones.csv")
    
    # 1. Generate or load 3,000 sample dataset
    df = generate_growth_and_milestone_dataset(3000, csv_path)
    print(f"Dataset ready with {len(df)} records.")
        
    X = df[FEATURE_COLUMNS]
    y = df["monitoring_recommended"]
    
    # 2. Train / Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # 3. Model 1: Logistic Regression Baseline
    lr_pipeline = Pipeline(steps=[
        ("preprocessor", build_preprocessor()),
        ("classifier", LogisticRegression(random_state=42, max_iter=1000, C=1.0))
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_metrics = evaluate_model_performance(lr_pipeline, X_test, y_test, "Logistic Regression (Baseline)")
    
    # 4. Model 2: Tuned Random Forest
    rf_base_pipeline = Pipeline(steps=[
        ("preprocessor", build_preprocessor()),
        ("classifier", RandomForestClassifier(random_state=42))
    ])
    rf_param_grid = {
        "classifier__n_estimators": [100, 150],
        "classifier__max_depth": [6, 10, 14],
        "classifier__min_samples_split": [2, 5]
    }
    rf_grid = GridSearchCV(rf_base_pipeline, rf_param_grid, cv=5, scoring="f1", n_jobs=1)
    rf_grid.fit(X_train, y_train)
    best_rf_pipeline = rf_grid.best_estimator_
    rf_metrics = evaluate_model_performance(best_rf_pipeline, X_test, y_test, f"Tuned Random Forest (Best Params: {rf_grid.best_params_})")

    # 5. Model 3: Tuned Gradient Boosting Classifier
    gb_base_pipeline = Pipeline(steps=[
        ("preprocessor", build_preprocessor()),
        ("classifier", GradientBoostingClassifier(random_state=42))
    ])
    gb_param_grid = {
        "classifier__n_estimators": [100, 150],
        "classifier__learning_rate": [0.05, 0.1],
        "classifier__max_depth": [3, 5]
    }
    gb_grid = GridSearchCV(gb_base_pipeline, gb_param_grid, cv=5, scoring="f1", n_jobs=1)

    gb_grid.fit(X_train, y_train)
    best_gb_pipeline = gb_grid.best_estimator_
    gb_metrics = evaluate_model_performance(best_gb_pipeline, X_test, y_test, f"Tuned Gradient Boosting (Best Params: {gb_grid.best_params_})")
    
    # 6. Select Champion Model
    candidates = [
        (lr_metrics["f1_score"] + lr_metrics["roc_auc"], lr_pipeline, "Logistic Regression", lr_metrics),
        (rf_metrics["f1_score"] + rf_metrics["roc_auc"], best_rf_pipeline, "Random Forest", rf_metrics),
        (gb_metrics["f1_score"] + gb_metrics["roc_auc"], best_gb_pipeline, "Gradient Boosting", gb_metrics),
    ]
    candidates.sort(key=lambda x: x[0], reverse=True)
    
    selected_base_pipeline = candidates[0][1]
    selected_name = candidates[0][2]
    selected_metrics = candidates[0][3]
        
    print(f"[CHAMPION] Selected Champion Model: {selected_name} (F1: {selected_metrics['f1_score']}, ROC-AUC: {selected_metrics['roc_auc']})")

    
    # 7. Probability Calibration using Platt Scaling / Sigmoid Cross-Validation
    calibrated_pipeline = CalibratedClassifierCV(
        estimator=selected_base_pipeline,
        cv=5,
        method="sigmoid"
    )
    calibrated_pipeline.fit(X_train, y_train)
    
    calibrated_metrics = evaluate_model_performance(calibrated_pipeline, X_test, y_test, f"Calibrated {selected_name}")
    
    # Extract Feature Importances if available
    feature_importances = {}
    try:
        final_classifier = selected_base_pipeline.named_steps["classifier"]
        if hasattr(final_classifier, "feature_importances_"):
            importances = final_classifier.feature_importances_
            for feat, imp in zip(FEATURE_COLUMNS, importances):
                feature_importances[feat] = round(float(imp) * 100, 2)
        elif hasattr(final_classifier, "coef_"):
            coefs = np.abs(final_classifier.coef_[0])
            norm_coefs = coefs / np.sum(coefs)
            for feat, imp in zip(FEATURE_COLUMNS, norm_coefs):
                feature_importances[feat] = round(float(imp) * 100, 2)
    except Exception as e:
        print(f"Feature importance extraction warning: {e}")

    # 8. Save Model Artifacts
    saved_model_dir = os.path.join(script_dir, "..", "backend", "ml", "saved_model")
    os.makedirs(saved_model_dir, exist_ok=True)
    
    model_file_path = os.path.join(saved_model_dir, "growth_monitoring_model.joblib")
    joblib.dump(calibrated_pipeline, model_file_path)
    print(f"Saved trained & calibrated pipeline to: {model_file_path}")
    
    # Save model report summary
    report = {
        "model_version": "2.0.0",
        "selected_algorithm": selected_name,
        "calibrated": True,
        "features": FEATURE_COLUMNS,
        "feature_importances_percent": feature_importances,
        "logistic_regression_metrics": lr_metrics,
        "random_forest_metrics": rf_metrics,
        "gradient_boosting_metrics": gb_metrics,
        "calibrated_final_metrics": calibrated_metrics
    }
    
    report_file_path = os.path.join(saved_model_dir, "model_report.json")
    with open(report_file_path, "w") as f:
        json.dump(report, f, indent=2)
        
    print(f"Saved enhanced model evaluation report to: {report_file_path}")


if __name__ == "__main__":
    main()
