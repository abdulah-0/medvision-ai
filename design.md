# 🎨 Frontend Design Document

## Product: MedVision AI

## Stack: React + Supabase + Radix UI + TailwindCSS (optional)

---

# 1. Frontend Architecture Overview

## 1.1 Design Philosophy

The frontend must be:

* Clean and clinical (medical aesthetic)
* Highly accessible (Radix primitives)
* Responsive (desktop + mobile)
* Fast and lightweight
* Secure (no exposed API keys)
* Modular and scalable

---

## 1.2 High-Level Architecture

```
App
 ├── AuthProvider (Supabase Context)
 ├── Router
 │     ├── LandingPage
 │     ├── AuthPage
 │     └── Dashboard
 │            ├── Sidebar (Chat History)
 │            └── ChatContainer
 │                    ├── MessageList
 │                    ├── MessageBubble
 │                    ├── ImagePreview
 │                    └── ChatInput
```

---

# 2. Folder Structure

```
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│
├── components/
│   ├── layout/
│   │     ├── Sidebar.tsx
│   │     ├── Header.tsx
│   │
│   ├── chat/
│   │     ├── ChatContainer.tsx
│   │     ├── MessageList.tsx
│   │     ├── MessageBubble.tsx
│   │     ├── ImageMessage.tsx
│   │     ├── ChatInput.tsx
│   │     ├── TypingIndicator.tsx
│   │
│   ├── auth/
│   │     ├── LoginForm.tsx
│   │     ├── SignupForm.tsx
│
│   ├── common/
│         ├── Button.tsx
│         ├── Loader.tsx
│         ├── DisclaimerBanner.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts
│
├── services/
│   ├── api.ts
│   ├── supabaseClient.ts
│
├── styles/
│   ├── globals.css
```

---

# 3. UI/UX Design System

## 3.1 Color Palette

| Purpose    | Color                  |
| ---------- | ---------------------- |
| Primary    | #2563EB (Medical Blue) |
| Secondary  | #E0F2FE                |
| Background | #F8FAFC                |
| Text       | #1E293B                |
| Warning    | #DC2626                |

Style Direction:

* Clean hospital-like interface
* Soft shadows
* Rounded edges
* White background with subtle blue accents

---

## 3.2 Typography

* Primary Font: Inter / Poppins
* Headings: Semi-bold
* Body: Regular
* Small disclaimers: Smaller grey text

---

# 4. Page-Level Design

---

# 4.1 Landing Page

## Purpose

Introduce product + disclaimer before login.

## Sections

1. Hero Section

   * Headline: “AI-Powered Medical Assistant”
   * Subtext
   * CTA Button → “Start Chat”

2. Features Section

   * AI Chat
   * Medical Image Generation
   * Secure & Private

3. Disclaimer Section

   * Prominent medical warning

---

# 4.2 Authentication Page

Built using Radix Form primitives.

## Components

* Email Input
* Password Input
* Submit Button
* Switch between Login/Signup

## Validation

* Email format validation
* Password min length 6
* Error message display

---

# 4.3 Dashboard Layout

```
-----------------------------------------
| Sidebar |      Chat Area              |
|         |                              |
|         |                              |
-----------------------------------------
```

### Responsive Behavior

* Desktop: Sidebar visible
* Mobile: Sidebar collapsible drawer

---

# 5. Core Chat Interface Design

---

# 5.1 ChatContainer

Main wrapper of chat UI.

Responsibilities:

* Manage selected chat ID
* Fetch messages
* Scroll to bottom on new message
* Display typing indicator

State:

* messages[]
* isLoading
* currentChatId

---

# 5.2 MessageList

Scrollable container.

Behavior:

* Auto-scroll on new message
* Virtualized if message count grows

---

# 5.3 MessageBubble

Props:

* role (user/assistant)
* content
* imageUrl (optional)
* timestamp

Design:

User Message:

* Blue background
* Right aligned

AI Message:

* White background
* Left aligned
* Slight border

---

# 5.4 ImageMessage Component

If imageUrl exists:

* Display responsive image
* Max width: 400px
* Rounded corners
* Light border
* Loading skeleton while loading

Click behavior:

* Opens full-screen preview modal (Radix Dialog)

---

# 5.5 ChatInput Component

Contains:

* Textarea (auto-resizing)
* Send Button
* Image Generation Toggle (optional future)

Features:

* Enter to send
* Shift + Enter for newline
* Disabled while loading
* Character counter

---

# 6. State Management Design

---

# 6.1 Auth State

Handled via:

* Supabase auth listener
* Context API (AuthProvider)

Stores:

* user
* session
* loading

---

# 6.2 Chat State

Handled using custom hook:

useChat()

Manages:

* messages
* loading
* error
* sendMessage()
* generateImage()

---

# 7. API Interaction Layer

All API calls handled inside:

services/api.ts

Example Flow:

1. User sends message
2. Frontend:

   * Adds optimistic message to state
   * Calls backend endpoint
3. Backend returns:

   * text
   * image (optional)
4. UI updates state
5. Store message in Supabase

---

# 8. Loading & Feedback UX

## 8.1 Typing Indicator

Animated dots:

“AI is thinking…”

## 8.2 Image Loading State

Skeleton loader placeholder before image loads.

---

# 9. Accessibility (Radix Strength)

* ARIA labels on inputs
* Keyboard navigation
* Focus states visible
* Screen-reader friendly

---

# 10. Error Handling UI

If API fails:

* Toast notification
* Retry button

If network error:

* Show “Connection issue” banner

---

# 11. Security Considerations (Frontend)

* No OpenRouter API key exposed
* Use environment variables only for public Supabase keys
* All AI requests through backend
* Sanitize user inputs

---

# 12. Performance Optimizations

* Lazy load images
* Debounce typing events
* Memoize components
* Use React Suspense for async components
* Avoid unnecessary re-renders

---

# 13. Mobile Design Considerations

On Mobile:

* Sidebar becomes slide-over drawer
* Chat input fixed at bottom
* Larger tap targets
* Images scale responsively

---

# 14. Future UI Enhancements

* Dark mode toggle
* Voice input button
* Medical topic quick-select chips
* Animated welcome assistant
* Multi-language switch

---

# 15. UI State Diagram (Chat Flow)

```
Idle
 ↓
User Types
 ↓
Send Message
 ↓
Loading State
 ↓
AI Response
 ↓
Display Text
 ↓
If image → Display Image
 ↓
Save to DB
```

---

# 16. Component Responsibility Summary

| Component        | Responsibility     |
| ---------------- | ------------------ |
| Sidebar          | List chat sessions |
| ChatContainer    | Orchestrate chat   |
| MessageList      | Render messages    |
| MessageBubble    | Display message    |
| ImageMessage     | Display AI image   |
| ChatInput        | Handle user input  |
| DisclaimerBanner | Show legal warning |

---

# 17. Design Constraints

* Must remain lightweight (free hosting tier)
* Must avoid over-animations
* Must feel trustworthy and clinical
* Must not resemble entertainment chatbot

---

# 18. Visual Identity Summary

The frontend should feel:

* Professional
* Trustworthy
* Clean
* Calm
* Safe

Not:

* Playful
* Overly colorful
* Casual like social media

---

# ✅ Conclusion

The frontend of MedVision AI is designed to be:

* Modular
* Accessible
* Secure
* Scalable
* Clinically professional
* Fully integrated with Supabase
* Optimized for AI text + image rendering

