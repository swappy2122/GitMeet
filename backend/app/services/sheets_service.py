import gspread
from oauth2client.service_account import ServiceAccountCredentials
import datetime

# Define the scope
SCOPE = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

def log_match(user_skills, match_title, match_score):
    # Authenticate
    creds = ServiceAccountCredentials.from_json_keyfile_name('service_account.json.json', SCOPE)
    client = gspread.authorize(creds)
    
    # Open the sheet by its name (Make sure it matches exactly!)
    sheet = client.open("OSS Matchmaker Analytics").sheet1
    
    # Prepare the row
    row = [
        str(datetime.datetime.now()), 
        user_skills, 
        match_title, 
        f"{match_score}%"
    ]
    
    sheet.append_row(row)
    return True