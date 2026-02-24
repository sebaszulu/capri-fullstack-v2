import logging
import importlib.util
import json
import os
import traceback

from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
RUN_ID = os.getenv("AGENT_DEBUG_RUN_ID", "run-1")

# region agent log
def _agent_log(hypothesis_id: str, location: str, message: str, data: dict) -> None:
    payload = {
        "sessionId": "6af972",
        "runId": RUN_ID,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(__import__("time").time() * 1000),
    }
    try:
        line = json.dumps(payload)
        print(line, flush=True)
        with open(
            "/Users/sebaszulu/Proyectos/capri-fullstack-v2/.cursor/debug-6af972.log",
            "a",
            encoding="utf-8",
        ) as f:
            f.write(line + "\n")
    except Exception:
        pass


_agent_log(
    "H1",
    "backend/app/backend_pre_start.py:pre-import",
    "Checking postgres driver modules before DB prestart",
    {
        "psycopg2_found": importlib.util.find_spec("psycopg2") is not None,
        "psycopg_found": importlib.util.find_spec("psycopg") is not None,
    },
)
# endregion

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init(db_engine: Engine) -> None:
    try:
        # region agent log
        _agent_log(
            "H4",
            "backend/app/backend_pre_start.py:init",
            "Attempting database readiness query",
            {"operation": "select_1"},
        )
        # endregion
        with Session(db_engine) as session:
            # Intentar crear sesión para verificar si la BD está activa
            session.exec(select(1))
        # region agent log
        _agent_log(
            "H4",
            "backend/app/backend_pre_start.py:init",
            "Database readiness query succeeded",
            {"operation": "select_1"},
        )
        # endregion
    except Exception as e:
        # region agent log
        _agent_log(
            "H4",
            "backend/app/backend_pre_start.py:init-except",
            "Database readiness query failed",
            {"error_type": type(e).__name__, "error": str(e)[:200]},
        )
        # endregion
        logger.error(e)
        raise e


def main() -> None:
    logger.info("Initializing service")
    # region agent log
    _agent_log(
        "H2",
        "backend/app/backend_pre_start.py:main",
        "Prestart python script entered",
        {"cwd": os.getcwd()},
    )
    # endregion
    try:
        # region agent log
        _agent_log(
            "H2",
            "backend/app/backend_pre_start.py:main-import",
            "Importing engine from app.core.db",
            {"module": "app.core.db"},
        )
        # endregion
        from app.core.db import engine
    except Exception as e:
        # region agent log
        _agent_log(
            "H2",
            "backend/app/backend_pre_start.py:main-import-except",
            "Failed importing engine from app.core.db",
            {
                "error_type": type(e).__name__,
                "error": str(e)[:200],
                "traceback_tail": traceback.format_exc()[-500:],
            },
        )
        # endregion
        raise

    init(engine)
    logger.info("Service finished initializing")
    # region agent log
    _agent_log(
        "H2",
        "backend/app/backend_pre_start.py:main",
        "Prestart python script finished successfully",
        {"status": "ok"},
    )
    # endregion


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # region agent log
        _agent_log(
            "H2",
            "backend/app/backend_pre_start.py:__main__",
            "Prestart python script crashed",
            {
                "error_type": type(e).__name__,
                "error": str(e)[:200],
                "traceback_tail": traceback.format_exc()[-500:],
            },
        )
        # endregion
        raise
