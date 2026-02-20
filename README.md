# MedVision AI

AI-powered Medical Assistant with chat and educational image generation.

## Architecture

```
Frontend (React/Vite)  →  Express Server (Node.js)  →  OpenRouter API
         ↕                                                    
   Supabase (Auth + DB)
```

- **Frontend** – React app (port 5173)
- **Backend** – Express server (port 3001) — holds the OpenRouter API key securely
- **Supabase** – Authentication + chat history storage

---

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your Project URL and anon key
3. In the SQL Editor, run the schema below

**Database Schema:**
```sql
-- Chats table
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chats"
  ON chats FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in their chats"
  ON messages FOR ALL USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
```

### 3. Get OpenRouter API Key

Sign up at [openrouter.ai](https://openrouter.ai) and create an API key.

### 4. Configure Environment Variables

**Frontend** — copy `.env.example` to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SERVER_URL=http://localhost:3001
```

**Backend** — copy `server/.env.example` to `server/.env`:
```
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 5. Run the App

Open **two terminals**:

**Terminal 1 – Frontend:**
```bash
npm run dev
```

**Terminal 2 – Backend:**
```bash
npm run dev:server
```

App opens at `http://localhost:5173`

---

## Safety Features

- **Emergency detection** – Phrases like "chest pain" or "suicidal" trigger an immediate emergency alert
- **Restricted query blocking** – Diagnosis/prescription requests are blocked with a professional referral message
- **Medical disclaimer** – Shown on every conversation
- **API key security** – OpenRouter key is only on the server, never exposed to the browser

---

## Deployment

### Frontend → Vercel / Netlify
Set environment variables in the hosting dashboard and deploy.

### Backend → Railway / Render / Fly.io
Deploy the `server/` folder as a Node.js app. Set `OPENROUTER_API_KEY` and `FRONTEND_URL` as environment variables.
