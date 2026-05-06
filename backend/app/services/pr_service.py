import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_pr_draft(issue_title, issue_body, user_match_reason):
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Truncate long descriptions to speed up generation
    body_preview = (issue_body[:200] + "...") if len(issue_body) > 200 else issue_body
    
    prompt = f"""Draft a concise PR for this issue in Markdown:
Title: {issue_title}
Description: {body_preview}

Include only:
1. Summary (1-2 sentences)
2. Changes (3-4 bullets)
3. Testing (quick checklist)"""

    try:
        # Set timeout and stream for faster response
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=20,
                max_output_tokens=300
            ),
            safety_settings=[
                genai.types.SafetySetting(
                    category=genai.types.HarmCategory.HARM_CATEGORY_UNSPECIFIED,
                    threshold=genai.types.HarmBlockThreshold.BLOCK_NONE
                )
            ]
        )
        return response.text
    except Exception as e:
        # Fallback to a template if API fails
        print(f"Error generating PR: {e}")
        return f"""# Pull Request

## Summary
Addressing issue: {issue_title}

## Changes
- Implemented fix for the issue
- Added relevant improvements
- Tested thoroughly

## Testing
- [ ] Manual testing completed
- [ ] No breaking changes
- [ ] Ready for review"""