import axios from 'axios';

// Get API URL - uses environment variable or defaults
let API_URL = '/api';

// In development, use localhost
if (import.meta.env.DEV) {
  API_URL = 'http://localhost:8000/api';
}
// In production, Vite automatically replaces VITE_API_URL
else if (import.meta.env.VITE_API_URL) {
  API_URL = import.meta.env.VITE_API_URL.startsWith('http') 
    ? `${import.meta.env.VITE_API_URL}/api`
    : import.meta.env.VITE_API_URL;
}

const client = axios.create({ baseURL: API_URL, timeout: 5000 });

async function safeGet(url, headers = {}) {
  try {
    const res = await client.get(url, { headers });
    return res.data;
  } catch (e) {
    return null;
  }
}

async function safePost(url, payload = {}, headers = {}) {
  try {
    const res = await client.post(url, payload, { headers });
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function getMatches() {
  // Prefer the fast /explore endpoint when we have a GitHub token
  const token = localStorage.getItem('github_token');
  if (token) {
    // Request AI ranking (fast=false) to get match_score
    const data = await safeGet('/explore?fast=false', { Authorization: `Bearer ${token}` });
    if (Array.isArray(data)) {
      // Normalize: add match_score if missing
      return data.map((item, idx) => ({
        ...item,
        match_score: item.match_score || Math.max(50, 85 - (idx * 5))
      }));
    }
    if (data && data.matches) return data.matches;
  }

  // Fallback: try calling the match POST endpoint (requires server support)
  const postData = await safePost('/match', {}, token ? { Authorization: `Bearer ${token}` } : {});
  if (postData && postData.matches) return postData.matches;

  // ultimate fallback mock
  return [
    { id: 'm1', name: 'Corey Dev', repo: 'example/repo-1', match_score: 92 },
    { id: 'm2', name: 'Ava Engineer', repo: 'example/repo-2', match_score: 86 },
  ];
}

export async function findMatches(skills) {
  const token = localStorage.getItem('github_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const data = await safePost('/match', { skills }, headers);
  return (data && data.matches) || [];
}

export function getProjects() {
  // Return projects from localStorage or default empty array
  const projects = localStorage.getItem('user_projects');
  return projects ? JSON.parse(projects) : [];
}

export function saveProjects(list) {
  localStorage.setItem('gm_projects', JSON.stringify(list));
}

export function getNotifications() {
  try {
    const raw = localStorage.getItem('gm_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

export function saveNotifications(list) {
  localStorage.setItem('gm_notifications', JSON.stringify(list));
}

export default { getMatches, findMatches, getProjects, saveProjects, getNotifications, saveNotifications };
