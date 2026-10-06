"""Summary statistics module for MilkCheck (A2)."""

import pandas as pd


def litres_by_day(df: pd.DataFrame) -> pd.DataFrame:
    """Group delivery records by date and calculate total litres per day.

    Returns a DataFrame with columns: ['date', 'total_litres'].
    """
    if df.empty or "date" not in df.columns or "litres" not in df.columns:
        return pd.DataFrame(columns=["date", "total_litres"])

    df_copy = df.copy()
    if hasattr(df_copy["date"], "dt"):
        df_copy["date"] = df_copy["date"].dt.date

    result = df_copy.groupby("date", as_index=False)["litres"].sum()
    result = result.rename(columns={"litres": "total_litres"})
    return result


def summary_by_sector(df: pd.DataFrame) -> pd.DataFrame:
    """Compute summary statistics aggregated by sector.

    Returns a DataFrame with columns:
    ['sector', 'deliveries', 'total_litres', 'rejection_rate']
    """
    if df.empty or "sector" not in df.columns:
        return pd.DataFrame(columns=["sector", "deliveries", "total_litres", "rejection_rate"])

    has_rejected = "rejected" in df.columns

    summary = df.groupby("sector").agg(
        deliveries=("delivery_id" if "delivery_id" in df.columns else "litres", "count"),
        total_litres=("litres", "sum"),
        rejection_rate=("rejected" if has_rejected else "litres", lambda x: float(x.mean()) if has_rejected else 0.0),
    ).reset_index()

    summary = summary.sort_values(by=["total_litres", "sector"], ascending=[False, True]).reset_index(drop=True)
    return summary


def compute_summary_stats(df: pd.DataFrame) -> dict:
    """Compute overall summary statistics across all delivery records."""
    if df.empty:
        return {
            "total_deliveries": 0,
            "total_litres": 0.0,
            "mean_litres": 0.0,
            "mean_temp_c": 0.0,
            "rejection_rate": 0.0,
            "sector_breakdown": {},
        }

    total_deliveries = int(len(df))
    total_litres = float(df["litres"].sum()) if "litres" in df.columns else 0.0
    mean_litres = float(df["litres"].mean()) if "litres" in df.columns else 0.0

    temp_col = "temp_c" if "temp_c" in df.columns else ("temp" if "temp" in df.columns else None)
    mean_temp_c = float(df[temp_col].mean()) if temp_col and temp_col in df.columns else 0.0

    rejection_rate = 0.0
    if "rejected" in df.columns:
        rejection_rate = float(df["rejected"].mean())

    sector_breakdown = {}
    if "sector" in df.columns:
        sector_counts = df["sector"].value_counts().to_dict()
        sector_breakdown = {str(k): int(v) for k, v in sector_counts.items()}

    return {
        "total_deliveries": total_deliveries,
        "total_litres": round(total_litres, 2),
        "mean_litres": round(mean_litres, 2),
        "mean_temp_c": round(mean_temp_c, 2),
        "rejection_rate": round(rejection_rate, 4),
        "sector_breakdown": sector_breakdown,
    }
