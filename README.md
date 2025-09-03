# Email Assistant — AI-Powered Email Triage

*(React • Node.js • LangChain.js • Gmail API • OAuth 2.0 • Gemini LLM)*

An AI assistant that connects securely to Gmail, fetches emails, and **auto-prioritizes** them into **High / Medium / Low** categories using **Google Gemini via LangChain.js**.
Built with a **React client** for the interface and a **Node.js server** to handle Gmail OAuth, email retrieval, and LLM classification.

---

## ✨ Features

* **Secure Gmail OAuth 2.0 login** for user-specific email access.
* **Email priority classification** (High / Medium / Low) powered by **Google Gemini LLM + LangChain.js**.
* **React client** with a simple, intuitive UI for viewing categorized emails.
* **Node.js server** with APIs for authentication, fetching emails, and classification.
* **Lightweight design** — no external DB/storage required; real-time classification only.

---

## 🧱 Project Structure

```
Email_Assistant/
├─ client/                # React app – UI
│  ├─ src/
│  │  ├─ components/      # Reusable UI parts
│  │  ├─ pages/           # Login, Inbox, Priority views
│  │  ├─ lib/             # API client
│  │  └─ main.jsx|tsx
│  └─ package.json
│
├─ server/                # Node.js + Express + LangChain.js
│  ├─ routes/             # /auth, /emails, /classify
│  ├─ utils/              # helper functions
│  └─ server.js           # entry point
│  └─ package.json
│
└─ README.md
```

---

## 🛠️ Tech Stack

* **Frontend:** React, Axios/Fetch, React Router
* **Backend:** Node.js, Express, LangChain.js
* **Auth & Mail:** Gmail API, OAuth 2.0
* **LLM:** Google Gemini (API key) via LangChain.js

---

## 🔐 Environment Variables

Create `server/.env`:

```env
# Gmail API
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly

# Gemini LLM
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ The **client** does not require `.env` — it only consumes the backend APIs.

---

## 🚀 Local Development

### 1) Server

```bash
cd server
npm install
npm run dev
```

### 2) Client

```bash
cd client
npm install
npm run dev
```

* Server runs on → `http://localhost:4000`
* Client runs on → `http://localhost:5173`

---

## 🔗 Core API Endpoints

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/auth/google`          | Start Google OAuth flow        |
| GET    | `/api/auth/google/callback` | OAuth redirect handler         |
| GET    | `/api/emails`               | Fetch user emails              |
| POST   | `/api/classify`             | Classify emails via Gemini LLM |

---

## 🧠 Email Classification Logic

* Emails are fetched via **Gmail API**.
* Each email snippet is passed to **LangChain.js → Gemini LLM**.
* The LLM responds with a **priority label (High / Medium / Low)** based on context.

Example response:

```json
{
  "emailId": "1783ac9...",
  "subject": "Interview scheduled for Monday",
  "priority": "High"
}
```

---

## 📌 Future Enhancements

* Support for multi-account connections.
* Smart summaries per category.
* Custom rules engine (user-defined filters).

---

⚡ Built to make your inbox **actionable, not overwhelming**.

