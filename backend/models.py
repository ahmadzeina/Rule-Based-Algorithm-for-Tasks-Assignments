from sqlalchemy import String, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from database import Base

class User(Base):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    data_entries: Mapped[List["DataEntry"]] = relationship(
        "DataEntry", back_populates="owner", cascade="all, delete-orphan"
    )

class DataEntry(Base):
    __tablename__ = "data_entries"
    
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    tasks_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    assignments_result: Mapped[str] = mapped_column(Text, nullable=True)  # JSON result
    
    owner: Mapped["User"] = relationship("User", back_populates="data_entries")