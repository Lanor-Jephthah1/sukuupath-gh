import json
import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, db


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_URL = "https://edubridge-3847b-default-rtdb.firebaseio.com/"


def _load_firebase_credential():
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    if service_account_json:
        try:
            return credentials.Certificate(json.loads(service_account_json))
        except json.JSONDecodeError as exc:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.") from exc

    cred_path = BASE_DIR / "firebase_credentials.json"
    if cred_path.exists():
        return credentials.Certificate(str(cred_path))

    raise RuntimeError(
        "Firebase Admin credentials are not configured. "
        "Set FIREBASE_SERVICE_ACCOUNT_JSON or provide backend/firebase_credentials.json for local development."
    )


def _initialize_firebase():
    if firebase_admin._apps:
        return db

    database_url = os.getenv("FIREBASE_DATABASE_URL", DEFAULT_DATABASE_URL).strip() or DEFAULT_DATABASE_URL
    cred = _load_firebase_credential()
    firebase_admin.initialize_app(cred, {"databaseURL": database_url})
    return db


def get_firebase_db():
    return _initialize_firebase()
