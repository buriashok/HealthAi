# Modern Health Chatbot & Risk Predictor

A fully responsive, Progressive Web App (PWA) built as a multi-feature Capstone Project. It showcases intelligent symptom tracking, health dashboard monitoring, image-based disease analysis simulation, and location-based facility recommendations.

## 📂 Project Structure

```
project2026/
├── frontend/             ← React + Vite (UI)
│   ├── src/
│   │   ├── components/   (chat, dashboard, nearby, scan, alerts, admin, profile)
│   │   ├── context/      (AppContext for state management)
│   │   └── utils/        (API client for backend)
│   ├── public/
│   ├── vite.config.js    (includes proxy to backend)
│   └── package.json
│
├── backend/              ← Express.js API server
│   ├── server.js         (entry point – port 5000)
│   ├── routes/           (REST endpoints)
│   ├── controllers/      (request/response handlers)
│   ├── services/         (symptom analysis engine)
│   ├── data/             (triage rules database)
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Features

- **Intelligent Symptom Checker**: Analyzes user-described symptoms, asks dynamic follow-up questions, and displays diagnostic probabilities and confidence metrics.
- **Chatbot-Only Multi-Language Support**: The core chat interface supports English and Spanish translations independent of the global layout, aiding accessibility.
- **Health Risk Prediction Dashboard**: A visual representation of health trends, calculating a user's risk level and wellness score based on interaction history.
- **Nearby Healthcare Recommendations**: A mock Interactive Map feature that simulates locating nearby general physicians or clinics based on symptomatic predictions.
- **Image-Based Disease Detection**: Allows users to upload an image of an affected skin area (Simulated CNN interface), which runs mock models to simulate high-confidence triage.
- **Smart Alerts & Reminders**: Dedicated view for medicine scheduling, vaccination alerts, and geographic health warnings.
- **Basic Offline Mode**: Configured with `vite-plugin-pwa` enabling service-worker caching for poor network environments.
- **Admin Panel**: An accessible analytics dashboard displaying total users, interactions, and a tabular view of the triage rules database for easy administration.
- **REST API Backend**: Express.js server with structured routes, controllers, and services for symptom analysis.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Vanilla CSS (Glassmorphism), React Router DOM, Lucide-React, Vite PWA Plugin
- **Backend**: Node.js, Express.js, CORS
- **Architecture**: Monorepo with separate frontend/backend packages

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or above)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd project2026
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application (Development Mode)

You need **two terminals** running simultaneously:

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
```
The API server starts on `http://localhost:5000`.

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```
The Vite dev server starts on `http://localhost:5173` (with proxy to backend).

Open your browser and navigate to `http://localhost:5173`.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/symptoms/analyze` | Analyze symptoms array |
| `POST` | `/api/symptoms/follow-up` | Generate follow-up question |
| `GET` | `/api/symptoms/translation/:lang/:key` | Get translated string |
| `GET` | `/api/diseases` | Get triage rules database |

### Building for Production
```bash
cd frontend
npm run build
npm run preview
```

## 🧠 Architectural Note
*The Machine Learning symptom triage, CNN image recognition, and Geo-tracking logic are currently simulated. The backend architecture (routes → controllers → services) is designed so these modules can be replaced by real ML/AI services (Python/TensorFlow) in a future expansion.*

---
**Developed as a Capstone Project.**
