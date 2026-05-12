# 🏎️ f1-dashboard

A high-performance, real-time Formula 1 telemetry dashboard built on the MERN stack. This application consumes the [OpenF1 API](https://openf1.org/) to visualize live and historical race data, including driver gaps, sector times, track positions, and speed traps.

## 🧠 The Architecture: Defeating the Rate Limit

The OpenF1 API enforces a strict rate limit of 3 requests per second. A standard frontend-to-API polling approach instantly results in `429 Too Many Requests` bans when trying to simulate a race.

To solve this, this application uses a **Database-First Streaming Architecture**:

1. **Smart Caching (`cacheService.js`):** Upon requesting a session, the backend checks if the data exists locally in MongoDB. If not, it sequentially downloads the entire 2-hour session driver-by-driver, pausing between requests to respect OpenF1's limits.
2. **Local Persistence:** Data is stored in MongoDB using highly indexed, compound schemas (`sessionKey` + `driver_number`) to bypass BSON document size limits.
3. **Recursive Metronome Engine:** The backend (or frontend context) runs a recursive loop that pulls frames exactly every 4 seconds. It intelligently detects "Broadcast Gaps" (cars sitting in the garage pre-race) and fast-forwards time by 1-minute increments until track action begins.
4. **WebSocket Streaming:** Data is pushed to the React frontend via Socket.io, resulting in a buttery-smooth 4-second tick rate with absolutely zero load on the OpenF1 servers during playback.

---

## 🚀 Key Features

- **Live Timing Tower:** Real-time driver intervals, derived track positions, and dynamic sector times (Purple/Green/Yellow).
- **Historical Playback:** Simulate any completed session as if it were live.
- **Smart Roster Mapping:** Dynamically fetches active driver numbers and maps them to their 3-letter acronyms (e.g., VER, LEC).
- **Containerized Deployment:** Fully Dockerized with a multi-stage Nginx frontend and a lightweight Alpine Node.js backend.
- **Automated CI/CD:** GitHub Actions pipeline automatically builds, tags, and pushes images to Docker Hub, then deploys to a self-hosted runner.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Context API, Socket.io-client, Axios
- **Backend:** Node.js (v24), Express.js, Socket.io
- **Database:** MongoDB, Mongoose
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

---

## 📁 Project Structure

```text
f1-dashboard/
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI/CD Pipeline
├── backend/
│   ├── controllers/            # Route controllers (race, session, weather)
│   ├── db/
│   │   └── connect.js          # MongoDB connection logic
│   ├── models/
│   │   └── SessionCache.js     # Mongoose Schema for telemetry data
│   ├── routes/                 # Express API routes
│   ├── services/
│   │   ├── cacheService.js     # MongoDB DB Read/Write logic
│   │   ├── openF1Service.js    # External API communication
│   │   └── telemetryStreamService.js # Socket.io metronome engine
│   ├── app.mjs                 # Express server entry point
│   └── Dockerfile              # Node.js Alpine environment
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI (LiveTable, SectorBox)
│   │   ├── context/            # React Context (TelemetryContext)
│   │   └── App.jsx
│   └── Dockerfile              # Multi-stage Vite build + Nginx
└── docker-compose.yml          # Orchestrates Mongo, Backend, and Frontend

```

---

## 💻 Local Development Setup (Without Docker)

### Prerequisites

- Node.js v24+
- MongoDB running locally (Port 27017)

### 1. Backend Setup

```bash
cd backend
npm install

```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/f1dashboard

```

Start the backend development server:

```bash
npm run dev

```

### 2. Frontend Setup

```bash
cd frontend
npm install

```

Start the Vite development server:

```bash
npm run dev

```

---

## 🐳 Docker Deployment

You can spin up the entire application (Database, Backend API, and Nginx Web Server) with a single command.

Ensure Docker and Docker Compose are installed on your machine.

```bash
# Build the images and start the containers in the background
docker compose up --build -d

# Check the logs of all services
docker compose logs -f

# To tear down the environment
docker compose down

```

- **Frontend:** Available at `http://localhost:80`
- **Backend:** Available at `http://localhost:5000`
- **Database Volume:** Persisted locally via `mongo-data`

---

## ⚙️ Environment Variables

| Variable          | Description                       | Default                             | Environment    |
| ----------------- | --------------------------------- | ----------------------------------- | -------------- |
| `PORT`            | The port the Node.js API runs on  | `5000`                              | Backend        |
| `MONGO_URI`       | The connection string for MongoDB | `mongodb://mongo:27017/f1dashboard` | Backend        |
| `DOCKER_USERNAME` | Your Docker Hub Username          | Required                            | GitHub Secrets |
| `DOCKER_PASSWORD` | Your Docker Hub Token             | Required                            | GitHub Secrets |

---

## 📡 API Reference (OpenF1)

This project is powered by the open-source community at [OpenF1](https://openf1.org/).

- Base URL: `https://api.openf1.org/v1/`
- Endpoints utilized: `/sessions`, `/drivers`, `/intervals`, `/position`
- Please respect their usage limits (3 requests per second) by keeping the caching layer intact!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
