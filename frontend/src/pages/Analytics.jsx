import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { TrendingUp, Users, FileText, Target } from 'lucide-react';

export default function Analytics() {
  const [matches, setMatches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const m = await api.getMatches();
        setMatches(m || []);
        const p = api.getProjects();
        setProjects(p || []);
      } catch (e) {
        console.error('Error loading analytics', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgMatchScore = matches.length > 0 
    ? Math.round(matches.reduce((sum, m) => sum + (m.match_score || 0), 0) / matches.length)
    : 0;

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
        <p className="text-(--text-muted)">Repository and match analytics, activity over time and signal breakdowns.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="cyber-card p-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-(--text-muted) font-medium">Total Matches</div>
                <div className="mt-2 text-3xl font-bold">{matches.length}</div>
              </div>
              <Users size={32} className="text-(--text-secondary)" strokeWidth={1.5} />
            </div>
          </div>

          <div className="cyber-card p-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-(--text-muted) font-medium">Avg Match Score</div>
                <div className="mt-2 text-3xl font-bold">{avgMatchScore}%</div>
              </div>
              <Target size={32} className="text-(--accent)" strokeWidth={1.5} />
            </div>
          </div>

          <div className="cyber-card p-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-(--text-muted) font-medium">Projects</div>
                <div className="mt-2 text-3xl font-bold">{projects.length}</div>
              </div>
              <FileText size={32} className="text-(--text-secondary)" strokeWidth={1.5} />
            </div>
          </div>

          <div className="cyber-card p-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-(--text-muted) font-medium">Match Rate</div>
                <div className="mt-2 text-3xl font-bold">{projects.length > 0 ? Math.round((matches.length / projects.length) * 100) : 0}%</div>
              </div>
              <TrendingUp size={32} className="text-(--accent)" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {!loading && matches.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="cyber-card p-4 rounded-3xl">
              <h3 className="font-semibold mb-4">Top Matches</h3>
              <div className="space-y-3">
                {matches.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{m.name || m.title}</div>
                      <div className="text-xs text-(--text-secondary) truncate">{m.repo}</div>
                    </div>
                    <div className="ml-2 text-right">
                      <div className="text-lg font-bold text-(--accent)">{m.match_score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cyber-card p-4 rounded-3xl">
              <h3 className="font-semibold mb-4">Match Distribution</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-(--text-muted)">90-100%</span>
                    <span>{matches.filter(m => m.match_score >= 90).length}</span>
                  </div>
                  <div className="h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
                    <div className="h-full bg-(--accent)" style={{ width: `${Math.min(100, (matches.filter(m => m.match_score >= 90).length / Math.max(1, matches.length)) * 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-(--text-muted)">70-89%</span>
                    <span>{matches.filter(m => m.match_score >= 70 && m.match_score < 90).length}</span>
                  </div>
                  <div className="h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
                    <div className="h-full bg-(--accent)" style={{ width: `${Math.min(100, (matches.filter(m => m.match_score >= 70 && m.match_score < 90).length / Math.max(1, matches.length)) * 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-(--text-muted)">Below 70%</span>
                    <span>{matches.filter(m => m.match_score < 70).length}</span>
                  </div>
                  <div className="h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
                    <div className="h-full bg-(--accent)" style={{ width: `${Math.min(100, (matches.filter(m => m.match_score < 70).length / Math.max(1, matches.length)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="mt-8 cyber-card p-8 rounded-3xl text-center">
            <div className="text-(--text-muted)">No match data available yet. Browse the Explore or Matches pages to get started!</div>
          </div>
        )}
      </div>
    </main>
  );
}
