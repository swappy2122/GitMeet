import { useState } from 'react';
import axios from 'axios';
import { Zap, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function MatchForm({ setMatches }) {
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startMatching = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('github_token');
      const res = await axios.post('http://localhost:8000/api/match', {
        skills,
        language: 'javascript',
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMatches(res.data.matches ?? []);
    } catch (e) {
      console.error('Matching failed', e);
      setError('Failed to fetch matches. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
            <Sparkles size={17} className="text-[var(--text-muted)]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-[-0.01em]">Describe Your Skills</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Gemini AI will find your perfect matches</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-5">
        {/* Textarea */}
        <div>
          <label className="block text-[0.65rem] font-semibold text-[var(--text-muted)] mb-2.5 uppercase tracking-[0.1em]">
            Your Skills & Experience
          </label>
          <textarea
            rows={5}
            value={skills}
            onChange={e => { setSkills(e.target.value); setError(''); }}
            placeholder="e.g., I'm a React developer with experience in Tailwind CSS, Node.js, and TypeScript…"
            className="w-full resize-none rounded-md px-4 py-3.5 text-sm text-[var(--text-secondary)] placeholder-[var(--text-muted)]
                       outline-none transition-all duration-200 leading-relaxed font-normal
                       bg-[var(--bg-primary)] border border-[var(--border-subtle)]
                       focus:border-[var(--border-default)] focus:ring-1 focus:ring-[var(--border-subtle)]"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[0.65rem] text-[var(--text-muted)] font-medium">
              {skills.length} / 500
            </span>
            <span className="text-[0.65rem] text-[var(--text-muted)]">
              {Math.round((skills.length / 500) * 100)}%
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md px-4 py-3 flex items-start gap-2.5 border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]">
            <span className="text-sm mt-0.5">⚠</span>
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={startMatching}
          disabled={loading || !skills.trim()}
          className="btn-primary w-full py-3.5 text-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              <span>Analyzing your skills…</span>
            </>
          ) : (
            <>
              <Zap size={16} strokeWidth={2.5} />
              <span>Find My Perfect Matches</span>
              <ArrowRight size={16} strokeWidth={2} className="opacity-40" />
            </>
          )}
        </button>

        <p className="text-[0.65rem] text-[var(--text-muted)] text-center leading-relaxed">
          Be specific about your skills and experience level for better results.
        </p>
      </div>
    </div>
  );
}