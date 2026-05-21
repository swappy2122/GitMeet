import React, { useState } from 'react';
import api from '../lib/api';
import { Star, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_ROOT } from '../lib/config';

export default function Explore() {
  const topics = ['ai', 'infra', 'frontend'];
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPR, setGeneratingPR] = useState({});

  async function search(topic) {
    setLoading(true);
    const res = await api.findMatches(topic);
    setResults(res || []);
    setLoading(false);
  }

  const handleGeneratePR = async (issue) => {
    setGeneratingPR(prev => ({...prev, [issue.url]: true}));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await axios.post(`${API_ROOT}/generate-pr`, {
        title: issue.title,
        body: issue.body ?? 'No description provided.',
        reason: 'I have relevant experience and would like to contribute.',
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      const draft = res.data.draft;
      alert('PR Draft Generated:\n\n' + draft);
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        alert('PR generation timed out. Please try again.');
      } else {
        console.error('PR generation failed', e);
        alert('Failed to generate PR draft');
      }
    } finally {
      setGeneratingPR(prev => ({...prev, [issue.url]: false}));
    }
  };

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold">Explore</h1>
        <p className="text-(--text-muted)">Browse repositories, topics, and signals to discover collaborators.</p>

        <div className="mt-6 flex gap-3">
          {topics.map((t) => (
            <button key={t} onClick={() => search(t)} className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">{t.toUpperCase()}</button>
          ))}
        </div>

        <div className="mt-6">
          {loading && <div className="text-(--text-muted)">Searching...</div>}
          <div className="mt-3 space-y-2">
            {results.map((m, index) => (
              <div key={m.url || m.id || `${m.repo}-${index}`} className="group flex items-start gap-4 p-4 rounded-md border border-transparent hover:border-(--border-subtle) hover:bg-(--bg-tertiary) transition-all duration-300">
                <div className="shrink-0 w-9 h-9 rounded-md bg-(--bg-tertiary) flex items-center justify-center mt-0.5">
                  <Star size={14} className="text-(--text-muted)" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--text-secondary) leading-snug group-hover:text-(--text-primary) transition-colors">
                    {m.title || m.name}
                  </p>
                  <p className="text-xs text-(--text-muted) mt-1">{m.repo}</p>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer"
                      className="text-xs text-(--text-muted) hover:text-(--accent) flex items-center gap-1 mt-2 transition-colors w-fit">
                      View Issue <ChevronRight size={11} strokeWidth={2} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-(--bg-tertiary) border border-(--border-subtle) text-(--text-secondary)">
                    <Star size={11} strokeWidth={2} /> {m.match_score ?? m.score ?? '—'}
                  </span>
                  <button onClick={() => handleGeneratePR(m)} disabled={generatingPR[m.url]} title="Generate PR Draft"
                    className="p-2 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FileText size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
