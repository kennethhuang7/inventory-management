"""
Tests for purchase order endpoints and their effect on the backlog.
"""
import pytest


@pytest.fixture
def po_request():
    return {
        "backlog_item_id": "1",
        "supplier_name": "Acme Components",
        "quantity": 350,
        "unit_cost": 12.5,
        "expected_delivery_date": "2025-12-15",
        "notes": "Rush order",
    }


class TestPurchaseOrderEndpoints:
    """Test suite for purchase order endpoints."""

    def test_create_purchase_order(self, client, clean_purchase_orders, po_request):
        """Test creating a purchase order for a backlog item."""
        response = client.post("/api/purchase-orders", json=po_request)
        assert response.status_code == 201

        po = response.json()
        assert po["id"] == "PO-0001"
        assert po["backlog_item_id"] == "1"
        assert po["supplier_name"] == "Acme Components"
        assert po["quantity"] == 350
        assert po["unit_cost"] == 12.5
        assert po["status"] == "Pending"
        assert po["notes"] == "Rush order"
        assert "created_date" in po

    def test_purchase_order_ids_increment(self, client, clean_purchase_orders, po_request):
        """Test that each new purchase order gets the next number."""
        first = client.post("/api/purchase-orders", json=po_request).json()
        second = client.post("/api/purchase-orders", json={**po_request, "backlog_item_id": "2"}).json()
        assert first["id"] == "PO-0001"
        assert second["id"] == "PO-0002"

    def test_get_purchase_order_by_backlog_item(self, client, clean_purchase_orders, po_request):
        """Test fetching the purchase order for a backlog item."""
        created = client.post("/api/purchase-orders", json=po_request).json()

        response = client.get("/api/purchase-orders/1")
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_purchase_order_for_item_without_one(self, client, clean_purchase_orders):
        """Test that a backlog item with no purchase order returns 404."""
        response = client.get("/api/purchase-orders/1")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_for_nonexistent_backlog_item(self, client, clean_purchase_orders, po_request):
        """Test that creating a purchase order for an unknown backlog item returns 404."""
        response = client.post("/api/purchase-orders", json={**po_request, "backlog_item_id": "nope-999"})
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_duplicate_purchase_order_rejected(self, client, clean_purchase_orders, po_request):
        """Test that a second purchase order for the same backlog item returns 409."""
        assert client.post("/api/purchase-orders", json=po_request).status_code == 201
        response = client.post("/api/purchase-orders", json=po_request)
        assert response.status_code == 409

    @pytest.mark.parametrize(
        "bad_fields",
        [
            {"quantity": 0},
            {"quantity": -5},
            {"quantity": 2_000_000},
            {"unit_cost": 0},
            {"unit_cost": -1.5},
            {"supplier_name": ""},
            {"expected_delivery_date": "15/12/2025"},
            {"expected_delivery_date": "2025-13-45"},
            {"notes": "x" * 501},
        ],
    )
    def test_create_validation(self, client, clean_purchase_orders, po_request, bad_fields):
        """Test that invalid input is rejected with 422 and nothing is stored."""
        response = client.post("/api/purchase-orders", json={**po_request, **bad_fields})
        assert response.status_code == 422
        assert client.get("/api/purchase-orders/1").status_code == 404

    def test_backlog_reflects_purchase_order(self, client, clean_purchase_orders, po_request):
        """Test that the backlog flags items that have a purchase order and exposes its id."""
        before = client.get("/api/backlog").json()
        assert all(item["has_purchase_order"] is False for item in before)
        assert all(item["purchase_order_id"] is None for item in before)

        po = client.post("/api/purchase-orders", json=po_request).json()

        after = {item["id"]: item for item in client.get("/api/backlog").json()}
        assert after["1"]["has_purchase_order"] is True
        assert after["1"]["purchase_order_id"] == po["id"]
        assert after["2"]["has_purchase_order"] is False
