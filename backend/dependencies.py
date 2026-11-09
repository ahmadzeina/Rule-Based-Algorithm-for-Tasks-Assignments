# backend/dependencies.py
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user
from crud import get_user_data_by_id

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    # Supabase users are always active; no local check needed.
    return current_user

async def get_current_user_data(
    data_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    data = await get_user_data_by_id(db, data_id, current_user["id"])
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    return data