import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "EvidenceOS Intelligence Platform"
    assert "version" in data
    assert "configured_model" in data
    assert "ai_ready" in data
    assert data["mode"] in ["live_api", "evaluation_demo"]
