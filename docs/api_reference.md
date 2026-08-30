# NutriSync AI — Backend API Reference

This document outlines the REST API endpoints exposed by the NutriSync AI FastAPI backend service (`server.py`).

**Base URL**: `http://127.0.0.1:8000/api`

---

## 1. System Endpoints

### 1.1 Root Service Check
`GET /`

Returns service identification string.

#### Response (`200 OK`)
```json
{
  "message": "NutriSync AI backend"
}
```

---

### 1.2 Health Check
`GET /health`

Verifies server status and checks whether the Emergent LLM key is loaded in environment.

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "llm_key_configured": true
}
```

---

## 2. AI Intelligence Endpoints

### 2.1 Generate Biometric Supplement Protocol
`POST /ai/generate-protocol`

Generates an optimized chronobiological supplement protocol from wearable telemetry, rolling baselines, readiness scores, and cabinet inventory.

#### Request Body (`application/json`)
```json
{
  "provider": "gemini", // "gpt" | "gemini"
  "context": {
    "region": "US",
    "mode": "auto",
    "readiness": {
      "score": 42,
      "state": "recovery",
      "deepSleepDelta": -24,
      "hrvDelta": -38,
      "strain": 16
    },
    "baselines": {
      "deepSleepMin": 90,
      "hrvMs": 65,
      "restingHr": 54,
      "strain": 11.2,
      "days": 7
    },
    "labDeficiencies": [
      {
        "canonical": "magnesium",
        "name": "Magnesium (RBC)",
        "value": 4.1,
        "unit": "mg/dL"
      }
    ],
    "today": {
      "deepSleepMin": 68,
      "hrvMs": 40,
      "restingHr": 62,
      "strain": 16,
      "steps": 11400,
      "acuteStressSpike": false
    },
    "cabinet": [
      {
        "canonical": "magnesium",
        "brand": "Thorne",
        "name": "Magnesium Bisglycinate",
        "form": "Bisglycinate",
        "dosePerUnit": 200,
        "doseUnit": "mg",
        "unit": "capsule",
        "stock": 90
      }
    ]
  }
}
```

#### Response (`200 OK`)
```json
{
  "zeroPill": false,
  "wholeFoodNote": null,
  "recommendations": [
    {
      "compound": "Magnesium",
      "chemicalForm": "Bisglycinate",
      "targetDose": 200,
      "doseUnit": "mg",
      "slot": "evening",
      "rationale": "Suppressed HRV and low RBC lab values signal parasympathetic recovery need.",
      "window": "60-90 min pre-bed",
      "foodAlternatives": ["Pumpkin seeds", "Spinach"]
    }
  ]
}
```

#### Error Responses
- `500 Internal Server Error`: `{"detail": "LLM key not configured"}`
- `502 Bad Gateway`: `{"detail": "generation failed"}`

---

### 2.2 Supplement Label OCR
`POST /ai/ocr-label`

Extracts structured supplement facts from an image base64 string.

#### Request Body (`application/json`)
```json
{
  "image_base64": "<base64_encoded_jpeg_or_png>",
  "mime_type": "image/jpeg"
}
```

#### Response (`200 OK`)
```json
{
  "brand": "Doctor's Best",
  "name": "High Absorption Magnesium",
  "compound": "Magnesium",
  "chemicalForm": "Lysinate Glycinate",
  "dosePerUnit": 100,
  "doseUnit": "mg",
  "unit": "tablet",
  "unitsPerContainer": 120
}
```

---

### 2.3 Blood-Test Lab Report OCR
`POST /ai/ocr-bloodtest`

Extracts diagnostic biomarkers from lab report images.

#### Request Body (`application/json`)
```json
{
  "image_base64": "<base64_encoded_jpeg_or_png>",
  "mime_type": "image/jpeg"
}
```

#### Response (`200 OK`)
```json
{
  "markers": [
    {
      "name": "Ferritin",
      "value": 18,
      "unit": "ng/mL",
      "status": "low"
    },
    {
      "name": "Vitamin D, 25-OH",
      "value": 22,
      "unit": "ng/mL",
      "status": "low"
    },
    {
      "name": "Magnesium",
      "value": 2.1,
      "unit": "mg/dL",
      "status": "normal"
    },
    {
      "name": "Vitamin B12",
      "value": 540,
      "unit": "pg/mL",
      "status": "normal"
    }
  ]
}
```
