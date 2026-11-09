# backend/models.py
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class DataEntry(Base):
    __tablename__ = "data_entries"

    owner_id: Mapped[str] = mapped_column(
        String, nullable=False, index=True
    )  # Supabase user UUID
    team_data: Mapped[str] = mapped_column(Text, nullable=False)
    tasks_data: Mapped[str] = mapped_column(Text, nullable=False)
    assignments_result: Mapped[str] = mapped_column(Text, nullable=True)