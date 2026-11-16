<div align="center">

# ⚡ TaskAssigner

**Deterministic, Rule-Based Task Allocation & Workforce Management Platform**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Backend-Python%20%2F%20FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Auth%20%26%20DB-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Engine%20API-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

[Live Demo](https://your-app.vercel.app) · [Report Bug](https://github.com/ahmadzeina/Rule-Based-Algorithm-for-Tasks-Assignments/issues) · [Request Feature](https://github.com/ahmadzeina/Rule-Based-Algorithm-for-Tasks-Assignments/issues)

</div>

---

## 📖 Overview

**TaskAssigner** is a full-stack task management and automated resource-allocation platform designed to eliminate manual bottlenecks and subjective bias in team task distribution.

Instead of relying on ad-hoc assignments or opaque black-box heuristics, TaskAssigner evaluates incoming tasks against team member profiles, active workloads, skill tags, and priority constraints through a dedicated **Rule-Based Allocation Engine**—producing transparent, deterministic, and auditable assignments.

---

## ✨ Key Features

- **⚙️ Deterministic Rule-Based Allocation Engine:** Automatically matches tasks to optimal team members based on configurable scoring rules (skill compatibility, current workload capacity, task priority, and availability).
- **📊 Real-Time Operations Dashboard:** High-level workspace overview tracking active assignments, unassigned queues, bottlenecks, and completion rates.
- **👥 Team & Capacity Management:** Manage team rosters, role specializations, maximum concurrent task thresholds, and availability states.
- **📈 Allocation Analytics:** Visual breakdown of workload distribution across team members to prevent burnout and identify underutilized capacity.
- **🔐 End-to-End Authentication:** Secure email/password authentication, session persistence, and route protection powered by Supabase Auth.
- **🌐 Production Decoupled Architecture:** Independent frontend and backend deployments communicating over REST with strict CORS and token validation.

---

## 🏗️ System Architecture

TaskAssigner is built as a decoupled, multi-service production architecture separating the UI/auth layer from the computational assignment engine:

```text
┌─────────────────────────────┐         HTTPS / REST          ┌─────────────────────────────┐
│      Next.js Frontend       │ ────────────────────────────► │    Python Engine API        │
│     (Hosted on Vercel)      │ ◄──────────────────────────── │    (Hosted on Railway)      │
└──────────────┬──────────────┘         JSON Payloads         └──────────────┬──────────────┘
               │                                                             │
               │ Auth & Session                                              │ Read / Write
               ▼                                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Supabase (Auth & PostgreSQL)                             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS | Responsive dark-mode workspace UI, client/server routing |
| **Backend Engine** | Python (FastAPI / Pydantic) | Rule-based scoring, constraint evaluation, REST endpoints |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | User registration, login, password recovery, JWT session handling |
| **Database** | PostgreSQL (via Supabase) | Relational storage for workspaces, tasks, rules, and team profiles |
| **Infrastructure** | Vercel + Railway | Continuous deployment for frontend edge network & backend container |

---

## 🧠 How the Allocation Engine Works

When a task is submitted for automated assignment, the engine executes a multi-stage filtering and scoring pipeline:

1. **Eligibility Filtering (Hard Constraints):** Filters out team members who lack required skills, are marked unavailable, or have reached their maximum active workload capacity.
2. **Weighted Rule Scoring (Soft Constraints):** Evaluates eligible candidates using weighted criteria:
   - **Skill Match Score:** Alignment between task requirements and member expertise.
   - **Load Balancing Factor:** Favors members with lower current utilization ratios to maintain equitable workload distribution.
   - **Priority & Deadline Urgency:** Adjusts weights for high-priority or time-sensitive tasks.
3. **Deterministic Selection & Audit Trail:** Selects the highest-scoring candidate and logs the assignment rationale so workspace leads can verify *why* a specific member was chosen.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** `>= 18.x`
- **Python** `>= 3.10`
- A **Supabase** project (URL & Anon Key)

### 1. Clone the Repository

```bash
git clone https://github.com/ahmadzeina/Rule-Based-Algorithm-for-Tasks-Assignments.git
cd Rule-Based-Algorithm-for-Tasks-Assignments
```

### 2. Backend Setup (Engine API)

```bash
cd backend  # adjust path if backend is in root/server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in your backend directory:

```env
DATABASE_URL=your_supabase_postgres_connection_string
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_or_anon_key
ALLOWED_ORIGINS=http://localhost:3000
```

Run the backend server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup (Next.js)

```bash
cd frontend  # adjust path if frontend is in root
npm install
```

Create a `.env.local` file in your frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Production Deployment

- **Frontend (Vercel):** Connected directly to the `main` branch with environment variables configured for production Supabase credentials and the Railway Engine API URL.
- **Backend (Railway):** Deployed as an independent Python service exposing the `/docs` OpenAPI specification and health-check endpoints monitored directly from the dashboard status indicator.

---

## 📸 Screenshots

| Sign-In & Auth | Workspace Dashboard |
| --- | --- |
| ![Sign-In](docs/login.png) | ![Dashboard](docs/dashboard.png) |

| Tasks & Assignments |
| --- |
| ![Tasks](docs/tasks.png) |

---

## 🗺️ Roadmap

- [ ] Custom weight sliders for workspace admins to tune rule priorities via the UI
- [ ] Webhook / email notifications upon task assignment
- [ ] Role-Based Access Control (Admin vs. Team Member views)
- [ ] Exportable CSV/PDF allocation audit reports

---

## 👤 Author

**Ahmad Zeina**

- GitHub: [@ahmadzeina](https://github.com/ahmadzeina)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
