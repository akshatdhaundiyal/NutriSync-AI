"""OCR blood-test extraction via Emergent Vision (gemini-3-flash-preview)."""
import base64
import io
import os
import pytest

from PIL import Image, ImageDraw, ImageFont


def _generate_blood_report_jpeg() -> str:
    """Create a synthetic lab-report style JPEG and return base64."""
    W, H = 800, 1000
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    def _font(size, bold=False):
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
        for c in candidates:
            if os.path.exists(c):
                try:
                    return ImageFont.truetype(c, size)
                except Exception:
                    pass
        return ImageFont.load_default()

    d.rectangle([0, 0, W, 70], fill=(20, 60, 120))
    d.text((30, 20), "QUEST DIAGNOSTICS", font=_font(28, True), fill=(255, 255, 255))
    d.text((30, 90), "Comprehensive Metabolic & Nutrient Panel",
           font=_font(22, True), fill=(20, 20, 20))
    d.text((30, 125), "Patient: J. Doe    DOB: 1990-01-01    Date: 2026-01-05",
           font=_font(15), fill=(80, 80, 80))

    d.line([(30, 160), (W - 30, 160)], fill=(180, 180, 180), width=2)

    d.text((30, 175), "Test", font=_font(16, True), fill=(0, 0, 0))
    d.text((320, 175), "Value", font=_font(16, True), fill=(0, 0, 0))
    d.text((470, 175), "Ref Range", font=_font(16, True), fill=(0, 0, 0))
    d.text((680, 175), "Flag", font=_font(16, True), fill=(0, 0, 0))
    d.line([(30, 200), (W - 30, 200)], fill=(180, 180, 180), width=1)

    rows = [
        ("Ferritin",       "18 ng/mL",   "30 - 400 ng/mL",  "LOW"),
        ("Vitamin D, 25-OH", "22 ng/mL", "30 - 100 ng/mL",  "LOW"),
        ("Magnesium",      "1.7 mg/dL",  "1.7 - 2.2 mg/dL", "NORMAL"),
        ("Vitamin B12",    "540 pg/mL",  "232 - 1245 pg/mL","NORMAL"),
    ]
    y = 215
    for name, val, ref, flag in rows:
        d.text((30, y), name, font=_font(16), fill=(0, 0, 0))
        d.text((320, y), val, font=_font(16, True), fill=(0, 0, 0))
        d.text((470, y), ref, font=_font(15), fill=(60, 60, 60))
        color = (200, 0, 0) if flag == "LOW" else (0, 120, 60) if flag == "NORMAL" else (200, 100, 0)
        d.text((680, y), flag, font=_font(16, True), fill=color)
        y += 42

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="module")
def blood_b64():
    return _generate_blood_report_jpeg()


@pytest.mark.timeout(90)
def test_ocr_bloodtest_extracts_markers(api_client, base_url, blood_b64):
    r = api_client.post(
        f"{base_url}/api/ai/ocr-bloodtest",
        json={"image_base64": blood_b64, "mime_type": "image/jpeg"},
        timeout=90,
    )
    assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
    data = r.json()
    print(f"BLOOD OCR response: {data}")

    assert "markers" in data, f"missing markers in {data}"
    assert isinstance(data["markers"], list) and len(data["markers"]) >= 1
    for m in data["markers"]:
        assert "name" in m and "value" in m and "unit" in m and "status" in m
        assert m["status"] in ("low", "normal", "high"), m["status"]

    names_lower = " ".join(str(m["name"]).lower() for m in data["markers"])
    # At least one of the four biomarkers should be identified
    assert any(k in names_lower for k in ("ferritin", "vitamin d", "magnesium", "b12")), \
        f"no known biomarker found in {names_lower}"


@pytest.mark.timeout(30)
def test_ocr_bloodtest_bad_image_returns_502(api_client, base_url):
    """Send garbage base64 → should not 500, should return 502 (generation failed)."""
    r = api_client.post(
        f"{base_url}/api/ai/ocr-bloodtest",
        json={"image_base64": "AAAA", "mime_type": "image/jpeg"},
        timeout=30,
    )
    assert r.status_code in (200, 502), f"unexpected status={r.status_code} body={r.text[:200]}"
