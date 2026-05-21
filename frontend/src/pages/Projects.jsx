import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => { setProjects(api.getProjects()); }, []);

  function addProject() {
    if (!text.trim()) return;
    const next = [{ name: text.trim() }, ...projects];
    setProjects(next);
    api.saveProjects(next);
    setText('');
  }

  function removeProject(idx) {
    const next = projects.filter((_, i) => i !== idx);
    setProjects(next);
    api.saveProjects(next);
  }

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold">My Projects / Repos</h1>
        <p className="text-(--text-muted)">Your connected repositories and project settings.</p>

        <div className="mt-6 flex gap-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="owner/repo" className="px-4 py-2 rounded-2xl bg-(--bg-tertiary) border border-(--border-subtle)" />
          <button onClick={addProject} className="btn-primary rounded-2xl px-4 py-2">Add</button>
        </div>

        <div className="mt-6 space-y-4">
          {projects.map((p, i) => (
            <div key={p.name || i} className="cyber-card p-4 rounded-3xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-(--text-secondary)">Last analyzed: just now</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-(--text-muted)">{p.visibility || 'Public'}</div>
                <button onClick={() => removeProject(i)} className="text-sm text-red-400">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
