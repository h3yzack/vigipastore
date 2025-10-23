# VigiPastore

Personal zero-knowledge password vault.

## Features

- Secure password storage and management
- OPAQUE-based authentication
- Zero-knowledge architecture
- User-friendly web interface

## Project Structure

```
├── backend/          # Python FastAPI backend
├── frontend/         # React + Vite frontend
└── deployments/      # Docker Compose and infrastructure
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
cd deployments
docker-compose up
```

## Development

The application uses:
- FastAPI and SQLAlchemy for the backend
- React and Vite for the frontend
- OPAQUE protocol for authentication
- Docker for containerization

## License

// todo
