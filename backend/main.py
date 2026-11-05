from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
import database  # ← ABSOLUTE
import routers.auth as auth
import routers.data as data_router
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)
    yield
    # Shutdown (if needed)
    await database.engine.dispose()

app = FastAPI(title="Task Assigner API", lifespan=lifespan)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
async def create_tables():
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)

@app.on_event("startup")
async def startup():
    await create_tables()

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# Routers
app.include_router(auth.router)
app.include_router(data_router.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)