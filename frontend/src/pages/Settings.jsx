import React, { useEffect, useState } from 'react';

export default function Settings() {
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('gm_theme') || 'dark');

  useEffect(() => { setToken(localStorage.getItem('github_token')); }, []);

  function disconnect() {
    localStorage.removeItem('github_token');
    setToken(null);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('gm_theme', next);
  }

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold">Settings</h1>
        <p className="text-(--text-muted)">Account, integrations, and appearance settings.</p>

        <div className="mt-6 space-y-4">
          <div className="cyber-card p-4 rounded-3xl">
            <h3 className="font-semibold">Account</h3>
            <div className="mt-3">
              <div className="text-sm text-(--text-muted)">GitHub token: {token ? 'connected' : 'not connected'}</div>
              {token && <button onClick={disconnect} className="mt-3 text-sm text-red-400">Disconnect</button>}
            </div>
          </div>

          <div className="cyber-card p-4 rounded-3xl">
            <h3 className="font-semibold">Appearance</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-sm text-(--text-muted)">Theme</div>
              <button onClick={toggleTheme} className="btn-primary rounded-2xl px-3 py-1">Toggle ({theme})</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
