"""
Tests for cross-cutting API configuration: CORS and compression.
"""
import pytest

ALLOWED_ORIGIN = "http://localhost:3000"


class TestCorsConfiguration:
    """Test suite for CORS behavior."""

    def test_allowed_origin_is_echoed(self, client):
        """Test that the local frontend origin is allowed."""
        response = client.get("/api/inventory", headers={"Origin": ALLOWED_ORIGIN})
        assert response.headers.get("access-control-allow-origin") == ALLOWED_ORIGIN

    def test_other_origin_is_not_allowed(self, client):
        """Test that an arbitrary website origin gets no CORS grant."""
        response = client.get("/api/inventory", headers={"Origin": "https://evil.example"})
        assert response.headers.get("access-control-allow-origin") is None

    def test_credentials_not_allowed(self, client):
        """Test that credentialed cross-origin requests are not enabled (the app uses no cookies)."""
        response = client.get("/api/inventory", headers={"Origin": ALLOWED_ORIGIN})
        assert response.headers.get("access-control-allow-credentials") is None

    def test_preflight_allows_task_writes(self, client):
        """Test that the preflight for creating a task from the frontend succeeds."""
        response = client.options(
            "/api/tasks",
            headers={
                "Origin": ALLOWED_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert response.status_code == 200
        assert "POST" in response.headers["access-control-allow-methods"]

    def test_preflight_rejects_put(self, client):
        """Test that methods the API does not use are not allowed cross-origin."""
        response = client.options(
            "/api/tasks",
            headers={"Origin": ALLOWED_ORIGIN, "Access-Control-Request-Method": "PUT"},
        )
        assert response.status_code == 400


class TestCompression:
    """Test suite for response compression."""

    def test_large_response_is_gzipped(self, client):
        """Test that the orders payload is compressed when the client accepts gzip."""
        response = client.get("/api/orders", headers={"Accept-Encoding": "gzip"})
        assert response.status_code == 200
        assert response.headers.get("content-encoding") == "gzip"

    def test_small_response_is_not_gzipped(self, client):
        """Test that tiny responses skip compression."""
        response = client.get("/api/dashboard/summary", headers={"Accept-Encoding": "gzip"})
        assert response.headers.get("content-encoding") is None
