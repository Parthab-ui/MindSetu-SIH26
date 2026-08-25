"""Runtime safety guard for the SIH26186 welfare prototype.

Python imports sitecustomize automatically at interpreter startup when this
module is on sys.path. We use it to keep welfare recommendations concise and
non-meta if the local LLM returns hidden reasoning/instruction text.
"""

import json
import os
import threading
import time

import requests


_ORIGINAL_POST = requests.post
_BAD_MARKERS = (
    "okay, the user",
    "first i need",
    "hmm",
    "the user wants me to",
    "they've provided",
    "i need to understand",
    "must avoid labeling",
    "the assistant",
    "provided specific metrics",
    "parse all the data points",
)


def _fallback_for_risk(risk):
    risk = (risk or "low").lower()
    if risk == "high":
        return (
            "Prioritise a prompt welfare check-in. Review non-essential workload "
            "and protect recovery time. Connect with the appropriate welfare or "
            "qualified professional support channel."
        )
    if risk == "moderate":
        return (
            "Schedule a welfare follow-up, review duty load and recovery time, "
            "and consider protected rest or a temporary workload adjustment."
        )
    return (
        "Maintain regular rest and workload practices. Continue routine welfare "
        "check-ins, especially after major duty changes, and seek appropriate "
        "support if stress increases."
    )


def _looks_like_meta_reasoning(text):
    if not text:
        return True
    low = text.strip().lower()
    return len(text) > 900 or any(marker in low for marker in _BAD_MARKERS)


def _patched_post(url, *args, **kwargs):
    response = _ORIGINAL_POST(url, *args, **kwargs)

    if response.status_code != 200 or "/api/chat" not in str(url):
        return response

    payload = kwargs.get("json") or {}
    messages = payload.get("messages") or []
    combined = "\n".join(str(m.get("content", "")) for m in messages)

    # Guard only the SIH26186 welfare recommendation request.
    if "SIH26186" not in combined or "welfare recommendation" not in combined.lower():
        return response

    try:
        data = response.json()
        content = ((data.get("message") or {}).get("content") or "").strip()
        if _looks_like_meta_reasoning(content):
            risk = "low"
            for candidate in ("high", "moderate", "low"):
                if f"risk level: {candidate}" in combined.lower():
                    risk = candidate
                    break
            data.setdefault("message", {})["content"] = _fallback_for_risk(risk)
            response._content = json.dumps(data).encode("utf-8")
    except (ValueError, TypeError, AttributeError):
        pass

    return response


requests.post = _patched_post


def _cleanup_existing_rows():
    """Replace already-stored meta-reasoning recommendations when possible."""
    try:
        import psycopg

        db_name = os.getenv("DB_NAME", "mindsetu_db")
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_host = os.getenv("DB_HOST", "127.0.0.1")
        db_port = os.getenv("DB_PORT", "5432")

        conninfo = (
            f"host={db_host} port={db_port} dbname={db_name} "
            f"user={db_user} password={db_password}"
        )
        with psycopg.connect(conninfo, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE sih26186_analysis
                    SET recommendation = CASE
                        WHEN lower(recommendation) LIKE '%okay, the user%'
                          OR lower(recommendation) LIKE '%first i need%'
                          OR lower(recommendation) LIKE '%the user wants me to%'
                          OR lower(recommendation) LIKE '%provided specific metrics%'
                          OR lower(recommendation) LIKE '%parse all the data points%'
                        THEN CASE lower(risk_level)
                            WHEN 'high' THEN 'Prioritise a prompt welfare check-in. Review non-essential workload and protect recovery time. Connect with the appropriate welfare or qualified professional support channel.'
                            WHEN 'moderate' THEN 'Schedule a welfare follow-up, review duty load and recovery time, and consider protected rest or a temporary workload adjustment.'
                            ELSE 'Maintain regular rest and workload practices. Continue routine welfare check-ins, especially after major duty changes, and seek appropriate support if stress increases.'
                        END
                        ELSE recommendation
                    END
                    WHERE lower(recommendation) LIKE '%okay, the user%'
                       OR lower(recommendation) LIKE '%first i need%'
                       OR lower(recommendation) LIKE '%the user wants me to%'
                       OR lower(recommendation) LIKE '%provided specific metrics%'
                       OR lower(recommendation) LIKE '%parse all the data points%';
                    """
                )
    except Exception:
        pass


threading.Thread(target=_cleanup_existing_rows, daemon=True).start()
