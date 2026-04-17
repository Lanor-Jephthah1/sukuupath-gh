from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict

# ── User ─────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    role: str = "student"
    school: Optional[str] = None
    level: Optional[str] = None

class UserCreate(UserBase):
    password: str
    terms: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    class Config:
        orm_mode = True

class UserProfileUpdate(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None

class UserPasswordUpdate(BaseModel):
    user_id: str
    old_password: str
    new_password: str

class UserPreferencesUpdate(BaseModel):
    user_id: str
    notifications: Optional[bool] = None
    privacy_storage: Optional[bool] = None
    accessibility: Optional[bool] = None
    photo_base64: Optional[str] = None

# ── AI request/response ───────────────────────────────────────────────────────
class TranslationRequest(BaseModel):
    source_lang: str
    target_lang: str
    source_text: str

class SimplifyRequest(BaseModel):
    text: str
    reading_level: str
    exact_meaning: bool = False
    make_shorter: bool = False
    revision_ready: bool = False

class ChatRequest(BaseModel):
    messages: List[dict]
    system: Optional[str] = None

class SummaryRequest(BaseModel):
    text: str
    style: str = "study-notes"

class DocumentChatRequest(BaseModel):
    document_name: str
    document_text: str
    question: str

class InsightRequest(BaseModel):
    sessions_completed: int = 0
    quizzes_generated: int = 0
    saved_notes: int = 0
    recent_types: Optional[List[str]] = None

# ── Quiz ──────────────────────────────────────────────────────────────────────
class QuizQuestion(BaseModel):
    type: str = "mcq"
    question: str
    options: Optional[List[str]] = None
    answer_index: Optional[int] = None
    answer_text: Optional[str] = None
    explanation: str

class QuizRequest(BaseModel):
    source_text: str
    question_count: int = 10
    difficulty: str = "Intermediate"
    question_types: Optional[List[str]] = None
    output_language: Optional[str] = "English"

class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]

# ── Library / Study Items ─────────────────────────────────────────────────────
class StudyItemCreate(BaseModel):
    user_id: Optional[int] = None
    item_type: str
    title: str
    content: Optional[str] = None
    created_at: str

class StudyItemResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    item_type: str
    title: str
    content: Optional[str] = None
    created_at: str
    class Config:
        orm_mode = True

# ── Responsible AI / Trust ────────────────────────────────────────────────────
class FeedbackCreate(BaseModel):
    output_type: str           # translation | summary | chat | quiz | simplify
    feedback_type: str         # Correct | Unclear | Wrong | Offensive | Culturally Inappropriate
    language: Optional[str] = "English"
    confidence: Optional[str] = "high"
    content_preview: Optional[str] = None
    user_id: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    output_type: str
    feedback_type: str
    language: Optional[str]
    confidence: Optional[str]
    content_preview: Optional[str]
    created_at: str
    class Config:
        orm_mode = True

class FeedbackStats(BaseModel):
    total: int
    by_language: Dict[str, int]
    by_feedback_type: Dict[str, int]
    by_confidence: Dict[str, int]
    by_output_type: Dict[str, int]
    accuracy_rate: float
    low_confidence_count: int

# ── Lecture Materials ─────────────────────────────────────────────────────────

class MaterialCreate(BaseModel):
    title: str
    original_filename: str
    file_type: str
    file_size: Optional[int] = None
    file_path: str
    uploader_id: Optional[str] = None

class MaterialResponse(BaseModel):
    id: str
    title: str
    original_filename: str
    file_type: str
    file_size: Optional[int]
    file_path: str
    uploader_id: Optional[int]
    view_count: int
    quiz_count: int
    save_count: int
    created_at: str
    class Config:
        orm_mode = True
