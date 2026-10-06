"""FastAPI web service module for MilkCheck (A4)."""

import math
import re
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from milkcheck.data import load_deliveries, clean_deliveries
from milkcheck.stats import summary_by_sector
from milkcheck.model import MilkRejectionModel, risk_label

app = FastAPI(title="MilkCheck API")

_model_instance = None


def get_cleaned_data():
    """Load and clean delivery dataset."""
    df = load_deliveries()
    return clean_deliveries(df)


def get_trained_model() -> MilkRejectionModel:
    """Retrieve or train global MilkRejectionModel instance."""
    global _model_instance
    if _model_instance is None:
        df = get_cleaned_data()
        _model_instance = MilkRejectionModel()
        _model_instance.fit(df)
    return _model_instance


def sanitize_float(val: float) -> float:
    """Ensure float value is JSON compliant (converts NaN or Inf to 0.0)."""
    if val is None or math.isnan(val) or math.isinf(val):
        return 0.0
    return float(val)


class DeliveryRequest(BaseModel):
    farmer_id: str = Field(...)
    litres: float = Field(...)
    temp_c: float = Field(...)
    hours: float = Field(...)

    @field_validator("farmer_id")
    @classmethod
    def validate_farmer_id(cls, v: str) -> str:
        if not re.match(r"^FRM-\d{4}$", v):
            raise ValueError("farmer_id must match pattern FRM-XXXX where X are digits")
        return v

    @field_validator("litres")
    @classmethod
    def validate_litres(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("litres must be positive")
        return v

    @field_validator("temp_c")
    @classmethod
    def validate_temp_c(cls, v: float) -> float:
        if v < 0 or v > 50:
            raise ValueError("temp_c must be between 0 and 50")
        return v

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v < 0:
            raise ValueError("hours must be non-negative")
        return v


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/summary")
def get_summary():
    df = get_cleaned_data()
    summary = summary_by_sector(df)
    if hasattr(summary, "to_dict"):
        return summary.to_dict(orient="records")
    return summary


@app.get("/risk")
def get_risk(
    temp_c: float = Query(...),
    hours: float = Query(...)
):
    if temp_c < 0 or temp_c > 50 or hours < 0:
        raise HTTPException(status_code=422, detail="Invalid temperature or hours range")

    model = get_trained_model()
    prob = sanitize_float(model.predict_proba(temp_c, hours))
    lbl = risk_label(prob)

    return {
        "temp_c": temp_c,
        "hours": hours,
        "risk": prob,
        "label": lbl,
    }


@app.post("/deliveries")
def create_delivery(req: DeliveryRequest):
    model = get_trained_model()
    prob = sanitize_float(model.predict_proba(req.temp_c, req.hours))

    return {
        "farmer_id": req.farmer_id,
        "accepted": prob < 0.5,
    }
