"""Health check for NutriSync AI backend."""


def test_health_ok(api_client, base_url):
    r = api_client.get(f"{base_url}/api/health", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("status") == "ok"
    assert "llm_key_configured" in data


def test_root(api_client, base_url):
    r = api_client.get(f"{base_url}/api/", timeout=15)
    assert r.status_code == 200
    assert "NutriSync" in r.json().get("message", "")
