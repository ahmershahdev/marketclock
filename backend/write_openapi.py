from app.openapi import SCHEMA_PATH, render

SCHEMA_PATH.write_text(render(), encoding="utf-8")
