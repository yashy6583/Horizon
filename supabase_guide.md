# ⚡ Supabase Database Integration Guide

Your application is now fully equipped with **Supabase PostgreSQL** cloud database integration with automatic local SQLite fallback.

---

## Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"**.
2. Log in with GitHub and click **"New Project"**.
3. Set a project name (e.g. `ai-interview-agent`) and a secure database password.
4. Select your preferred region and click **"Create new project"**.

---

## Step 2: Run the SQL Migration & Seed Script

1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar (or press `g` then `s`).
2. Click **"New query"**.
3. Open the file [supabase_schema.sql](file:///c:/Users/yashy/OneDrive/Documents/The%20Interview%20Agent/supabase_schema.sql) in this repository.
4. Copy the entire contents of `supabase_schema.sql` and paste it into the Supabase SQL Editor.
5. Click **"Run"** (or press `Ctrl` + `Enter`).

> **What this creates**:
> - 6 tables: `candidates`, `missions`, `learning_signals`, `interview_sessions`, `conversation_messages`, `recruiter_verdicts`
> - Indexes on `candidate_id` and `session_id` for ultra-fast query latency
> - Row Level Security (RLS) policies for secure frontend/backend operations
> - Initial cohort candidates seed data

---

## Step 3: Connect your Backend to Supabase

1. In your Supabase dashboard, click **Project Settings** (gear icon) → **API**.
2. Copy your **Project URL** and your **service_role secret** key (or `anon` public key).
3. Open or create `backend/.env` in your project folder:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Paste your Supabase credentials here:
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

4. Restart your backend:
```bash
cd backend
npm run dev
```

---

## Architecture & Fallback Mechanism

- **Live Supabase Mode**: When `SUPABASE_URL` is set, all candidates, mission progress, sessions, and recruiter verdicts are read and persisted directly to your Supabase PostgreSQL cloud database!
- **Local SQLite Fallback**: If no environment variables are specified, the backend seamlessly runs off the local database (`data/interview_agent.db`), ensuring 100% offline uptime.
