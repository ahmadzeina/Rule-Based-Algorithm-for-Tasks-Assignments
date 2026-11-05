import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_current_active_user
from crud import (
    get_user_data_latest, get_user_data, create_data_entry, update_data_entry
)
from schemas import (
    DataEntryCreate,
    DataEntryOut,
    AssignmentRequest,
    AssignmentResponse,
    DataEntryUpdate
)
from logic import assign_tasks  # Your existing logic

router = APIRouter(prefix="/data", tags=["data"])

@router.post("/entry", response_model=DataEntryOut)
async def create_entry(
    data: DataEntryCreate,
    user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    entry = await create_data_entry(db, data, user.id)
    return entry

@router.get("/latest", response_model=DataEntryOut)
async def get_latest_entry(
    user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    entry = await get_user_data_latest(db, user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="No data entries found")
    return entry

@router.post("/assign", response_model=AssignmentResponse)
async def assign_task_endpoint(
    request: AssignmentRequest,
    user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # Use your existing logic
    assignments, workload_summary = assign_tasks(request.team, request.tasks)
    
    # Save to database
    entry = await get_user_data_latest(db, user.id)
    if entry:
        await update_data_entry(
            db,
            entry.id,
            DataEntryUpdate(
                team=request.team,
                tasks=request.tasks,
                assignments_result=json.dumps({
                    "assignments": assignments,
                    "workload_summary": workload_summary
                })
            ),
            user.id
        )
    
    return AssignmentResponse(
        assignments=assignments,
        workload_summary=workload_summary
    )