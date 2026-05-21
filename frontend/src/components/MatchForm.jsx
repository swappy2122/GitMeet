import { useState } from 'react';
import axios from 'axios';
import { API_ROOT } from '../lib/config';
import { Zap, Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

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
      const res = await axios.post(`${API_ROOT}/match`, {
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
    <div className="w-full max-w-2xl">
      <div className="glass-card card-elevated rounded-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-(--accent) to-blue-600 flex items-center justify-center shadow-glow">
              <Sparkles size={18} className="text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-(--text-primary)">Find Your Match</h2>
          </div>
          <p className="text-(--text-muted) text-sm">Enter your skills to discover curated open-source opportunities tailored to you.</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); startMatching(); }} className="space-y-6" aria-label="Match form">
          <div>
            <label className="block text-sm font-semibold text-(--text-secondary) mb-3">
              Skills & Expertise
            </label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Node.js, Python, Machine Learning..."
              className="w-full px-5 py-3 bg-(--bg-tertiary) border border-(--border-subtle) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all duration-200 resize-none h-24"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-(--danger)/10 border border-(--danger)/30 rounded-lg">
              <AlertCircle size={18} className="text-(--danger) shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-sm text-(--danger)">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !skills.trim()}
            className={`w-full btn-primary flex items-center justify-center ${loading || !skills.trim() ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-disabled={loading || !skills.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" strokeWidth={2} />
                <span>Finding matches...</span>
              </>
            ) : (
              <>
                <Zap size={18} strokeWidth={2} />
                <span>Find Matches</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}