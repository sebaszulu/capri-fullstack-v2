import json
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from app.main import app
from fastapi.openapi.utils import get_openapi

openapi_schema = get_openapi(
    title=app.title,
    version=app.version,
    openapi_version=app.openapi_version,
    description=app.description,
    routes=app.routes,
)

output_path = "../frontend/openapi.json"
with open(output_path, "w") as f:
    json.dump(openapi_schema, f, indent=2)

print(f"OpenAPI schema generated at {output_path}")
