import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { API_ROOT } from '../lib/config';
import PRModal from '../components/PRModal';
import { FileText, Loader2 } from 'lucide-react';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [prDraft, setPrDraft] = useState(null);
  const [generatingPR, setGeneratingPR] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getMatches().then((m) => { if (mounted) setMatches(m); });
    return () => { mounted = false; };
  }, []);

  function acceptMatch(id) {
    const m = matches.find((x) => x.id === id);
    if (!m) return;
    setAccepted((s) => [m, ...s]);
    setMatches((s) => s.filter((x) => x.id !== id));
  }

  function dismissMatch(id) {
    setMatches((s) => s.filter((x) => x.id !== id));
  }

  async function handleGeneratePR(match) {
    setGeneratingPR(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await axios.post(`${API_ROOT}/generate-pr`, {
        title: match.name || match.title,
        body: match.summary || match.description || 'Interested in contributing to this project.',
        reason: 'I have relevant experience and would like to contribute.',
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      setPrDraft(res.data.draft);
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        alert('PR generation timed out. Please try again.');
      } else {
        console.error('PR generation failed', e);
        alert('Failed to generate PR draft');
      }
    } finally {
      setGeneratingPR(false);
    }
  }

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-2xl font-bold">Matches</h1>
          <button onClick={() => api.getMatches().then(setMatches)} className="text-sm text-(--text-muted) hover:text-white">Refresh</button>
        </div>

        <p className="text-(--text-muted)">Curated developer matches and pairing suggestions.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m, idx) => {
            const key = m.id || m.url || `${m.repo}-${idx}`;
            return (
              <div key={key} className="cyber-card p-4 rounded-3xl">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{m.name}</h3>
                    <p className="mt-2 text-sm text-(--text-secondary)">{m.repo}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {m.match_score !== undefined && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-(--bg-tertiary) px-2 py-1 text-xs font-semibold text-(--accent)">
                        <span>⭐</span>
                        <span>{m.match_score}%</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => acceptMatch(m.id)} className="btn-primary px-3 py-1 rounded-2xl text-xs" title="Accept this match">Accept</button>
                      <button onClick={() => handleGeneratePR(m)} disabled={generatingPR} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--accent) bg-linear-to-br from-(--bg-secondary) to-(--bg-primary) text-(--accent) hover:from-(--accent) hover:to-(--accent) hover:bg-(--accent) hover:text-(--bg-primary) shadow-sm hover:shadow-lg hover:shadow-(--accent)/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none" title="Generate PR Draft">
                        <FileText size={14} strokeWidth={2.5} />
                        <span className="text-xs font-semibold uppercase tracking-wide">PR</span>
                      </button>
                      <button onClick={() => dismissMatch(m.id)} className="px-3 py-1 text-xs text-(--text-muted) hover:text-(--text-primary) rounded-md hover:bg-(--bg-tertiary)" title="Dismiss">Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {accepted.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Accepted</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {accepted.map((a, i) => {
                const keyA = a.id || a.url || `${a.repo}-${i}`;
                return (
                  <div key={keyA} className="cyber-card p-3 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-sm text-(--text-secondary)">{a.repo}</div>
                      </div>
                      <div className="text-sm text-(--text-muted)">Score: {a.score ?? '—'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PR generating overlay */}
      {generatingPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="rounded-md border border-(--border-subtle) bg-(--bg-secondary) p-10 flex flex-col items-center justify-center gap-4 w-full max-w-xs">
            <Loader2 size={24} className="text-(--text-secondary) animate-spin" strokeWidth={2} />
            <p className="text-sm text-(--text-muted) font-medium text-center">Generating PR draft…</p>
          </div>
        </div>
      )}

      {/* PR draft modal */}
      {prDraft && !generatingPR && (
        <PRModal draft={prDraft} onClose={() => setPrDraft(null)} />
      )}
    </main>
  );
}
