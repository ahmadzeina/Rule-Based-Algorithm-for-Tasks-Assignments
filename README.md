# Rule-Based Task Assignment System
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-async-4169E1?logo=postgresql&logoColor=white)

A full-stack web application for intelligent task distribution using rule-based algorithms.

---

## Overview

The system optimally assigns tasks to team members based on **skills, capacity, experience, and priority** — balancing workload while ensuring qualified members handle critical assignments.

---

## Technology Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Backend        | FastAPI + Python + PostgreSQL (async)                   |
| Frontend       | Next.js 16 + React 19 + TypeScript + Zustand + Axios    |
| UI Library     | shadcn-ui + Framer Motion for animations                |
| Database       | PostgreSQL                                              |
| Authentication | JWT tokens (local) / Supabase Auth (production)         |

---

## How It Works

1. **Team** → Define members with skills, capacity, and experience.
2. **Assignments** → Define tasks with priority, deadline, and required skills.
3. **Run Engine** → Executes the rule-based assignment algorithm.
4. **Review Results** → View assignments, workload summary, and match scores.

---

## Local Development

### Backend

```bash
cd backend
.\.venv\Scripts\python.exe main.py
```

- **API:** http://127.0.0.1:8000
- **Docs:** http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm run dev
```

- **Open:** http://localhost:3000

---

## Authentication (Local Dev Only)

The app intentionally has no login UI. To authenticate locally:

1. Run the helper script:

   ```powershell
   powershell -ExecutionPolicy Bypass -File get_dev_token.ps1
   ```

2. Copy the printed line and paste it into the browser console (`F12`).
3. Reload the page — the app is now authenticated.

> ⏱️ **Note:** Tokens expire after 30 minutes. Re-run the script when needed.

---

## Deployment

| Component  | Platform                                   |
| ---------- | ------------------------------------------ |
| Frontend   | Vercel (free, auto-deploys from GitHub)    |
| Backend    | Railway / Render (free tier + PostgreSQL)  |
| Auth       | Supabase (free tier, 10K MAU)              |

---

## What This Project Demonstrates

- Full-stack development (backend + frontend integration)
- Rule-based algorithm design and implementation
- REST API design with authentication
- Modern UI/UX with responsive design
- Database schema and async operations
- Deployment and environment configuration
