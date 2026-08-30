from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import uuid
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Any, Dict, Optional

from emergentintegrations.llm.chat import (
    LlmChat,
    UserMessage,
    ImageContent,
    TextDelta,
    StreamDone,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (kept for platform compatibility; app is client-side)
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# NutriSync AI — Emergent Universal Key proxy (Gemini / OpenAI text + vision)
# --------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a chronobiology-aware sports nutrition engine. Given wearable telemetry, "
    "7-day baselines, a readiness score and the user's supplement cabinet, return a JSON "
    "supplement protocol.\n"
    "Rules:\n"
    "- Respond with STRICT JSON only, no prose.\n"
    "- Never recommend more than 3 supplements per day.\n"
    "- If readiness is optimal (high HRV, good deep sleep, low strain) set zeroPill=true, "
    "recommendations=[] and give a wholeFoodNote.\n"
    "- Prefer chelated / bioavailable chemical forms.\n"
    '- Slots must be one of: "morning", "post_workout", "evening".\n'
    "JSON schema:\n"
    '{"zeroPill": boolean, "wholeFoodNote": string, "recommendations": '
    '[{"compound": string, "chemicalForm": string, "targetDose": number, '
    '"doseUnit": "mg"|"mcg"|"g"|"IU"|"serving", "slot": string, "rationale": string, '
    '"window": string, "foodAlternatives": string[]}]}'
)

OCR_PROMPT = (
    "Extract supplement facts from this bottle label as STRICT JSON only:\n"
    '{"brand": string, "name": string, "compound": string, "chemicalForm": string, '
    '"dosePerUnit": number, "doseUnit": "mg"|"mcg"|"g"|"IU"|"serving", '
    '"unit": "capsule"|"softgel"|"tablet"|"scoop"|"gummy", "unitsPerContainer": number}\n'
    "compound is the primary active ingredient (e.g. \"Magnesium\"). "
    "dosePerUnit is the elemental amount per single capsule/scoop."
)


class ProtocolRequest(BaseModel):
    provider: str  # "gpt" | "gemini"
    context: Dict[str, Any]


class OcrRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"


def _strip_json(text: str) -> Dict[str, Any]:
    t = (text or "").strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", t)
    if fence:
        t = fence.group(1).strip()
    start = t.find("{")
    end = t.rfind("}")
    if start >= 0 and end > start:
        t = t[start : end + 1]
    return json.loads(t)


async def _collect(chat: LlmChat, message: UserMessage) -> str:
    parts = []
    async for ev in chat.stream_message(message):
        if isinstance(ev, TextDelta):
            parts.append(ev.content)
        elif isinstance(ev, StreamDone):
            break
    return "".join(parts)


@api_router.get("/")
async def root():
    return {"message": "NutriSync AI backend"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "llm_key_configured": bool(EMERGENT_LLM_KEY)}


@api_router.post("/ai/generate-protocol")
async def generate_protocol(req: ProtocolRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    if req.provider == "gpt":
        provider, model = "openai", "gpt-5.4"
    else:
        provider, model = "gemini", "gemini-3.1-pro-preview"

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"protocol-{uuid.uuid4()}",
        system_message=SYSTEM_PROMPT,
    ).with_model(provider, model)

    try:
        text = await _collect(chat, UserMessage(text=json.dumps(req.context)))
        data = _strip_json(text)
    except Exception as e:  # noqa: BLE001
        logger.error(f"protocol generation failed: {e}")
        raise HTTPException(status_code=502, detail="generation failed")

    recs = data.get("recommendations") or []
    if not isinstance(recs, list):
        recs = []
    return {
        "zeroPill": bool(data.get("zeroPill", False)),
        "wholeFoodNote": data.get("wholeFoodNote"),
        "recommendations": recs[:3],
    }


@api_router.post("/ai/ocr-label")
async def ocr_label(req: OcrRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"ocr-{uuid.uuid4()}",
        system_message="You extract structured supplement facts from label photos.",
    ).with_model("gemini", "gemini-3-flash-preview")

    image = ImageContent(image_base64=req.image_base64)
    try:
        text = await _collect(
            chat, UserMessage(text=OCR_PROMPT, file_contents=[image])
        )
        data = _strip_json(text)
    except Exception as e:  # noqa: BLE001
        logger.error(f"ocr failed: {e}")
        raise HTTPException(status_code=502, detail="ocr failed")

    return data


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
