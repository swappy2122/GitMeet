import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router
from app.routes import auth, explore  # Import the auth and explore routers

app = FastAPI()

# MUST BE AT THE TOP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define which origins (URLs) are allowed to talk to your API
origins = [
    "http://localhost:5173",  # Your React/Vite dev server
    "http://127.0.0.1:5173",
]

# Add the CORSMiddleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # explicit allow-list
    # dev-friendly: allow any localhost port (helps if Vite port changes)
    allow_origin_regex=r"^https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],               # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],               # Allows Content-Type, Authorization, etc.
)

app.include_router(router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")  # Include the auth router with the prefix /api/auth
app.include_router(explore.router, prefix="/api")

# Update the uvicorn.run call to include reload=True
if __name__ == "__main__":
    import uvicorn
    # When running directly from backend/app/main.py, the module path needs to be resolved properly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[os.path.dirname(os.path.abspath(__file__))])