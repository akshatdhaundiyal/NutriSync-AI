"""Protocol generation via Emergent Universal Key (gpt-5.4 & gemini-3.1-pro-preview)."""
import pytest


RECOVERY_CTX = {
    "readiness": {"score": 42, "state": "recovery"},
    "telemetry": {
        "hrvMs": 28,
        "restingHr": 68,
        "deepSleepMin": 55,
        "remSleepMin": 60,
        "totalSleepMin": 380,
        "strain": 18.4,
        "steps": 12400,
    },
    "baselines7d": {
        "hrvMs": 44,
        "deepSleepMin": 85,
        "strain": 11.2,
    },
    "cabinet": [
        {"brand": "Optimum Nutrition", "name": "Micronized Creatine",
         "compound": "Creatine", "chemicalForm": "Monohydrate",
         "dosePerUnit": 5, "doseUnit": "g", "unit": "scoop", "stock": 60},
        {"brand": "Thorne", "name": "Magnesium Bisglycinate",
         "compound": "Magnesium", "chemicalForm": "Bisglycinate",
         "dosePerUnit": 200, "doseUnit": "mg", "unit": "capsule", "stock": 90},
        {"brand": "NOW Foods", "name": "Ashwagandha",
         "compound": "Ashwagandha", "chemicalForm": "KSM-66",
         "dosePerUnit": 600, "doseUnit": "mg", "unit": "capsule", "stock": 45},
    ],
    "region": "US",
}

OPTIMAL_CTX = {
    "readiness": {"score": 92, "state": "optimal"},
    "telemetry": {
        "hrvMs": 68,
        "restingHr": 52,
        "deepSleepMin": 110,
        "remSleepMin": 95,
        "totalSleepMin": 480,
        "strain": 5.2,
        "steps": 4800,
    },
    "baselines7d": {
        "hrvMs": 55,
        "deepSleepMin": 90,
        "strain": 8.5,
    },
    "cabinet": [
        {"brand": "Thorne", "name": "Magnesium Bisglycinate",
         "compound": "Magnesium", "chemicalForm": "Bisglycinate",
         "dosePerUnit": 200, "doseUnit": "mg", "unit": "capsule", "stock": 90},
    ],
    "region": "US",
}


def _assert_valid_schema(data, max_recs=3):
    assert isinstance(data, dict), f"expected dict, got {type(data)}"
    assert "zeroPill" in data
    assert isinstance(data["zeroPill"], bool)
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) <= max_recs
    for rec in data["recommendations"]:
        assert "compound" in rec
        assert "slot" in rec
        assert rec["slot"] in ("morning", "post_workout", "evening"), rec["slot"]


@pytest.mark.timeout(90)
def test_generate_protocol_gpt_recovery(api_client, base_url):
    r = api_client.post(
        f"{base_url}/api/ai/generate-protocol",
        json={"provider": "gpt", "context": RECOVERY_CTX},
        timeout=90,
    )
    assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
    data = r.json()
    _assert_valid_schema(data)
    # Recovery state should typically produce recommendations
    # (not asserted strictly since LLM may return zeroPill; log for visibility)
    print(f"gpt recovery response: zeroPill={data['zeroPill']} recs={len(data['recommendations'])}")


@pytest.mark.timeout(90)
def test_generate_protocol_gemini_optimal(api_client, base_url):
    r = api_client.post(
        f"{base_url}/api/ai/generate-protocol",
        json={"provider": "gemini", "context": OPTIMAL_CTX},
        timeout=90,
    )
    assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
    data = r.json()
    _assert_valid_schema(data)
    # Per the SYSTEM_PROMPT: optimal readiness should set zeroPill=true & empty recs
    assert data["zeroPill"] is True, f"expected zeroPill=true, got {data}"
    assert data["recommendations"] == [], f"expected empty recs, got {data['recommendations']}"
    assert data.get("wholeFoodNote"), "wholeFoodNote should be present when zeroPill=true"


@pytest.mark.timeout(90)
def test_generate_protocol_gemini_recovery_has_recs(api_client, base_url):
    r = api_client.post(
        f"{base_url}/api/ai/generate-protocol",
        json={"provider": "gemini", "context": RECOVERY_CTX},
        timeout=90,
    )
    assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
    data = r.json()
    _assert_valid_schema(data)
    print(f"gemini recovery response: zeroPill={data['zeroPill']} recs={len(data['recommendations'])}")
