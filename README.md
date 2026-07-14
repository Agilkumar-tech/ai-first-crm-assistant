# AI-First Life Sciences CRM Agent Assistant

An intelligent, interactive CRM staging interface that combines automated AI form-filling via LLM tool-calling with a manual fallback system. The application parses conversation text dynamically to extract structured medical sales metrics while enabling human-in-the-loop manual adjustments.

## 🚀 Key Features
* **Dynamic Form Extraction:** Auto-populates 10+ CRM data points including HCP (Healthcare Professional) names, interaction types, and inferred sentiment.
* **LangGraph Tool Pipeline:** Utilizes `llama-3.1-8b-instant` via Groq to handle deterministic workflows (`log_interaction`, `edit_interaction`, `append_follow_up_tasks`, `add_distributed_sample`, `clear_form_state`).
* **Synchronized Architecture:** Full Redux Toolkit state management allows simultaneous manual typing and AI updates.
* **Live Timestamps:** Auto-generates current calendar and localized clock metrics on initialization.

## 📂 Project Structure
```text
D:\Python\
├── crm-backend/        # FastAPI Server, LangGraph pipeline, and Groq integration
│   ├── main.py        # Core application entry point
│   └── .venv/         # Python virtual environment
└── crm-frontend/       # React application with Redux Toolkit state management
