"""Evaluation and Model Card generation module for MilkCheck (A5)."""

import os
from pathlib import Path
from typing import List, Tuple, Union
import pandas as pd


def confusion(y_true: list, y_pred: list) -> dict:
    """Calculate confusion matrix counts: tp, fp, tn, fn."""
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)

    return {"tp": tp, "fp": fp, "tn": tn, "fn": fn}


def precision_recall(y_true: list, y_pred: list) -> Tuple[float, float]:
    """Calculate (precision, recall) rounded to 2 decimal places."""
    cm = confusion(y_true, y_pred)
    tp = cm["tp"]
    fp = cm["fp"]
    fn = cm["fn"]

    precision = round(tp / (tp + fp), 2) if (tp + fp) > 0 else 0.0
    recall = round(tp / (tp + fn), 2) if (tp + fn) > 0 else 0.0

    return precision, recall


def write_model_card(df: pd.DataFrame, y_prob: List[float], threshold: float = 0.5, path: Union[str, os.PathLike] = "MODEL_CARD.md"):
    """Generate and write a Markdown Model Card file."""
    y_true = df["rejected"].tolist()
    y_pred = [1 if p >= threshold else 0 for p in y_prob]

    cm = confusion(y_true, y_pred)
    prec, rec = precision_recall(y_true, y_pred)

    content = f"""# Model card: milk rejection risk

Data: {len(df)} clean deliveries
Threshold: {threshold}
Precision: {prec}
Recall: {rec}
Confusion: tp={cm['tp']} fp={cm['fp']} fn={cm['fn']} tn={cm['tn']}
Limits: Model trained on historical delivery records and intended for decision support.
"""
    file_path = Path(path)
    if file_path.parent:
        file_path.parent.mkdir(parents=True, exist_ok=True)
    
    file_path.write_text(content, encoding="utf-8")

    return file_path
