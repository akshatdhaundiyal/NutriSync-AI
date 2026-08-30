"""OCR label extraction via Emergent Vision (gemini-3-flash-preview)."""
import base64
import io
import os
import pytest

from PIL import Image, ImageDraw, ImageFont


def _generate_supplement_label_jpeg() -> str:
    """Create a realistic supplement-facts-like JPEG label and return base64 str."""
    W, H = 700, 900
    img = Image.new("RGB", (W, H), (245, 240, 225))
    d = ImageDraw.Draw(img)

    # Use default fonts (Pillow bundles DejaVuSans on many builds; fallback to load_default)
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

    # Brand banner
    d.rectangle([0, 0, W, 90], fill=(30, 90, 60))
    d.text((30, 25), "THORNE", font=_font(46, True), fill=(255, 255, 255))
    d.text((30, 68), "Research", font=_font(18), fill=(220, 220, 220))

    # Product name
    d.text((30, 120), "Magnesium Bisglycinate", font=_font(34, True), fill=(20, 20, 20))
    d.text((30, 165), "Highly-Absorbable Chelated Magnesium", font=_font(20), fill=(80, 80, 80))

    # Divider
    d.line([(30, 210), (W - 30, 210)], fill=(180, 180, 180), width=2)

    # Supplement facts
    d.text((30, 230), "Supplement Facts", font=_font(26, True), fill=(20, 20, 20))
    d.text((30, 275), "Serving Size: 1 Capsule", font=_font(18), fill=(40, 40, 40))
    d.text((30, 305), "Servings Per Container: 120", font=_font(18), fill=(40, 40, 40))

    d.line([(30, 345), (W - 30, 345)], fill=(180, 180, 180), width=1)
    d.text((30, 360), "Amount Per Serving", font=_font(18, True), fill=(20, 20, 20))
    d.line([(30, 395), (W - 30, 395)], fill=(180, 180, 180), width=1)

    d.text((30, 410), "Magnesium (as Bisglycinate)", font=_font(20, True), fill=(20, 20, 20))
    d.text((30, 445), "200 mg", font=_font(22, True), fill=(20, 20, 20))
    d.text((W - 120, 445), "48% DV", font=_font(18), fill=(80, 80, 80))

    d.line([(30, 490), (W - 30, 490)], fill=(180, 180, 180), width=1)

    # Directions
    d.text((30, 510), "Directions:", font=_font(20, True), fill=(20, 20, 20))
    d.text((30, 545), "Take 1 capsule daily with a meal, or as", font=_font(16), fill=(60, 60, 60))
    d.text((30, 570), "recommended by your health practitioner.", font=_font(16), fill=(60, 60, 60))

    # Bottom stripe
    d.rectangle([0, H - 80, W, H], fill=(30, 90, 60))
    d.text((30, H - 60), "120 Capsules", font=_font(24, True), fill=(255, 255, 255))
    d.text((W - 200, H - 55), "Dietary Supplement", font=_font(16), fill=(220, 220, 220))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="module")
def label_b64():
    return _generate_supplement_label_jpeg()


@pytest.mark.timeout(90)
def test_ocr_label_extracts_fields(api_client, base_url, label_b64):
    r = api_client.post(
        f"{base_url}/api/ai/ocr-label",
        json={"image_base64": label_b64, "mime_type": "image/jpeg"},
        timeout=90,
    )
    assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
    data = r.json()
    print(f"OCR response: {data}")

    # All required fields must be present
    for f in ("brand", "name", "compound", "chemicalForm",
              "dosePerUnit", "doseUnit", "unit", "unitsPerContainer"):
        assert f in data, f"missing field {f} in {data}"

    # Value checks (soft where LLM may vary)
    assert data["doseUnit"] in ("mg", "mcg", "g", "IU", "serving"), data["doseUnit"]
    assert data["unit"] in ("capsule", "softgel", "tablet", "scoop", "gummy"), data["unit"]
    assert isinstance(data["dosePerUnit"], (int, float))
    assert isinstance(data["unitsPerContainer"], (int, float))

    # Content validation - our label says Magnesium/Bisglycinate/200mg/120 capsules/Thorne
    assert "magnesium" in str(data["compound"]).lower(), f"compound={data['compound']}"
    assert data["doseUnit"] == "mg", f"doseUnit={data['doseUnit']}"
    assert data["unit"] == "capsule", f"unit={data['unit']}"
    assert 150 <= float(data["dosePerUnit"]) <= 250, f"dosePerUnit={data['dosePerUnit']}"
    assert 100 <= float(data["unitsPerContainer"]) <= 140, f"unitsPerContainer={data['unitsPerContainer']}"
