from datetime import datetime, timezone
import collections
import hashlib
import schemas

from firebase_db import get_firebase_db

def get_db_ref():
    return get_firebase_db()

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

# ==========================================
# USERS
# ==========================================
def get_user_by_email(db, email: str):
    fdb = get_db_ref().reference('users').get() or {}
    for uid, udata in fdb.items():
        if udata.get('email') == email:
            udata['id'] = uid
            return udata
    return None

def create_user(db, user: schemas.UserCreate):
    ref = get_db_ref().reference('users').push()
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "first_name": user.first_name,
        "middle_name": user.middle_name,
        "last_name": user.last_name,
        "role": user.role or "student",
        "school": user.school,
        "level": user.level,
        "terms_accepted": user.terms,
        "is_active": True
    }
    ref.set(user_data)
    user_data["id"] = ref.key
    return user_data

def update_user_profile(user_id: str, profile_data: dict):
    ref = get_db_ref().reference(f'users/{user_id}')
    if ref.get() is None:
        return None
    ref.update(profile_data)
    updated = ref.get()
    if updated: updated['id'] = user_id
    return updated

def update_user_password(user_id: str, new_password: str):
    ref = get_db_ref().reference(f'users/{user_id}')
    if ref.get() is None:
        return False
    hashed_password = get_password_hash(new_password)
    ref.update({"hashed_password": hashed_password})
    return True

# ==========================================
# STUDY ITEMS
# ==========================================
def create_study_item(db, item: schemas.StudyItemCreate):
    ref = get_db_ref().reference('study_items').push()
    data = {
        "user_id": item.user_id,
        "item_type": item.item_type,
        "title": item.title,
        "content": item.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    ref.set(data)
    data["id"] = ref.key
    return data

def get_study_items(db, user_id: str):
    fdb = get_db_ref().reference('study_items').get() or {}
    results = []
    for iid, data in fdb.items():
        if str(data.get('user_id')) == str(user_id):
            data['id'] = iid
            results.append(data)
    
    # Sort descending by creation date
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    # Group by type for the frontend format
    grouped = collections.defaultdict(list)
    for r in results:
        grouped[r["item_type"]].append(r)
    return dict(grouped)

def delete_study_item(db, item_id: str):
    ref = get_db_ref().reference(f'study_items/{item_id}')
    ref.delete()
    return True

# ==========================================
# FEEDBACK
# ==========================================
def create_feedback(db, fb: schemas.FeedbackCreate):
    ref = get_db_ref().reference('feedback').push()
    data = {
        "output_type": fb.output_type,
        "feedback_type": fb.feedback_type,
        "language": fb.language,
        "confidence": fb.confidence,
        "content_preview": fb.content_preview,
        "user_id": fb.user_id,
        "is_resolved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    ref.set(data)
    data["id"] = ref.key
    return data

def get_feedback_list(db, limit: int = 200):
    fdb = get_db_ref().reference('feedback').get() or {}
    results = []
    for fid, data in fdb.items():
        data['id'] = fid
        results.append(data)
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return results[:limit]

def resolve_feedback(db, feedback_id: str):
    ref = get_db_ref().reference(f'feedback/{feedback_id}')
    item = ref.get()
    if item:
        ref.update({"is_resolved": True})
        item["is_resolved"] = True
        item["id"] = feedback_id
        return item
    return None

def get_feedback_stats(db) -> schemas.FeedbackStats:
    fdb = get_db_ref().reference('feedback').get() or {}
    total = len(fdb)
    resolved = sum(1 for data in fdb.values() if data.get('is_resolved'))
    grouped = collections.defaultdict(int)
    for data in fdb.values():
        grouped[data.get("feedback_type", "Unknown")] += 1
    
    return schemas.FeedbackStats(
        total=total,
        resolved=resolved,
        unresolved=total - resolved,
        by_type=dict(grouped)
    )

# ==========================================
# MATERIALS
# ==========================================
def create_material(db, mat: schemas.MaterialCreate):
    ref = get_db_ref().reference('materials').push()
    data = {
        "title": mat.title,
        "original_filename": mat.original_filename,
        "file_type": mat.file_type,
        "file_size": mat.file_size,
        "file_path": mat.file_path,
        "uploader_id": mat.uploader_id,
        "view_count": 0,
        "quiz_count": 0,
        "save_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    ref.set(data)
    data["id"] = ref.key
    return data

def get_materials(db, uploader_id: str = None):
    fdb = get_db_ref().reference('materials').get() or {}
    results = []
    for mid, data in fdb.items():
        if uploader_id and str(data.get('uploader_id')) != str(uploader_id):
            continue
        data['id'] = mid
        results.append(data)
    results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return results

def delete_material(db, material_id: str):
    ref = get_db_ref().reference(f'materials/{material_id}')
    ref.delete()
    return True

def increment_view_count(db, material_id: str):
    ref = get_db_ref().reference(f'materials/{material_id}')
    item = ref.get()
    if item:
        new_count = item.get("view_count", 0) + 1
        ref.update({"view_count": new_count})
        item["view_count"] = new_count
        item["id"] = material_id
        return item
    return None
