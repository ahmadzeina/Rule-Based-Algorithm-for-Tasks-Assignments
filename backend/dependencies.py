from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user
from models import User
from crud import get_user_data_by_id



async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_user_data(
    data_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    data = await get_user_data_by_id(db, data_id, current_user.id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    return data