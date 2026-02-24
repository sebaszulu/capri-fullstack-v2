#! /usr/bin/env bash

set -e
set -x

# region agent log
agent_log() {
  HYPOTHESIS_ID="$1"
  MESSAGE="$2"
  DATA_JSON="$3"
  python - "$HYPOTHESIS_ID" "$MESSAGE" "$DATA_JSON" <<'PY'
import json
import sys
import time

hypothesis_id, message, data_json = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    data = json.loads(data_json)
except Exception:
    data = {"raw": data_json}
payload = {
    "sessionId": "6af972",
    "runId": "run-1",
    "hypothesisId": hypothesis_id,
    "location": "backend/scripts/prestart.sh",
    "message": message,
    "data": data,
    "timestamp": int(time.time() * 1000),
}
line = json.dumps(payload)
print(line, flush=True)
try:
    with open("/Users/sebaszulu/Proyectos/capri-fullstack-v2/.cursor/debug-6af972.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")
except Exception:
    pass
PY
}
# endregion

agent_log "H2" "prestart.sh started" '{"step":"start"}'

# region agent log
python - <<'PY'
import importlib.util
import json
import sys
import time
from pathlib import Path

pyproject_content = ""
pyproject_path = Path("/app/pyproject.toml")
if pyproject_path.exists():
    pyproject_content = pyproject_path.read_text(encoding="utf-8", errors="ignore")

payload = {
    "sessionId": "6af972",
    "runId": "run-1",
    "hypothesisId": "H1",
    "location": "backend/scripts/prestart.sh",
    "message": "Runtime module/package presence snapshot",
    "data": {
        "python_executable": sys.executable,
        "psycopg2_found": importlib.util.find_spec("psycopg2") is not None,
        "psycopg_found": importlib.util.find_spec("psycopg") is not None,
        "pyproject_has_psycopg2_binary": "psycopg2-binary" in pyproject_content,
    },
    "timestamp": int(time.time() * 1000),
}
line = json.dumps(payload)
print(line, flush=True)
try:
    with open("/Users/sebaszulu/Proyectos/capri-fullstack-v2/.cursor/debug-6af972.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")
except Exception:
    pass
PY
# endregion

# region agent log
python - <<'PY'
import importlib.util
import json
import time

payload = {
    "sessionId": "6af972",
    "runId": "run-1",
    "hypothesisId": "H1",
    "location": "backend/scripts/prestart.sh",
    "message": "Hard import check for postgres drivers",
    "data": {
        "import_psycopg2_ok": importlib.util.find_spec("psycopg2") is not None,
        "import_psycopg_ok": importlib.util.find_spec("psycopg") is not None,
    },
    "timestamp": int(time.time() * 1000),
}
line = json.dumps(payload)
print(line, flush=True)
try:
    with open("/Users/sebaszulu/Proyectos/capri-fullstack-v2/.cursor/debug-6af972.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")
except Exception:
    pass
PY
# endregion

# Let the DB start
python app/backend_pre_start.py
agent_log "H2" "backend_pre_start.py finished" '{"step":"backend_pre_start"}'

# Run migrations
alembic upgrade head
agent_log "H3" "alembic upgrade head finished" '{"step":"alembic"}'

# Create initial data in DB
python app/initial_data.py
agent_log "H5" "initial_data.py finished" '{"step":"initial_data"}'
