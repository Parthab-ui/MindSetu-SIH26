"""Optional SIH26186 ML + Gemini routes registered by sih26186_server."""
from fastapi import HTTPException
from pydantic import BaseModel, Field

from ml.inference import FEATURES, predict
from ml.gemini_service import generate_supportive_response


class SIH26186MLRequest(BaseModel):
    Q29_Total: float = Field(...)
    Q12_weapon: float = Field(...)
    Q13_feltdie: float = Field(...)
    Q23a_cutdowntime: float = Field(...)
    Q23b_Accomplished_less: float = Field(...)
    Q23c_limited_work: float = Field(...)
    Q23d_difficulty_performing: float = Field(...)
    generate_response: bool = True


def register_ml_routes(app):
    @app.get("/api/sih26186/ml/health")
    def ml_health():
        return {"status":"ready","model":"LightGBM","threshold":0.45,"features":FEATURES,"research_only":True}

    @app.post("/api/sih26186/ml/predict")
    def ml_predict(request: SIH26186MLRequest):
        try:
            result = predict(request.model_dump(exclude={"generate_response"}), include_explanation=True)
            return result
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

    @app.post("/api/sih26186/ml/analyze")
    def ml_analyze(request: SIH26186MLRequest):
        try:
            result = predict(request.model_dump(exclude={"generate_response"}), include_explanation=True)
            if request.generate_response:
                try:
                    result["supportive_response"] = generate_supportive_response(result)
                except Exception as exc:
                    result["supportive_response"] = None
                    result["llm_error"] = str(exc)
            return result
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
