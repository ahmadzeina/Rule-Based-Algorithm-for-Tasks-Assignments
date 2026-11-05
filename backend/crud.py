from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models import User, DataEntry
from schemas import UserCreate, DataEntryCreate, DataEntryUpdate
from passlib.context import CryptContext
import json
from typing import AsyncGenerator

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate) -> User:
    hashed_password = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

async def get_user_data(db: AsyncSession, owner_id: int) -> DataEntry | None:
    result = await db.execute(
        select(DataEntry).where(DataEntry.owner_id == owner_id)
    )
    return result.scalar_one_or_none()

async def get_user_data_latest(db: AsyncSession, owner_id: int) -> DataEntry | None:
    result = await db.execute(
        select(DataEntry)
        .where(DataEntry.owner_id == owner_id)
        .order_by(DataEntry.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()

async def create_data_entry(db: AsyncSession, data: DataEntryCreate, owner_id: int) -> DataEntry:
    db_data = DataEntry(
        owner_id=owner_id,
        team_data=json.dumps(data.team),
        tasks_data=json.dumps(data.tasks)
    )
    db.add(db_data)
    await db.commit()
    await db.refresh(db_data)
    return db_data

async def update_data_entry(db: AsyncSession, data_id: int, data_update: DataEntryUpdate, owner_id: int) -> DataEntry | None:
    data = await get_user_data_by_id(db, data_id, owner_id)
    if not data:
        return None
    
    update_dict = data_update.dict(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "team":
            setattr(data, "team_data", json.dumps(value))
        elif field == "tasks":
            setattr(data, "tasks_data", json.dumps(value))
        elif field == "assignments_result":
            setattr(data, "assignments_result", value)
    
    await db.commit()
    await db.refresh(data)
    return data

async def get_user_data_by_id(db: AsyncSession, data_id: int, owner_id: int) -> DataEntry | None:
    result = await db.execute(
        select(DataEntry).where(and_(DataEntry.id == data_id, DataEntry.owner_id == owner_id))
    )
    return result.scalar_one_or_none()