import { useState } from 'react';
import axios from 'axios';
import { API_ROOT } from '../lib/config';
import MatchForm from '../components/MatchForm';
import PRModal from '../components/PRModal';
import {
  Github, BookOpen, ExternalLink, GitPullRequest,
  Star, Zap, Loader2, ChevronRight, Sparkles, FileText, Hexagon
} from 'lucide-react';

const IssueCard = ({ issue, onGeneratePR }) => (
  <div className="group flex items-start gap-4 p-4 rounded-md border border-transparent hover:border-(--border-subtle) hover:bg-(--bg-tertiary) transition-all duration-300">
    <div className="shrink-0 w-9 h-9 rounded-md bg-(--bg-tertiary) flex items-center justify-center mt-0.5">
      <GitPullRequest size={14} className="text-(--text-muted)" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <a href={issue.url} target="_blank" rel="noreferrer"
        className="text-sm font-medium text-(--text-secondary) truncate block group-hover:text-(--text-primary) transition-colors">
        {issue.title}
      </a>
      <p className="text-xs text-(--text-muted) mt-1.5 flex items-center gap-1.5">
        <BookOpen size={11} strokeWidth={2} />
        {issue.repository}
      </p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button onClick={() => onGeneratePR(issue)} title="Generate PR Draft"
        className="p-2 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition-all duration-200">
        <FileText size={15} strokeWidth={2} />
      </button>
      <a href={issue.url} target="_blank" rel="noreferrer"
        className="p-2 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition-all duration-200">
        <ExternalLink size={15} strokeWidth={2} />
      </a>
    </div>
  </div>
);

const MatchCard = ({ match, index, onGeneratePR }) => (
  <div className="group flex items-start gap-4 p-4 rounded-md border border-transparent hover:border-(--border-subtle) hover:bg-(--bg-tertiary) transition-all duration-300"
    style={{ animationDelay: `${index * 60}ms` }}>
    <div className="shrink-0 w-9 h-9 rounded-md bg-(--bg-tertiary) flex items-center justify-center mt-0.5">
      <Zap size={14} className="text-(--text-muted)" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-(--text-secondary) leading-snug group-hover:text-(--text-primary) transition-colors">
        {match.title}
      </p>
      {match.url && (
        <a href={match.url} target="_blank" rel="noreferrer"
          className="text-xs text-(--text-muted) hover:text-(--accent) flex items-center gap-1 mt-2 transition-colors w-fit">
          View Issue <ChevronRight size={11} strokeWidth={2} />
        </a>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-(--bg-tertiary) border border-(--border-subtle) text-(--text-secondary)">
        <Star size={11} strokeWidth={2} /> {match.match_score ?? '—'}
      </span>
      <button onClick={() => onGeneratePR(match)} title="Generate PR Draft"
        className="p-2 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition-all duration-200">
        <FileText size={15} strokeWidth={2} />
      </button>
    </div>
  </div>
);

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');
  const [prDraft, setPrDraft] = useState(null);
  const [generatingPR, setGeneratingPR] = useState(false);

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await axios.get(`${API_ROOT}/issues?language=javascript`);
      setIssues(res.data.data ?? []);
      setActiveTab('issues');
    } catch (e) {
      console.error(e);
    }
    setLoadingIssues(false);
  };

  const handleSetMatches = (m) => {
    setMatches(m);
    setActiveTab('matches');
  };

  const handleGeneratePR = async (issue) => {
    setGeneratingPR(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout
      
      const res = await axios.post(`${API_ROOT}/generate-pr`, {
        title: issue.title,
        body: issue.body ?? 'No description provided.',
        reason: 'I have relevant experience and would like to contribute.',
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      setPrDraft(res.data.draft);
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        alert('PR generation timed out. Please try again.');
      } else {
        console.error('PR generation failed', e);
      }
    }
    setGeneratingPR(false);
  };

  const handleLogin = () => {
    window.location.href = `${API_ROOT}/auth/login`;
  };

  const displayItems = activeTab === 'matches' ? matches : issues;
  const totalCount = displayItems.length;

  return (
     <div className="min-h-screen bg-(--bg-primary) text-(--text-secondary) relative overflow-x-hidden flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="noise" />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-(--border-subtle) bg-(--bg-primary)/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-(--text-primary) flex items-center justify-center">
              <Hexagon size={16} className="text-(--bg-primary)" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-[-0.02em] text-(--text-primary)">
              OSS<span className="text-(--text-muted)">Match</span>
            </span>
          </div>
          <button
            onClick={handleLogin}
            className="btn-ghost text-xs py-2.5 px-5"
          >
            <Github size={15} strokeWidth={2} />
            <span>Sign in with GitHub</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="max-w-5xl w-full mx-auto px-6 py-14 relative z-10">

          {/* ── Hero ── */}
          <section className="text-center mb-14 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-(--bg-tertiary) border border-(--border-subtle) text-[0.65rem] text-(--text-muted) font-semibold uppercase tracking-widest mb-8">
              <Sparkles size={11} strokeWidth={2.5} />
              Powered by Gemini AI
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.04em] text-(--text-primary) mb-5 leading-tight">
              Find Your Perfect<br />
              <span className="shimmer-text">OSS Contribution</span>
            </h1>
            <p className="text-(--text-muted) text-sm max-w-lg mx-auto leading-relaxed">
              Describe your skills and Gemini AI will surface the most relevant open‑source issues across GitHub — tailored to you.
            </p>
          </section>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left: MatchForm + browse button */}
            <div className="flex flex-col gap-3">
              <MatchForm setMatches={handleSetMatches} />

              <button
                onClick={loadIssues}
                disabled={loadingIssues}
                className="btn-ghost w-full py-3.5 text-xs font-medium"
              >
                {loadingIssues
                  ? <><Loader2 size={14} className="animate-spin text-(--text-muted)" strokeWidth={2.5} /> <span>Fetching Issues…</span></>
                  : <><BookOpen size={14} className="text-(--text-muted)" strokeWidth={2} /> <span>Browse GitHub Issues</span></>
                }
              </button>
            </div>

            {/* Center + Right: feed panel */}
            <div className="lg:col-span-2 rounded-md border border-(--border-subtle) bg-(--bg-secondary) p-5 flex flex-col" style={{ minHeight: '560px' }}>

              {/* Tab bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-1 p-1 rounded-md bg-(--bg-tertiary) border border-(--border-subtle)">
                  {[
                    { key: 'issues', label: 'Issues', count: issues.length },
                    { key: 'matches', label: 'Matches', count: matches.length },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center justify-center gap-2 px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
                        activeTab === key
                          ? 'text-(--bg-primary) bg-(--text-primary)'
                          : 'text-(--text-muted) hover:text-(--text-secondary)'
                      }`}
                    >
                      <span>{label}</span>
                      {count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold ${
                          activeTab === key ? 'bg-(--bg-primary)/10 text-(--bg-primary)' : 'bg-(--border-subtle) text-(--text-muted)'
                        }`}>{count}</span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-[0.65rem] text-(--text-muted) font-medium">
                  {totalCount > 0 ? `${totalCount} result${totalCount !== 1 ? 's' : ''}` : 'Waiting…'}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {activeTab === 'matches' && matches.length > 0 ? (
                  matches.map((match, i) => (
                    <MatchCard key={i} match={match} index={i} onGeneratePR={handleGeneratePR} />
                  ))
                ) : activeTab === 'issues' && issues.length > 0 ? (
                  issues.map((issue, i) => (
                    <IssueCard key={i} issue={issue} onGeneratePR={handleGeneratePR} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                    <div className="w-16 h-16 rounded-md bg-(--bg-tertiary) border border-(--border-subtle) flex items-center justify-center">
                      <GitPullRequest size={24} className="text-(--text-muted)" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-(--text-muted) mb-1.5">No results yet</p>
                      <p className="text-xs text-(--text-muted) max-w-65 leading-relaxed">
                        Describe your skills to get AI matches, or browse GitHub issues to explore
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {prDraft && !generatingPR && (
        <PRModal draft={prDraft} onClose={() => setPrDraft(null)} />
      )}
    </div>
  );
}