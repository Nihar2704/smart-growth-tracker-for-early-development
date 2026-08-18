import os
import sys

# Ensure root directory of backend is on sys.path so 'app' package resolves correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import children_router, growth_router, milestones_router, predictions_router

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Growth Tracker API",
    description="API backend for tracking early childhood physical growth and developmental milestones.",
    version="1.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev server (e.g. http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(children_router)
app.include_router(growth_router)
app.include_router(milestones_router)
app.include_router(predictions_router)




@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Smart Growth Tracker API is running.",
        "documentation": "/docs"
    }
