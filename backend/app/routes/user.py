from fastapi import APIRouter, Header, HTTPException
import requests

router = APIRouter()

@router.get("/profile")
async def get_github_profile(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    headers = {"Authorization": f"token {token}"}
    
    # Fetch User, Repos, and Pull Requests in parallel
    user_res = requests.get("https://api.github.com/user", headers=headers).json()
    repos_res = requests.get("https://api.github.com/user/repos?sort=updated", headers=headers).json()
    
    return {
        "user": user_res,
        "repos": repos_res[:6], # Top 6 most recent
        "stats": {
            "public_repos": user_res.get("public_repos"),
            "followers": user_res.get("followers")
        }
    }