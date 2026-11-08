import sys
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /health ...")
    r = client.get("/health")
    assert r.status_code == 200, f"Failed /health: {r.text}"
    assert r.json()["status"] == "ok"
    print("  /health passed:", r.json())

    print("Testing /meta ...")
    r = client.get("/meta")
    assert r.status_code == 200, f"Failed /meta: {r.text}"
    data = r.json()
    assert data["app_name"] == "AirWatch CO API"
    assert data["total_records"] == 9353
    print("  /meta passed:", data["primary_model"], f"({data['total_records']} rows)")

    print("Testing /stats/overview ...")
    r = client.get("/stats/overview")
    assert r.status_code == 200, f"Failed /stats/overview: {r.text}"
    stats_data = r.json()
    assert "co_stats" in stats_data
    assert stats_data["total_hours"] == 9353
    print("  /stats/overview passed. Mean CO:", stats_data["co_stats"]["mean"])

    print("Testing /stats/timeseries ...")
    r = client.get("/stats/timeseries?step=12")
    assert r.status_code == 200, f"Failed /stats/timeseries: {r.text}"
    ts = r.json()
    assert len(ts) > 0
    print(f"  /stats/timeseries passed ({len(ts)} points returned with step=12)")

    print("Testing /stats/hourly-pattern ...")
    r = client.get("/stats/hourly-pattern")
    assert r.status_code == 200
    hourly = r.json()
    assert len(hourly) == 24
    print("  /stats/hourly-pattern passed (24 hours)")

    print("Testing /stats/weekday-pattern ...")
    r = client.get("/stats/weekday-pattern")
    assert r.status_code == 200
    weekdays = r.json()
    assert len(weekdays) == 7
    print("  /stats/weekday-pattern passed (7 days)")

    print("Testing /stats/correlation ...")
    r = client.get("/stats/correlation")
    assert r.status_code == 200
    corr = r.json()
    assert len(corr["columns"]) == 12
    print("  /stats/correlation passed (12x12 matrix)")

    print("Testing /stats/weather-scatter ...")
    r = client.get("/stats/weather-scatter?sample_size=100")
    assert r.status_code == 200
    assert len(r.json()) == 100
    print("  /stats/weather-scatter passed")

    print("Testing /data ...")
    r = client.get("/data?page=1&page_size=10")
    assert r.status_code == 200
    paged = r.json()
    assert paged["page"] == 1
    assert len(paged["data"]) == 10
    print(f"  /data passed (Total records: {paged['total_records']}, Total pages: {paged['total_pages']})")

    print("Testing /data/missingness ...")
    r = client.get("/data/missingness")
    assert r.status_code == 200
    assert len(r.json()) > 0
    print("  /data/missingness passed")

    print("Testing /model/sample-timestamps ...")
    r = client.get("/model/sample-timestamps?count=5")
    assert r.status_code == 200
    samples = r.json()
    assert len(samples) == 5
    sample_dt = samples[0]["datetime"]
    print("  /model/sample-timestamps passed. Selected sample:", sample_dt)

    print("Testing /model/predict with timestamp ...")
    r = client.post("/model/predict", json={"datetime_str": sample_dt})
    assert r.status_code == 200, f"Prediction failed: {r.text}"
    pred_res = r.json()
    assert "predicted_co_next" in pred_res
    assert "actual_co_next" in pred_res
    print(f"  /model/predict passed: Actual={pred_res['actual_co_next']}, Pred={pred_res['predicted_co_next']}, Error={pred_res['abs_error']}")

    print("Testing /model/evaluation ...")
    r = client.get("/model/evaluation")
    assert r.status_code == 200
    eval_res = r.json()
    assert "models_comparison" in eval_res
    assert len(eval_res["test_evaluation_series"]) > 0
    print("  /model/evaluation passed.")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 100% HEALTHY.")

if __name__ == "__main__":
    test_endpoints()
