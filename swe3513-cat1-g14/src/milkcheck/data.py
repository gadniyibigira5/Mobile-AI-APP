"""Data loading and cleaning module for MilkCheck (A1)."""

from pathlib import Path
from typing import Optional, Union
import pandas as pd

DEFAULT_DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "deliveries.csv"

REQUIRED_COLUMNS = {
    "delivery_id",
    "date",
    "sector",
    "farmer_id",
    "litres",
    "temp_c",
}


def load_deliveries(file_path: Optional[Union[str, Path]] = None) -> pd.DataFrame:
    """Load milk delivery records from a CSV file into a pandas DataFrame."""
    if file_path is None:
        path = DEFAULT_DATA_PATH
    else:
        path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])

    return df


def clean_deliveries(df: pd.DataFrame) -> pd.DataFrame:
    """Clean delivery records according to validation rules."""
    cleaned = df.copy()

    # Standardize sector names to Title case
    if "sector" in cleaned.columns:
        cleaned["sector"] = cleaned["sector"].astype(str).str.strip().str.title()

    # Strip spaces and uppercase farmer_id
    if "farmer_id" in cleaned.columns:
        cleaned["farmer_id"] = cleaned["farmer_id"].astype(str).str.strip().str.upper()

    # Remove rows with missing essential fields
    cleaned = cleaned.dropna(subset=["farmer_id", "temp_c"])

    # Filter invalid numeric values
    if "litres" in cleaned.columns:
        cleaned = cleaned[(cleaned["litres"] > 0) & (cleaned["litres"] <= 100)]

    if "temp_c" in cleaned.columns:
        cleaned = cleaned[(cleaned["temp_c"] >= 0) & (cleaned["temp_c"] <= 45)]

    # Deduplicate delivery_id
    if "delivery_id" in cleaned.columns:
        cleaned = cleaned.drop_duplicates(subset=["delivery_id"], keep="first")

    return cleaned
