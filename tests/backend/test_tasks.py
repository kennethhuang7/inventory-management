"""
Tests for task API endpoints (in-memory create, list, toggle, delete).
"""
import pytest


@pytest.fixture
def new_task():
    return {"title": "Review Q4 stock levels", "priority": "high", "dueDate": "2025-12-01"}


class TestTasksEndpoints:
    """Test suite for task-related endpoints."""

    def test_get_tasks_empty_by_default(self, client, clean_tasks):
        """Test that the task list starts empty (mock tasks live in the client)."""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_task(self, client, clean_tasks, new_task):
        """Test creating a task."""
        response = client.post("/api/tasks", json=new_task)
        assert response.status_code == 201

        task = response.json()
        assert task["title"] == new_task["title"]
        assert task["priority"] == "high"
        assert task["dueDate"] == "2025-12-01"
        assert task["status"] == "pending"
        # Ids start at 1000 so they cannot collide with the client-side mock tasks
        assert task["id"] >= 1000

    def test_created_task_appears_in_list_newest_first(self, client, clean_tasks, new_task):
        """Test that created tasks are listed with the newest first."""
        client.post("/api/tasks", json=new_task)
        second = client.post("/api/tasks", json={**new_task, "title": "Second task"}).json()

        data = client.get("/api/tasks").json()
        assert len(data) == 2
        assert data[0]["id"] == second["id"]

    def test_task_ids_are_unique(self, client, clean_tasks, new_task):
        """Test that ids are not reused."""
        ids = [client.post("/api/tasks", json=new_task).json()["id"] for _ in range(3)]
        assert len(set(ids)) == 3

    def test_title_is_trimmed(self, client, clean_tasks, new_task):
        """Test that surrounding whitespace is removed from the title."""
        task = client.post("/api/tasks", json={**new_task, "title": "  Padded  "}).json()
        assert task["title"] == "Padded"

    def test_toggle_task(self, client, clean_tasks, new_task):
        """Test toggling a task between pending and completed."""
        task_id = client.post("/api/tasks", json=new_task).json()["id"]

        first = client.patch(f"/api/tasks/{task_id}")
        assert first.status_code == 200
        assert first.json()["status"] == "completed"

        second = client.patch(f"/api/tasks/{task_id}")
        assert second.json()["status"] == "pending"

    def test_delete_task(self, client, clean_tasks, new_task):
        """Test deleting a task."""
        task_id = client.post("/api/tasks", json=new_task).json()["id"]

        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json() == {"deleted": task_id}
        assert client.get("/api/tasks").json() == []

    def test_toggle_nonexistent_task(self, client, clean_tasks):
        """Test toggling a task that doesn't exist."""
        response = client.patch("/api/tasks/999999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_delete_nonexistent_task(self, client, clean_tasks):
        """Test deleting a task that doesn't exist."""
        response = client.delete("/api/tasks/999999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.parametrize(
        "bad_fields",
        [
            {"title": ""},
            {"title": "x" * 201},
            {"priority": "urgent"},
            {"dueDate": "01/12/2025"},
            {"dueDate": ""},
        ],
    )
    def test_create_task_validation(self, client, clean_tasks, new_task, bad_fields):
        """Test that invalid input is rejected with 422 and nothing is stored."""
        response = client.post("/api/tasks", json={**new_task, **bad_fields})
        assert response.status_code == 422
        assert client.get("/api/tasks").json() == []
