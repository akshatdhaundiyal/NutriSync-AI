import os
import pytest
import requests


@pytest.fixture(scope="session")
def base_url() -> str:
    url = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL")
    if not url:
        # fall back to reading frontend/.env
        env_path = "/app/frontend/.env"
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                        url = line.split("=", 1)[1].strip().strip('"')
                        break
    assert url, "EXPO_PUBLIC_BACKEND_URL not set"
    return url.rstrip("/")


@pytest.fixture(scope="session")
def api_client() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s
