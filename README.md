Rule-Based Task Assignment System
A full-stack web application for intelligent task distribution using rule-based algorithms.

Overview
The system optimally assigns tasks to team members based on skills, capacity, experience, and priority — balancing workload while ensuring qualified members handle critical assignments.

Technology Stack
Layer	Technology
Backend	FastAPI + Python + PostgreSQL (async)
Frontend	Next.js 16 + React 19 + TypeScript + Zustand + Axios
UI Library	shadcn-ui + Framer Motion for animations
Database	PostgreSQL
Authentication	JWT tokens (local) / Supabase Auth (production)
How It Works

1. Team → Define members with skills, capacity, experience
2. Assignments → Define tasks with priority, deadline, required skills
3. Run Engine → Executes rule-based assignment algorithm
4. Review Results → View assignments, workload summary, match scores
Local Development
Backend

cd backend
.\\.venv\\Scripts\\python.exe main.py
# API: http://127.0.0.1:8000
# Docs: http://127.0.0.1:8000/docs
Frontend

cd frontend
npm run dev
# Open: http://localhost:3000
Authentication (Local Dev Only)
The app intentionally has no login UI. To test:

Run the helper script:


powershell -ExecutionPolicy Bypass -File get_dev_token.ps1
Copy the printed line and paste into browser console (F12)

Reload the page — the app is now authenticated

Tokens expire after 30 minutes. Re-run when needed.

Deployment
Frontend: Vercel (free, auto-deploys from GitHub)
Backend: Railway / Render (free tier with PostgreSQL)
Auth: Supabase (free tier, 10K MAU)
What This Project Demonstrates
Full-stack development (backend + frontend integration)
Rule-based algorithm design and implementation
REST API design with authentication
Modern UI/UX with responsive design
Database schema and async operations
Deployment and environment configuration
