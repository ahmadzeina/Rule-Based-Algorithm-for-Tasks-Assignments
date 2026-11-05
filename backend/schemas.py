from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DataEntryBase(BaseModel):
    team: List[Dict[str, Any]]
    tasks: List[Dict[str, Any]]

class DataEntryCreate(DataEntryBase):
    pass

class DataEntryUpdate(BaseModel):
    team: Optional[List[Dict[str, Any]]] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    assignments_result: Optional[str] = None

class DataEntryOut(BaseModel):
    id: int
    owner_id: int
    team_data: str
    tasks_data: str
    assignments_result: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AssignmentRequest(BaseModel):
    team: List[Dict[str, Any]]
    tasks: List[Dict[str, Any]]

class AssignmentResponse(BaseModel):
    assignments: List[Dict[str, Any]]
    workload_summary: List[Dict[str, Any]]