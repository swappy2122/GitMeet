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

# CORS configuration - allow development frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")  # Include the auth router with the prefix /api/auth
app.include_router(explore.router, prefix="/api")

# Update the uvicorn.run call to include reload=True
if __name__ == "__main__":
    import uvicorn
    # When running directly from backend/app/main.py, the module path needs to be resolved properly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[os.path.dirname(os.path.abspath(__file__))])