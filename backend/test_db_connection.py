import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:simple123@localhost:5432/task_assigner_db"

async def test_connection():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # Test 1: Simple connection + table create
    async with engine.begin() as conn:
        await conn.execute(text("CREATE TABLE IF NOT EXISTS test_conn (id SERIAL PRIMARY KEY, message TEXT)"))
        print("✅ Table created")
    
    # Test 2: Insert + read (separate transaction)
    async with engine.begin() as conn:
        await conn.execute(text("INSERT INTO test_conn (message) VALUES ('FastAPI ready!')"))
        result = await conn.execute(text("SELECT message FROM test_conn ORDER BY id DESC LIMIT 1"))
        print(f"✅ Data operations: {result.scalar()}")
    
    await engine.dispose()
    print("🎉 DATABASE 100% READY!")

if __name__ == "__main__":
    asyncio.run(test_connection())