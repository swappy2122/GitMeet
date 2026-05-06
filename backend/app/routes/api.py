from fastapi import APIRouter, Body, BackgroundTasks, Header
from app.services.github_service import fetch_open_issues
from app.controllers.match_controller import handle_matching
from app.services.pr_service import generate_pr_draft
from app.services.sheets_service import log_match

router = APIRouter()

@router.get("/issues")
async def get_issues(language: str = "python"):
    query = f"label:\"good first issue\" language:{language} state:open"
    issues = fetch_open_issues(query)
    return {"status": "success", "data": issues}

@router.post("/match")
async def match_me(background_tasks: BackgroundTasks, authorization: str = Header(None), data: dict = Body(...)):
    user_skills = data.get("skills")
    language = data.get("language", "python")
    token = None
    if authorization:
        token = authorization.split(" ")[-1]

    # Pass background_tasks to handle_matching
    results = await handle_matching(user_skills, language, token, background_tasks)
    return {"status": "success", "matches": results}

@router.post("/track")
async def track_issue(background_tasks: BackgroundTasks, data: dict = Body(...)):
    # Log to Google Sheets under 'User_Tracked_Issues' in background
    background_tasks.add_task(log_match, data['username'], data['issue_title'], "TRACKED")
    return {"status": "pinned"}

@router.post("/generate-pr")
async def create_pr_draft(data: dict = Body(...)):
    issue_title = data.get("title")
    issue_body = data.get("body", "No description provided.")
    reason = data.get("reason")

    draft = generate_pr_draft(issue_title, issue_body, reason)
    return {"status": "success", "draft": draft}