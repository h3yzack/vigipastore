.PHONY: run clean activate

run:
	uvicorn app.main:app --reload --log-level debug --host 0.0.0.0 --port 8000

clean:
	rm -rf build/ dist/ *.egg-info .pytest_cache .mypy_cache .cache || true
	find . -type d -name "__pycache__" -exec rm -rf {} + || true
	find . -name "*.pyc" -delete || true

activate:
	source ../.venv/bin/activate