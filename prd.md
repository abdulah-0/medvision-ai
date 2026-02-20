
# 📄 Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** MedVision AI
**Product Type:** AI-powered Medical Chatbot with Image Generation
**Platform:** Web Application
**Tech Stack:** React + Supabase + Radix UI + OpenRouter API

### 🎯 Purpose

MedVision AI is a web-based AI assistant that provides general medical information through conversational chat and generates illustrative medical images (e.g., anatomical diagrams, symptom visualizations).

The system is designed for:

* Patients seeking general medical guidance
* Medical students for conceptual visualization
* Health awareness and education

⚠️ The system will not provide diagnoses or replace licensed medical professionals.

---

## 2. Goals & Objectives

### Primary Goals

* Provide reliable general medical information.
* Generate medical diagrams and visual explanations.
* Maintain secure user authentication and session storage.
* Ensure safe AI outputs with proper disclaimers.

### Success Metrics

* User retention rate > 40%
* Response latency < 3 seconds (text)
* Image generation latency < 8 seconds
* Zero critical unsafe medical outputs

---

## 3. Target Users

### 1. General Users

* Individuals seeking symptom explanations
* People wanting health awareness info

### 2. Medical Students

* Students needing quick anatomical visuals
* Users studying disease mechanisms

---

## 4. Core Features

## 4.1 AI Medical Chatbot

### Functional Requirements

* Accept user text input.
* Generate conversational responses.
* Provide:

  * Symptom explanations
  * Disease overviews
  * Preventive measures
  * General treatment information
* Include automatic safety disclaimer in responses.
* Avoid diagnosis or prescription recommendations.

### Non-Functional Requirements

* Response time < 3 seconds.
* Maintain chat session history.
* Rate limiting to prevent abuse.

### API Integration

* Use OpenRouter free model (`openrouter/free`) for text generation.
* Prompt engineered to enforce medical safety compliance.

---

## 4.2 AI Image Generation (Medical Visuals)

### Functional Requirements

* Generate medical diagrams based on user prompts.
* Support:

  * Anatomy diagrams (heart, lungs, brain)
  * Disease visualizations
  * Educational illustrations
* Display generated images within chat UI.
* Store image metadata in database.

### Non-Functional Requirements

* Response time < 8 seconds.
* Images must be educational, not graphic.

### API Integration

* Use OpenRouter multimodal-capable model.
* Request modalities: `["image", "text"]`.

---

## 4.3 Authentication & User Management

### Requirements

* Email/password login.
* Session management.
* Store chat history per user.
* Logout functionality.

### Backend

* Supabase Auth
* Supabase Postgres for storage

---

## 4.4 Chat History Storage

### Database Tables

**Users Table (Supabase Auth)**

* id
* email

**Chats Table**

* id
* user_id
* created_at

**Messages Table**

* id
* chat_id
* role (user / assistant)
* content (text)
* image_url (nullable)
* timestamp

---

## 4.5 Safety & Compliance

### Mandatory Safety Features

* Medical disclaimer displayed prominently:

  > “This AI provides general medical information only. It is not a substitute for professional medical advice.”

* Block high-risk phrases like:

  * “What medication dosage should I take?”
  * “Prescribe me…”
  * “How much insulin should I inject?”

* Emergency detection:
  If user mentions:

  * “Chest pain”
  * “Suicidal”
  * “Severe bleeding”

  System responds with:

  > “Please seek immediate medical attention or contact emergency services.”

---

## 5. User Flow

### 1. User visits website

→ Sees landing page
→ Clicks “Start Chat”

### 2. Authentication

→ Login / Signup via Supabase

### 3. Chat Interface

→ User enters medical question
→ AI responds with text
→ If requested, AI generates medical image

### 4. Chat History

→ Stored in Supabase
→ Accessible from sidebar

---

## 6. UI/UX Requirements

### UI Framework

* React
* Radix UI components
* TailwindCSS (optional styling)

### Components Needed

* Chat Window
* Message Bubbles (User / AI)
* Image Display Component
* Sidebar (Chat History)
* Login Modal
* Disclaimer Banner

### Design Style

* Clean, clinical aesthetic
* White + Blue color scheme
* Professional typography
* Minimalist interface

---

## 7. Technical Architecture

### Frontend

* React (Vite or Next.js)
* Radix UI
* Axios / Fetch for API calls

### Backend

* Supabase:

  * Auth
  * Database
  * Edge Functions (optional for secure OpenRouter calls)

### AI Layer

* OpenRouter API

  * Text Model → Chatbot
  * Multimodal Model → Image Generation

### Security

* OpenRouter API key stored in server environment.
* Never expose API key in frontend.
* Use Supabase Edge Functions as proxy if needed.

---

## 8. Performance Requirements

* Uptime: 99%
* Average response time: < 3 sec
* Concurrent users supported: 1,000 (MVP target)

---

## 9. MVP Scope

### Included in MVP

* Chatbot (text only)
* Basic image generation
* User authentication
* Chat history saving
* Safety disclaimer

### Excluded from MVP

* Voice input
* File upload
* Medical record storage
* HIPAA-level compliance (future phase)

---

## 10. Future Enhancements

* Voice-enabled assistant
* Medical document upload & analysis
* AI symptom checker flow (guided form)
* Doctor consultation integration
* Mobile app version
* Multilingual support

---

## 11. Risks & Mitigation

| Risk                     | Mitigation                                     |
| ------------------------ | ---------------------------------------------- |
| Incorrect medical advice | Strict prompt constraints + disclaimers        |
| API downtime             | Model fallback strategy                        |
| Misuse for diagnosis     | Hard-block restricted queries                  |
| Data privacy concerns    | Encrypted storage + Supabase security policies |

---

# 🏁 Conclusion

MedVision AI will be a scalable, safe, AI-powered medical assistant combining:

* Conversational AI
* Educational medical image generation
* Secure user management
* Clean, professional UI

Built using:

* React
* Supabase
* Radix UI
* OpenRouter APIs


