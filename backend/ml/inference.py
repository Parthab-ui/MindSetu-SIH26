"""Production inference wrapper for the validated LightGBM research baseline."""
from functools import lru_cache
from pathlib import Path
import os
import joblib
import numpy as np
import pandas as pd

BASE = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("SIH26186_ML_MODEL", str(BASE / "lightgbm_multiplesymptoms.joblib")))
THRESHOLD = float(os.getenv("SIH26186_ML_THRESHOLD", "0.45"))
FEATURES = ["Q29_Total", "Q12_weapon", "Q13_feltdie", "Q23a_cutdowntime", "Q23b_Accomplished_less", "Q23c_limited_work", "Q23d_difficulty_performing"]
LABELS = {"Q29_Total":"wellbeing score", "Q12_weapon":"weapon exposure indicator", "Q13_feltdie":"perceived life-threat indicator", "Q23a_cutdowntime":"reduced work time", "Q23b_Accomplished_less":"accomplished less work", "Q23c_limited_work":"limited work capacity", "Q23d_difficulty_performing":"difficulty performing duties"}

@lru_cache(maxsize=1)
def _load():
    if not MODEL_PATH.exists(): raise FileNotFoundError(f"ML model not found: {MODEL_PATH}")
    bundle = joblib.load(MODEL_PATH)
    missing = [f for f in FEATURES if f not in bundle.get("features", [])]
    if missing: raise RuntimeError(f"Model is missing required features: {missing}")
    return bundle["pipeline"]

def _shap_values(pipe, row):
    try:
        import shap
        pre = pipe.named_steps["preprocess"]; model = pipe.named_steps["model"]
        transformed = pre.transform(row); names = pre.get_feature_names_out()
        values = shap.TreeExplainer(model).shap_values(transformed)
        if isinstance(values, list): values = values[1]
        vals = np.asarray(values)[0]
        return sorted(zip(names, vals), key=lambda x: abs(float(x[1])), reverse=True)
    except Exception:
        return []

def predict(features: dict, include_explanation: bool = True) -> dict:
    missing = [f for f in FEATURES if f not in features]
    if missing: raise ValueError(f"Missing ML features: {missing}")
    row = pd.DataFrame([{f: features[f] for f in FEATURES}])
    pipe = _load(); probability = float(pipe.predict_proba(row)[0, 1])
    result = {"probability":round(probability,4), "threshold":THRESHOLD, "signal":"elevated" if probability >= THRESHOLD else "lower", "model":"LightGBM", "target":"multiplesymptoms_case", "research_only":True, "clinical_diagnosis":False, "contributors":[]}
    if include_explanation:
        for name, value in _shap_values(pipe, row)[:5]:
            feature = str(name).split("__")[-1]
            result["contributors"].append({"feature":feature,"label":LABELS.get(feature,feature),"shap_value":round(float(value),4),"direction":"increases signal" if value > 0 else "decreases signal"})
    return result
