# DentalSched: Appointment Scheduling with Backtracking

A full-stack constraint-satisfaction solver that schedules dental appointments across dentists and treatment rooms, with an interactive Gantt timeline, a step-by-step algorithm visualizer, and live performance benchmarks.

Built as an Advanced Data Structures & Algorithms project to compare **brute force**, **standard backtracking**, and **backtracking with forward checking + MRV** on the same problem.

![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React%2019-TypeScript-61DAFB?logo=react&logoColor=black)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-SQLite-D71F00)
![Chart.js](https://img.shields.io/badge/Chart.js-benchmarks-FF6384)

## The problem as a CSP

| CSP element | In DentalSched |
|---|---|
| **Variables** | Each appointment request |
| **Domain** | `(room, start_time)` pairs for that request |
| **Constraints** | Room type must match the procedure (General / Endodontic / Imaging) · within the dentist's working hours · no room double-booking · no dentist double-booking |

Room-type and working-hour constraints are applied up front when domains are computed, so the search only explores feasible slots.

## Algorithms

| Algorithm | Strategy | Best for |
|---|---|---|
| **Brute-Force Search** | Assigns without checking constraints, validates only complete schedules (capped at 500,000 states) | Tiny demo dataset, to show why naive search explodes |
| **Standard Backtracking** | Assigns requests in order and undoes an assignment as soon as a constraint breaks | Small datasets |
| **Backtracking + Forward Checking (MRV)** | Picks the request with the fewest remaining options first, then prunes conflicting options from every other request after each assignment; backtracks immediately on a domain wipeout | Medium to extreme datasets |

Every run reports **runtime, states explored, and backtracks**, and can be cancelled mid-search.

## Features

- **Gantt timeline** (SVG) with rooms on the Y-axis and time on the X-axis, so gaps, durations and overlaps are visible at a glance. Design notes: [docs/GANTT_CHART.md](docs/GANTT_CHART.md)
- **Algorithm visualizer** that steps through assignments, conflicts and backtracks
- **Performance chart** comparing algorithms across runs
- **Built-in datasets** (tiny brute-force demo, small realistic, medium synthetic) plus larger generated cases in `backend/assets/data/`, all guaranteed solvable (each dentist loaded to 75–85% of their working hours) with deliberate time conflicts
- **Custom CSV upload** for your own doctors, rooms and requests

## Run locally

**Backend** (Python 3.12+):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python start.py                  # FastAPI on http://127.0.0.1:3013
```

**Frontend** (Node 20+ or Bun):

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173, proxies /api to the backend
```

Pick a dataset, choose an algorithm, and click **Generate Schedule**.

Production runs both services under PM2 (`ecosystem.config.js`).

## API

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/load_dataset?case=…` | Load a built-in dataset into the database |
| `POST` | `/upload_custom` | Upload custom doctors / rooms / requests CSVs |
| `POST` | `/schedule?algorithm=…` | Run the chosen algorithm and return the schedule plus metrics |
| `GET` | `/progress` | Live states explored, backtracks and runtime |
| `POST` | `/cancel` | Stop the running search |

## Project structure

```text
backend/
├── main.py               # FastAPI app and endpoints
├── services/scheduler.py # CSP solver: brute force, backtracking, forward checking + MRV
├── models.py, database.py
├── scripts/              # dataset generator and speed benchmark
└── assets/data/          # built-in datasets (doctors.csv, rooms.csv, requests.csv)
frontend/src/components/  # Dashboard, Gantt timeline, visualizer, performance chart
docs/                     # design and implementation notes
```
