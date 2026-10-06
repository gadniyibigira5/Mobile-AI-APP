"""Rejection prediction model module for MilkCheck (A3)."""

import math
import numpy as np
import pandas as pd


def sigmoid(z: float) -> float:
    """Compute the logistic sigmoid function."""
    return 1.0 / (1.0 + math.exp(-z))


def make_features(temp, hours=None) -> np.ndarray:
    """Extract and scale feature matrix X without intercept column.

    Scales temp_c by /10 and hours_since_milking by /10.
    Returns 2D NumPy array of shape (N, 2).
    """
    if isinstance(temp, pd.DataFrame):
        df = temp
        if df.empty:
            return np.empty((0, 2))
        temp_col = "temp_c" if "temp_c" in df.columns else ("temp" if "temp" in df.columns else None)
        temp_vals = df[temp_col].astype(float).values / 10.0 if temp_col else np.zeros(len(df))
        hours_col = "hours_since_milking" if "hours_since_milking" in df.columns else None
        hours_vals = df[hours_col].astype(float).values / 10.0 if hours_col else np.zeros(len(df))
    else:
        temp_vals = np.array(temp, dtype=float) / 10.0
        hours_vals = np.array(hours, dtype=float) / 10.0 if hours is not None else np.zeros(len(temp_vals))

    return np.column_stack([temp_vals, hours_vals])


def risk_label(prob: float) -> str:
    """Classify rejection risk probability into 'Low', 'Medium', or 'High'."""
    if prob < 0.3:
        return "Low"
    elif prob < 0.6:
        return "Medium"
    else:
        return "High"


def fit_logistic(X, y=None, lr: float = 0.1, steps: int = 1000, epochs: int = None):
    """Fit logistic regression weights (w, b) using gradient descent."""
    num_steps = epochs if epochs is not None else steps

    if isinstance(X, pd.DataFrame):
        df = X
        if df.empty or "rejected" not in df.columns:
            return np.zeros(2), 0.0
        y = df["rejected"].astype(float).values
        X_mat = make_features(df)
    else:
        X_mat = np.array(X, dtype=float)
        y = np.array(y, dtype=float)

    m = len(y)
    if m == 0:
        return np.zeros(X_mat.shape[1]), 0.0

    w = np.zeros(X_mat.shape[1])
    b = 0.0

    for _ in range(num_steps):
        z = np.dot(X_mat, w) + b
        predictions = 1.0 / (1.0 + np.exp(-z))
        errors = predictions - y

        dw = np.dot(X_mat.T, errors) / m
        db = np.sum(errors) / m

        w -= lr * dw
        b -= lr * db

    return w, float(b)


def predict_risk(*args, **kwargs) -> float:
    """Predict rejection probability.

    Supports calls as:
    - predict_risk(w, b, temp_c, hours_since_milking)
    - predict_risk(weights_tuple_or_array, temp_c, hours_since_milking)
    """
    if len(args) == 4:
        w, b, temp_c, hours_since_milking = args
    elif len(args) == 3:
        weights, temp_c, hours_since_milking = args
        if isinstance(weights, tuple):
            w, b = weights
        else:
            w = weights
            b = 0.0
    else:
        w = kwargs.get("w", np.zeros(2))
        b = kwargs.get("b", 0.0)
        temp_c = kwargs.get("temp_c", 0.0)
        hours_since_milking = kwargs.get("hours_since_milking", 0.0)

    x = np.array([float(temp_c) / 10.0, float(hours_since_milking) / 10.0])
    z = float(np.dot(x, w) + b)
    return round(sigmoid(z), 4)


class MilkRejectionModel:
    """Simple Logistic Regression model wrapper for MilkCheck."""

    def __init__(self):
        self.weights = (np.zeros(2), 0.0)

    def fit(self, df: pd.DataFrame, lr: float = 0.1, steps: int = 1000):
        """Fit model weights using gradient descent."""
        self.weights = fit_logistic(df, lr=lr, steps=steps)

    def predict_proba(self, temp_c: float, hours_since_milking: float) -> float:
        """Predict rejection probability for a single record."""
        return predict_risk(self.weights, temp_c, hours_since_milking)

    def predict(self, temp_c: float, hours_since_milking: float) -> dict:
        """Predict probability and risk label for a single record."""
        prob = self.predict_proba(temp_c, hours_since_milking)
        return {
            "rejection_prob": prob,
            "risk_label": risk_label(prob),
        }
