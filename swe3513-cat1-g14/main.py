import sys
from pathlib import Path

# Make the src/ folder importable, so `milkcheck` can be found no matter
# which directory uvicorn was started from.
SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from milkcheck.data import load_deliveries, clean_deliveries
from milkcheck.model import MilkRejectionModel, risk_label
from milkcheck.stats import summary_by_sector, compute_summary_stats

app = FastAPI(
    title="Milk Check AI Decision Support API",
    description="Unified backend connecting SWE 3409 Mobile App and SWE 3513 Applied AI Model.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model_instance = None
_cleaned_data_cache = None


def get_cleaned_data():
    """Load and clean the delivery dataset once, and cache it."""
    global _cleaned_data_cache
    if _cleaned_data_cache is None:
        df = load_deliveries()
        _cleaned_data_cache = clean_deliveries(df)
    return _cleaned_data_cache


def get_trained_model():
    """Load historical data, clean it, and train the logistic regression model."""
    global _model_instance
    if _model_instance is None:
        try:
            df = get_cleaned_data()
            _model_instance = MilkRejectionModel()
            _model_instance.fit(df)
        except Exception:
            _model_instance = MilkRejectionModel()
    return _model_instance


class MilkDeliveryInput(BaseModel):
    farmer_id: str = Field(..., example="FRM-0012")
    litres: float = Field(..., gt=0, example=25.0)
    temperature: float = Field(..., ge=0, le=45, example=18.5)
    hours_since_milking: float = Field(..., ge=0, example=1.5)


class ChatInput(BaseModel):
    message: str


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model": "Gradient Descent Logistic Regression",
        "service": "Milk Check AI Backend",
        "version": "1.1.0",
    }


@app.post("/predict")
def predict_rejection_risk(data: MilkDeliveryInput):
    try:
        model = get_trained_model()
        probability = model.predict_proba(data.temperature, data.hours_since_milking)
        label = risk_label(probability)

        if label == "High":
            recommendation = "Reject delivery or test immediately in lab. High spoilage risk detected."
        elif label == "Medium":
            recommendation = "Accept with caution. Cool milk immediately and prioritize processing."
        else:
            recommendation = "Accept for processing. Delivery meets quality parameters."

        return {
            "farmer_id": data.farmer_id,
            "litres": data.litres,
            "risk_probability": round(float(probability), 4),
            "label": label,
            "recommendation": recommendation,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Chatbot
# ─────────────────────────────────────────────────────────────────────────────
#
# Two layers, in order:
#   1. Data questions — answer with real numbers from the cleaned CSV.
#   2. General questions — the original canned replies, plus a few more.
#
# Data questions are tried first, because they are the most impressive and the
# most specific. If the message does not look like a data question, we fall
# through to the general replies.

def _reply_data(msg: str):
    """Return a string reply if `msg` looks like a data question, else None."""
    try:
        df = get_cleaned_data()
        stats = compute_summary_stats(df)
    except Exception:
        return None

    # How many deliveries?
    if any(w in msg for w in ["how many", "count", "number of deliveries", "total deliveries"]):
        return (
            f"There are {stats['total_deliveries']} clean deliveries in the dataset. "
            f"Total volume collected: {stats['total_litres']} litres."
        )

    # Total litres
    if any(w in msg for w in ["total litres", "total liters", "how many litres", "how many liters", "volume collected"]):
        return (
            f"The centre has collected {stats['total_litres']} litres across "
            f"{stats['total_deliveries']} deliveries. "
            f"Average per delivery: {stats['mean_litres']} L."
        )

    # Rejection rate
    if any(w in msg for w in ["rejection rate", "reject rate", "how many rejected", "how many rejections"]):
        rate_pct = round(stats["rejection_rate"] * 100, 1)
        return (
            f"The overall rejection rate is {rate_pct}% "
            f"({int(round(stats['rejection_rate'] * stats['total_deliveries']))} of "
            f"{stats['total_deliveries']} deliveries were rejected)."
        )

    # Temperature average
    if any(w in msg for w in ["average temperature", "mean temp", "average temp"]):
        return (
            f"The mean arrival temperature is {stats['mean_temp_c']} °C. "
            f"Above 20 °C, bacterial growth accelerates sharply and rejection risk rises."
        )

    # Which sector has the most litres?
    if any(w in msg for w in ["which sector", "top sector", "best sector", "most litres", "most milk"]):
        try:
            summary = summary_by_sector(df)
            if len(summary) > 0:
                top = summary.iloc[0]
                return (
                    f"{top['sector']} has the highest total volume at "
                    f"{round(float(top['total_litres']), 1)} L across "
                    f"{int(top['deliveries'])} deliveries."
                )
        except Exception:
            pass
        return "I could not compute the sector summary right now."

    # Summary of all sectors
    if any(w in msg for w in ["summary", "by sector", "per sector", "all sectors", "sector breakdown"]):
        try:
            summary = summary_by_sector(df)
            lines = ["Summary by sector:"]
            for _, row in summary.iterrows():
                rate_pct = round(float(row["rejection_rate"]) * 100, 1)
                lines.append(
                    f"  • {row['sector']}: {int(row['deliveries'])} deliveries, "
                    f"{round(float(row['total_litres']), 1)} L, {rate_pct}% rejected"
                )
            return "\n".join(lines)
        except Exception:
            return "I could not build the sector summary right now."

    # Sectors we serve
    if any(w in msg for w in ["sector", "sectors", "collection centre", "collection center", "coverage"]):
        return (
            "The centre serves five sectors around Kinigi: "
            "Kinigi, Nyange, Busogo, Gataraga, and Shingiro."
        )

    return None


def _reply_general(msg: str) -> str:
    """Return a general-purpose reply when the message is not a data question."""
    # Greeting
    if any(w in msg for w in ["hello", "hi ", "hey", "good morning", "good afternoon", "good evening", "muraho"]):
        return "Hello! I am the Milk Check assistant. I can help with delivery recording, temperature guidance, rejection risk, and summaries of the collection data."

    # Thanks
    if any(w in msg for w in ["thank", "thanks", "asante", "murakoze"]):
        return "You are welcome. If you need anything else about milk quality or collection, just ask."

    # Location / country
    if any(w in msg for w in ["where", "location", "country", "rwanda", "kinigi"]):
        return (
            "This system is built for the Kinigi milk collection centre in Rwanda, "
            "serving farmers from Kinigi, Nyange, Busogo, Gataraga, and Shingiro."
        )

    # How to record a delivery
    if any(w in msg for w in ["how", "record", "entry", "input", "delivery", "form"]):
        return (
            "To record a delivery, open the 'New Milk Delivery Assessment' screen, "
            "enter the Farmer ID (for example FRM-0012), the milk volume in litres, "
            "the temperature in °C, and the hours since milking, then tap "
            "'Check Milk Risk'."
        )

    # Temperature
    if any(w in msg for w in ["temp", "heat", "degree", "cold", "warm"]):
        return (
            "Milk temperature should stay as low as possible. Above 20 °C, "
            "bacterial growth accelerates and rejection risk rises sharply. "
            "Cool the milk quickly if it arrives warm."
        )

    # Risk / rejection
    if any(w in msg for w in ["reject", "risk", "fail", "bad", "spoil", "unsafe"]):
        return (
            "Rejection risk is estimated by a logistic regression model that uses "
            "two inputs: milk temperature and hours since milking. The model returns "
            "a probability between 0 and 1, which is shown as Low, Medium, or High."
        )

    # Farmer IDs
    if any(w in msg for w in ["farmer", "id", "frm", "collector"]):
        return (
            "Farmers are registered with unique IDs in the format FRM-XXXX, "
            "for example FRM-0012. The ID is used to track milk quality trends "
            "for each farmer over time."
        )

    # Lab / testing
    if any(w in msg for w in ["lab", "test", "testing", "laboratory"]):
        return (
            "Laboratory testing remains the final authority on whether milk is safe. "
            "This system is a decision-support tool: it warns the collector early, "
            "but it does not replace the lab."
        )

    # Litres / limits
    if any(w in msg for w in ["litres", "liters", "maximum", "limit", "how much"]):
        return (
            "A single delivery must be more than 0 and at most 60 litres. "
            "Milk temperature on arrival must be between 0 and 45 °C, and the "
            "hours since milking must be between 0 and 24."
        )

    # Model
    if any(w in msg for w in ["model", "ai", "algorithm", "machine learning", "logistic"]):
        return (
            "The model is logistic regression trained by gradient descent on "
            "historical deliveries. Its two input features are temperature and "
            "hours since milking. Its output is a rejection probability between 0 and 1."
        )

    # Fallback
    return (
        f"I do not have a specific answer for '{msg}', but I can help with: "
        "recording a delivery, safe temperature ranges, rejection risk, "
        "farmer IDs, sector summaries, delivery counts, and total litres collected."
    )


@app.post("/chat")
def chat_with_ai(data: ChatInput):
    try:
        msg = data.message.lower().strip()

        # 1. Try data questions first
        data_reply = _reply_data(msg)
        if data_reply is not None:
            return {"reply": data_reply}

        # 2. Fall back to general replies
        return {"reply": _reply_general(msg)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)