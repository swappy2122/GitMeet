# GitMeet

> ⚠️ **Development Phase**: This project is currently in active development. Features and APIs may change without notice.

Connect with developers through GitHub. GitMeet helps you discover and match with other developers based on your GitHub profiles and interests.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## ✨ Features

- **GitHub Authentication**: Secure login via GitHub OAuth
- **Profile Matching**: AI-powered matching based on GitHub profiles and interests
- **Pull Request Analysis**: Analyze open pull requests to find collaboration opportunities
- **Interactive Dashboard**: Explore and connect with matched developers
- **Google Sheets Integration**: Store and manage user data

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Google Sheets (via Google Sheets API)
- **AI**: Google Gemini API
- **Authentication**: GitHub OAuth
- **APIs**: GitHub API

### Frontend
- **Framework**: React + Vite
- **Styling**: CSS
- **Build Tool**: Vite

## 📁 Project Structure

```
GitMeet/
├── backend/
│   ├── app/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # Data schemas
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   └── main.py              # FastAPI app entry point
│   ├── requirements.txt
│   ├── service_account.json      # Google credentials (ignored)
│   └── GitMeet.code-workspace
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- GitHub OAuth App credentials
- Google Service Account credentials
- Google Sheets API enabled

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (see [Environment Setup](#environment-setup))

5. **Run the backend server**
   ```bash
   python app/main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (create `.env.local` in frontend directory)
   ```
   VITE_API_URL=http://localhost:8000
   VITE_GITHUB_CLIENT_ID=your_github_oauth_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🔑 Environment Setup

### Backend (.env in backend/ directory)

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_OAUTH_CALLBACK_URL=http://localhost:8000/api/auth/github/callback

# Google APIs
GOOGLE_APPLICATION_CREDENTIALS=./service_account.json

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Google Sheets
SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Server
PORT=8000
DEBUG=True
```

### Frontend (.env.local in frontend/ directory)

```env
VITE_API_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_id
```

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Mode

**Backend:**
```bash
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -b 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/github` - Authenticate with GitHub
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user profile

### Matching
- `GET /api/match/explore` - Get list of matched developers
- `POST /api/match/find` - Find matches based on criteria

### Pull Requests
- `GET /api/pr/{user_id}` - Get open PRs for user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For questions or issues, please open an issue on GitHub or contact the development team.