from sqlalchemy import Boolean, Column, Integer, String, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)
    
    role = Column(String, default="student")
    school = Column(String, nullable=True)
    level = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    terms_accepted = Column(Boolean, default=True)


class StudyItem(Base):
    __tablename__ = "study_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    item_type = Column(String, nullable=False)   # summaries | quizzes | chats | documents
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)        # full JSON blob of the item
    created_at = Column(String, nullable=False)


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True)
    output_type = Column(String, nullable=False)      # translation | summary | chat | quiz | simplify
    feedback_type = Column(String, nullable=False)    # Correct | Unclear | Wrong | Offensive | Culturally Inappropriate
    language = Column(String, nullable=True)          # English | Twi | Ewe | Ga | Fante
    confidence = Column(String, nullable=True)        # high | moderate | low
    content_preview = Column(Text, nullable=True)     # first 200 chars of the AI output
    user_id = Column(Integer, nullable=True)
    created_at = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)


class LectureMaterial(Base):
    __tablename__ = "lecture_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)        # pdf | docx | pptx | txt | other
    file_size = Column(Integer, nullable=True)        # bytes
    file_path = Column(String, nullable=False)        # relative path: uploads/{filename}
    uploader_id = Column(Integer, nullable=True)
    view_count = Column(Integer, default=0)
    quiz_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    created_at = Column(String, nullable=False)
