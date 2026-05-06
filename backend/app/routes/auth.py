import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
import os

router = APIRouter()

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

@router.get("/login")
async def github_login():
    # We ask for 'repo' and 'user' scopes to see private projects and profile info
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}&scope=repo,user"
    )

@router.get("/callback")
async def github_callback(code: str):
    # Exchange code for a real Access Token
    res = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
        }
    ).json()

    access_token = res.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to get token")

    # Redirect user back to React with the token in the URL
    return RedirectResponse(f"http://localhost:5173/dashboard?token={access_token}")