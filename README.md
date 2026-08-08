# 🚀 Horizon — AI Interview Agent Platform

[![Live Website](https://img.shields.io/badge/Live_Website-the--interview--agent--topaz.vercel.app-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://the-interview-agent-topaz.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Horizon-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yashy6583/Horizon)
[![React 19](https://img.shields.io/badge/React_19-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

**Horizon** is an autonomous, full-stack **AI Technical Interviewer & Candidate Evaluation Platform**. Built for modern AI engineering cohorts, it conducts real-time voice interviews, evaluates technical depth, tracks learning signals, detects candidate hallucinations, and generates comprehensive recruiter hiring verdicts.

---

## 🌐 Live Application & API Endpoints

| Resource | Description | Direct Link |
| :--- | :--- | :--- |
| 🌐 **Production Website (Primary)** | Main User Interface & AI Platform | **[https://the-interview-agent-five.vercel.app](https://the-interview-agent-five.vercel.app)** |
| 🌐 **Production Website (Mirror)** | Secondary Live Production Domain | **[https://the-interview-agent-topaz.vercel.app](https://the-interview-agent-topaz.vercel.app)** |
| ⚡ **API Health Check** | Live Backend Status & AI Mode | **[https://the-interview-agent-five.vercel.app/health](https://the-interview-agent-five.vercel.app/health)** |
| 📊 **Candidates REST API** | Cohort JSON Data & Performance Signals | **[https://the-interview-agent-five.vercel.app/api/candidates](https://the-interview-agent-five.vercel.app/api/candidates)** |
| 📚 **Curriculum REST API** | 31-Day AI Engineering Skill Matrix | **[https://the-interview-agent-five.vercel.app/api/curriculum](https://the-interview-agent-five.vercel.app/api/curriculum)** |

---

## ✨ Key Features & Capabilities

- 🎙️ **Live Voice & Speech Recognition**: Hands-free real-time audio interaction with Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- 🤖 **Multi-Persona AI Interviewer**: Switch personas (Strict System Architect, Supportive Mentor, Deep-Dive Algorithm Specialist).
- 🚨 **Hallucination Detection Engine**: Identifies candidate technical inaccuracies and flags them in real-time.
- 📊 **Recruiter Hiring Verdict**: Automatically outputs `STRONG_HIRE`, `HIRE`, `BORDERLINE`, or `NO_HIRE` with cited evidence.
- 🎯 **31-Day AI Skill Matrix**: Tracks candidate progression across Embeddings, Vector Databases, RAG, Prompt Engineering, and MCP.
- ⚡ **Hybrid Dual-Mode Database**: Live cloud [Supabase PostgreSQL](supabase_schema.sql) integration with SQLite & in-memory serverless fallback.

---

## 📱 Web Application Pages

| Route Link | Page Name | Description |
| :--- | :--- | :--- |
| **`/`** | **Landing Page** | Platform capabilities presentation, hero section, and cohort statistics. |
| **`/dashboard`** | **Recruiter Dashboard** | Candidate filtering, readiness scores, and mission completion breakdown. |
| **`/start`** | **Interview Setup** | Custom wizard: select job role, domain focus, difficulty level, and AI interviewer persona. |
| **`/interview/live`** | **AI Interview Room** | Real-time transcript, live speech feedback, hint system, and criteria evaluation. |
| **`/curriculum`** | **Skill Matrix** | Interactive 31-day AI engineering curriculum and skill diagnostics. |
| **`/profile/:id`** | **Candidate Profile** | Deep-dive candidate analytics, radar chart strengths, and recruiter verdict notes. |

---

## 🛠️ Tech Stack & Architecture

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, TailwindCSS 4, Framer Motion 13, Lucide Icons, React Router 7 |
| **Backend API** | Node.js, Express.js, TypeScript, OpenAI API SDK, `@vercel/node` Serverless Functions |
| **Database** | Supabase Cloud PostgreSQL, `better-sqlite3`, In-Memory State Store |
| **Hosting** | Vercel Edge Network + GitHub CI/CD |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yashy6583/Horizon.git
cd Horizon
```

### 2. Install dependencies
```bash
# Install frontend & backend dependencies
cd frontend && npm install
cd ../backend && npm install
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend API (Port 3001)
cd backend
npm run dev

# Terminal 2: Frontend Web App (Port 5173)
cd frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🗄️ Database Setup (Supabase)

To connect your live Supabase cloud database:
1. Run [supabase_schema.sql](supabase_schema.sql) in your Supabase project SQL Editor.
2. Follow the setup instructions in [supabase_guide.md](supabase_guide.md).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
