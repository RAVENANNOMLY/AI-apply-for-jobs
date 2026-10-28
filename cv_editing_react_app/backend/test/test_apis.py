from unittest.mock import MagicMock

from fastapi.testclient import TestClient

import api.server as server


client = TestClient(server.app)


def test_automated_job_search_starts_process(monkeypatch):
    fake_process = MagicMock()
    fake_process.pid = 12345

    popen_mock = MagicMock(return_value=fake_process)
    monkeypatch.setattr(server.subprocess, "Popen", popen_mock)

    payload = {
        "search_url": "https://www.linkedin.com/jobs/search/?keywords=Machine%20Learning",
        "keywords": ["Machine learning"],
        "location": "Paris",
        "date_posted": "pastWeek",
        "under_10_applicants": False,
    }

    response = client.post("/automated-job-search", json=payload)

    assert response.status_code == 200

    response_data = response.json()
    assert "process_id" in response_data

    process_id = response_data["process_id"]
    assert server.running_processes[process_id] is fake_process

    popen_mock.assert_called_once_with(
        [
            server.sys.executable,
            "-u",
            "-m",
            "services.apify_job_scrapper",
            "--urls",
            payload["search_url"],
            "--keywords",
            " ".join(payload["keywords"]),
            "--location",
            payload["location"] or "",
            "--date-posted",
            payload["date_posted"] or "past24Hours",
            "--limit",
            "2",
        ],
        text=True,
    )

    server.running_processes.pop(process_id, None)


def test_stop_automated_job_search(monkeypatch):
    fake_process = MagicMock()
    process_id = "test-process-id"

    monkeypatch.setitem(
        server.running_processes,
        process_id,
        fake_process,
    )

    response = client.post(
        f"/automated-job-search/stop/{process_id}"
    )

    assert response.status_code == 200
    assert response.json() == {"status": "stopped"}
    fake_process.kill.assert_called_once()

    assert process_id not in server.running_processes


def test_stop_unknown_process():
    response = client.post(
        "/automated-job-search/stop/unknown-process"
    )

    assert response.status_code == 200
    assert response.json() == {
        "error": "process not found"
    }