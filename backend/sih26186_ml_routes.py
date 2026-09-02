"""Optional SIH26186 ML + Gemini routes registered by sih26186_server."""
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

from fastapi import HTTPException
from pydantic import BaseModel, Field

from ml.inference import FEATURES, MODEL_PATH, THRESHOLD, OPENMP_STATUS, predict
from ml.gemini_service import generate_supportive_response


GEMINI_RESPONSE_BUDGET_SECONDS = 8


class SIH26186MLRequest(BaseModel):
    Q29_Total: float = Field(..., ge=17, le=85)
    Q12_weapon: float = Field(..., ge=0, le=1)
    Q13_feltdie: float = Field(..., ge=0, le=1)
    Q23a_cutdowntime: float = Field(..., ge=0, le=1)
    Q23b_Accomplished_less: float = Field(..., ge=0, le=1)
    Q23c_limited_work: float = Field(..., ge=0, le=1)
    Q23d_difficulty_performing: float = Field(..., ge=0, le=1)
    generate_response: bool = True


def _fallback_supportive_response(result: dict) -> str:
    if result.get("signal") == "elevated":
        return (
            "Your responses produced an elevated research welfare-risk signal. "
            "This is not a clinical diagnosis. Consider a timely check-in with an "
            "appropriate welfare officer or qualified support professional, and "
            "where possible prioritise rest, recovery and practical workload support."
        )
    return (
        "Your responses produced a lower research welfare-risk signal. This is not "
        "a clinical diagnosis. Continue healthy recovery practices and seek human "
        "support whenever your wellbeing or workload feels difficult to manage."
    )


def _generate_response_with_budget(result: dict):
    executor = ThreadPoolExecutor(max_workers=1)
    future = executor.submit(generate_supportive_response, result)
    try:
        return future.result(timeout=GEMINI_RESPONSE_BUDGET_SECONDS), "gemini", None
    except FuturesTimeout:
        future.cancel()
        return _fallback_supportive_response(result), "deterministic_timeout_fallback", (
            f"Gemini did not respond within {GEMINI_RESPONSE_BUDGET_SECONDS} seconds"
        )
    except Exception as exc:
        return _fallback_supportive_response(result), "deterministic_fallback", str(exc)
    finally:
        executor.shutdown(wait=False, cancel_futures=True)


def register_ml_routes(app):
    @app.get("/api/sih26186/ml/health")
    def ml_health():
        model_present = MODEL_PATH.is_file()
        return {
            "status": "ready" if model_present else "unavailable",
            "model": "LightGBM",
            "threshold": THRESHOLD,
            "features": FEATURES,
            "research_only": True,
            "model_present": model_present,
            "model_path": str(MODEL_PATH),
            "openmp_status": OPENMP_STATUS,
        }

    @app.post("/api/sih26186/ml/predict")
    def ml_predict(request: SIH26186MLRequest):
        try:
            return predict(
                request.model_dump(exclude={"generate_response"}),
                include_explanation=True,
            )
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"ML inference failed: {type(exc).__name__}: {str(exc)}")

    @app.post("/api/sih26186/ml/analyze")
    def ml_analyze(request: SIH26186MLRequest):
        try:
            result = predict(
                request.model_dump(exclude={"generate_response"}),
                include_explanation=True,
            )
            if request.generate_response:
                response, source, error = _generate_response_with_budget(result)
                result["supportive_response"] = response
                result["response_source"] = source
                if error:
                    result["llm_error"] = error
            else:
                result["supportive_response"] = None
                result["response_source"] = "disabled"
            return result
        except FileNotFoundError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"ML analysis failed: {type(exc).__name__}")
