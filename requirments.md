# 📘 Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for **MedVision AI**, a web-based AI-powered medical chatbot that provides general medical information and generates educational medical images.

This document is intended for:

* Developers
* UI/UX Designers
* Backend Engineers
* Stakeholders
* QA Testers

---

### 1.2 Product Scope

MedVision AI is an educational medical assistant that:

* Provides general medical information via AI chat.
* Generates medical diagrams and visual explanations.
* Stores chat sessions securely.
* Enforces safety guardrails to avoid medical diagnosis or prescriptions.

The system does NOT:

* Replace licensed medical professionals.
* Provide prescriptions or exact dosage recommendations.
* Store official medical records (MVP phase).

---

### 1.3 Definitions

| Term       | Meaning                                |
| ---------- | -------------------------------------- |
| LLM        | Large Language Model                   |
| Multimodal | AI that can generate text and images   |
| OpenRouter | AI routing API provider                |
| Supabase   | Backend-as-a-service (auth + database) |
| Radix UI   | Accessible React component library     |

---

# 2. Overall Description

## 2.1 Product Perspective

MedVision AI is a web application built with:

* Frontend: React
* UI: Radix UI
* Backend: Supabase (Auth + PostgreSQL)
* AI Layer: OpenRouter API

Architecture Flow:

User → React Frontend → Backend (Supabase Edge Function) → OpenRouter API → Response → Stored in Supabase → Displayed to User

---

## 2.2 Product Functions (High-Level)

The system shall:

1. Authenticate users.
2. Accept medical questions.
3. Generate AI responses.
4. Generate educational medical images.
5. Store chat history.
6. Display safety disclaimers.
7. Detect and handle emergency phrases.
8. Block restricted medical requests.

---

## 2.3 User Classes

### 1. Guest Users

* Can view landing page.
* Must register to use chat.

### 2. Registered Users

* Access chat.
* View chat history.
* Generate images.

### 3. Admin (Future)

* Monitor usage.
* Review flagged messages.

---

## 2.4 Operating Environment

* Browser: Chrome, Edge, Safari
* Devices: Desktop + Mobile Responsive
* Hosting: Vercel/Netlify
* Backend: Supabase Cloud
* AI API: OpenRouter

---

# 3. Functional Requirements

---

# 3.1 Authentication Module

### FR-1: User Registration

* Users shall register using email and password.
* Email verification shall be required.

### FR-2: Login

* Users shall log in securely.
* JWT session shall be maintained.

### FR-3: Logout

* Users shall be able to log out securely.

### FR-4: Session Persistence

* Sessions shall persist across refresh.

---

# 3.2 Chat Module

### FR-5: Text Input

* User shall input medical questions.
* Input length limit: 2,000 characters.

### FR-6: AI Response

* System shall send prompt to OpenRouter.
* AI shall return text response.
* Response shall appear in chat bubble.

### FR-7: Safety Disclaimer

* Each conversation shall display disclaimer:

  > “This AI provides general medical information only and is not a substitute for professional medical advice.”

---

# 3.3 Image Generation Module

### FR-8: Image Request Detection

* If user requests:

  * “Show diagram”
  * “Generate image”
  * “Visualize”
* System shall trigger image generation mode.

### FR-9: Image Output

* AI shall return:

  * Base64 image or image URL
  * Optional explanatory text
* Image shall render inside chat.

### FR-10: Storage

* Image URL and metadata shall be saved in database.

---

# 3.4 Chat History Module

### FR-11: Store Conversations

System shall store:

* User ID
* Chat ID
* Messages
* Timestamp
* Image URL (if exists)

### FR-12: Retrieve History

User shall:

* View previous chats
* Continue conversation from history

---

# 3.5 Emergency Detection Module

### FR-13: Emergency Phrase Detection

If message contains:

* “Severe chest pain”
* “I want to kill myself”
* “Overdose”
* “Heavy bleeding”

System shall:

* Skip normal AI generation
* Return emergency alert message:

  > “Please seek immediate medical attention or contact emergency services.”

---

# 3.6 Restricted Query Blocking

### FR-14: Block Diagnosis

If user says:

* “Diagnose me”
* “What disease do I have?”
* “Prescribe medication”

System shall respond:

> “I cannot provide medical diagnoses or prescriptions. Please consult a licensed professional.”

---

# 4. Non-Functional Requirements

---

## 4.1 Performance

* Text response time: < 3 seconds
* Image response time: < 8 seconds
* Support 1,000 concurrent users (MVP goal)

---

## 4.2 Security

* OpenRouter API key stored server-side only.
* HTTPS enforced.
* Supabase Row-Level Security (RLS) enabled.
* Password hashing handled by Supabase Auth.

---

## 4.3 Reliability

* 99% uptime.
* Automatic retry on API failure.
* Fallback model if primary model fails.

---

## 4.4 Scalability

* Horizontal scaling via serverless hosting.
* Database optimized with indexing on:

  * user_id
  * chat_id
  * created_at

---

## 4.5 Usability

* Clean medical UI.
* Accessible components (Radix).
* Responsive design.
* Loading indicators during AI response.

---

# 5. Database Requirements

## Tables

### 5.1 users (Supabase Auth)

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| email      | text      |
| created_at | timestamp |

---

### 5.2 chats

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| title      | text      |
| created_at | timestamp |

---

### 5.3 messages

| Field      | Type                  |
| ---------- | --------------------- |
| id         | UUID                  |
| chat_id    | UUID                  |
| role       | text (user/assistant) |
| content    | text                  |
| image_url  | text (nullable)       |
| created_at | timestamp             |

---

# 6. UI Requirements

## 6.1 Pages

1. Landing Page
2. Login/Signup Page
3. Chat Dashboard

---

## 6.2 Components

* Chat container
* Scrollable message area
* Message bubble (User / AI)
* Image preview component
* Sidebar (history)
* Disclaimer banner
* Loading spinner

---

# 7. API Requirements

## 7.1 OpenRouter Chat Endpoint

POST `/chat/completions`

Body:

* model
* messages
* temperature
* modalities (if image)

---

## 7.2 Backend Proxy

Frontend shall NOT directly call OpenRouter.
All calls must go through:

* Supabase Edge Function
  OR
* Custom backend server

---

# 8. Compliance & Ethical Requirements

* No storage of personal medical records.
* No HIPAA claim (MVP).
* Clear medical disclaimer.
* No diagnostic authority.

---

# 9. Error Handling Requirements

If API fails:

* Show “AI service temporarily unavailable.”
* Log error in database.

If image fails:

* Provide text fallback explanation.

---

# 10. Future Expansion Requirements

* Voice assistant
* Medical document upload
* AI triage flow
* Doctor appointment integration
* Mobile app (React Native)

---

# 11. Constraints

* Budget: Free-tier OpenRouter models.
* Limited compute resources.
* No dedicated medical validation team (MVP).

---

# 12. Assumptions

* Users understand this is informational only.
* OpenRouter free models remain available.
* Supabase free tier sufficient for MVP.

---

# ✅ Summary

MedVision AI shall be:

* Secure
* Educational
* Safe
* Scalable
* AI-powered
* Image-capable
* Built with React + Supabase + Radix UI + OpenRouter

