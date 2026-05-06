import { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import {
  Bell,
  Compass,
  ExternalLink,
  FileText,
  FolderOpen,
  Github,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import PRModal from '../components/PRModal';

const formatScore = (score) => {
  if (score === undefined || score === null || score === '') return '--';
  const n = Number(score);
  if (!Number.isFinite(n)) return String(score);
  return n <= 1 ? `${Math.round(n * 100)}%` : `${Math.round(n)}%`;
};

const getHeatmapCells = (issuesCount) => {
  const seed = (issuesCount || 1) * 13;
  return Array.from({ length: 56 }, (_, idx) => ((seed + idx * 17) % 5));
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
      active
        ? 'bg-[#1f2a3d] text-white border border-[#324665] shadow-lg shadow-[#205bc8]/20'
        : 'text-[#9fb0cd] hover:text-white hover:bg-[#121c2d]'
    }`}
  >
    <Icon size={16} />
    <span>{label}</span>
  </button>
);

const QuickStatCard = ({ title, value, subtitle }) => (
  <div className="dashboard-card p-5 hover:shadow-lg hover:shadow-[#205bc8]/10 transition-all">
    <p className="text-xs text-[#9eaec8]">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-xs text-[#8ea1c0]">{subtitle}</p>
  </div>
);

const LanguageBarChart = () => {
  const languages = [
    { name: 'PHP', value: 95, color: '#4ad7a8' },
    { name: 'Java', value: 79, color: '#2cc5f5' },
    { name: 'SQL', value: 63, color: '#3b82f6' },
    { name: 'ItQL', value: 51, color: '#245cb8' },
    { name: 'Dyt', value: 44, color: '#1e40af' },
  ];

  return (
    <div className="dashboard-card p-4 h-full">
      <p className="text-sm text-white font-medium">Global Open Source Trends</p>
      <p className="text-xs text-[#96a9c9] mt-1">Popular languages by contribution activity</p>
      <div className="mt-6 space-y-3">
        {languages.map((lang) => (
          <div key={lang.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-[#d5e3ff]">{lang.name}</span>
              <span className="text-xs text-[#88a4d1]">{lang.value}%</span>
            </div>
            <div className="w-full h-2 bg-[#0a2a5f] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${lang.value}%`,
                  background: `linear-gradient(90deg, ${lang.color}, ${lang.color}dd)`,
                  boxShadow: `0 0 12px ${lang.color}44`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationDropdown = ({ isOpen, onClose }) => {
  const notifications = [
    { id: 1, title: 'PR merged!', message: 'Your PR to tensorflow was successfully merged', time: '2h ago', read: false },
    { id: 2, title: 'New match found', message: 'Rust project needs help with documentation', time: '4h ago', read: false },
    { id: 3, title: 'Contribution updated', message: 'Your stats have been updated', time: '1d ago', read: true },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute top-12 right-0 w-80 rounded-lg border border-[#30496f] bg-[#0b1d37] shadow-xl shadow-black/50 overflow-hidden z-50">
        <div className="border-b border-[#30496f] px-4 py-3">
          <p className="text-sm font-semibold text-white">Notifications</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 border-b border-[#1a2d47] transition-colors ${notif.read ? 'bg-transparent' : 'bg-[#1a3a5f]/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{notif.title}</p>
                  <p className="text-xs text-[#88a4d1] mt-1">{notif.message}</p>
                  <p className="text-xs text-[#5a7199] mt-2">{notif.time}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-[#2f72e4] mt-1 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#30496f] px-4 py-3 text-center">
          <button className="text-xs font-medium text-[#2f72e4] hover:text-[#5fa3ff]">View all</button>
        </div>
      </div>
    </>
  );
};

export default function Dashboard() {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'matches', label: 'Matches', icon: Sparkles },
    { key: 'explore', label: 'Explore', icon: Compass },
    { key: 'projects', label: 'My Projects', icon: FolderOpen },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [exploreIssues, setExploreIssues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [prDraft, setPrDraft] = useState(null);
  const [generatingPR, setGeneratingPR] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const notificationRef = useRef(null);

  const token = localStorage.getItem('github_token');

  useEffect(() => {
    if (!token) return;
    fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    })
      .then((r) => r.json())
      .then(setProfile);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: { Authorization: `token ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRepositories(Array.isArray(data) ? data : []))
      .catch(() => setRepositories([]));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingIssues(true);
    fetch('http://localhost:8000/api/explore', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setExploreIssues(Array.isArray(data) ? data.slice(0, 15) : []);
        setLoadingIssues(false);
      })
      .catch(() => setLoadingIssues(false));
  }, [token]);

  const handleFindMatch = async () => {
    if (!profile) return;
    setLoadingMatch(true);
    setStatus('Preparing your profile...');

    const timers = [
      window.setTimeout(() => setStatus('Finding matches...'), 150),
      window.setTimeout(() => setStatus('Ranking results...'), 900),
    ];

    try {
      const repoLanguages = [...new Set((repositories || []).map((repo) => repo?.language).filter(Boolean))].slice(0, 5);
      const skills = [
        profile?.bio,
        repoLanguages.length ? `Languages: ${repoLanguages.join(', ')}` : null,
        `Repos: ${profile?.public_repos ?? 0}`,
      ]
        .filter(Boolean)
        .join('. ');

      const res = await axios.post('http://localhost:8000/api/match', {
        skills: skills || 'Open source developer interested in contributing to GitHub projects.',
        language: repoLanguages[0] || 'javascript',
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const ranked = Array.isArray(res.data?.matches) ? res.data.matches : [];
      setMatches(ranked.slice(0, 8));
      setActiveMatchIndex(0);
      setStatus(ranked.length ? 'Done' : 'No matches returned yet.');
    } catch (e) {
      console.error('Matching failed', e);
      setMatches([]);
      setStatus(e?.code === 'ECONNABORTED' ? 'Timed out while finding matches.' : 'Matching failed.');
    } finally {
      timers.forEach((t) => window.clearTimeout(t));
      setLoadingMatch(false);
    }
  };

  const handleGeneratePR = async (issue) => {
    setGeneratingPR(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout
      
      const res = await axios.post('http://localhost:8000/api/generate-pr', {
        title: issue.title,
        body: issue.body ?? 'No description provided.',
        reason: 'I have experience relevant to this issue and want to contribute.',
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

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    window.location.href = '/login';
  };

  const handleSkipCard = () => {
    setSwipeDirection('left');
    setTimeout(() => {
      setActiveMatchIndex((prev) => Math.min(prev + 1, activeMatches.length));
      setSwipeDirection(null);
    }, 300);
  };

  const handleDraftCard = () => {
    setSwipeDirection('right');
    setTimeout(() => {
      handleGeneratePR(swipeCard);
      setSwipeDirection(null);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const topIssue = matches[0] || exploreIssues[0];
  const activeMatches = (matches.length ? matches : exploreIssues.slice(0, 8));
  const swipeCard = activeMatches[activeMatchIndex];
  const contributionScore = useMemo(() => {
    const base = (profile?.public_repos || 0) + (profile?.followers || 0) + exploreIssues.length;
    const bounded = 65 + (base % 35);
    return bounded;
  }, [profile, exploreIssues.length]);

  const heatmapCells = useMemo(() => getHeatmapCells(exploreIssues.length), [exploreIssues.length]);
  const displayName = profile?.name || profile?.login || 'Developer';

  const renderDashboardSection = () => (
    <>
      <h1 className="text-3xl font-semibold text-white">Developer Dashboard</h1>
      <p className="mt-1 text-[#9fb0cd]">Welcome back, {displayName}. Let&apos;s find your next contribution.</p>

      <h2 className="mt-7 text-lg font-semibold text-white">Quick Stats</h2>
      <section className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="dashboard-card p-5">
          <p className="text-sm text-white font-medium">Contribution Health Score</p>
          <div className="mt-4 dashboard-gauge-wrap">
            <div className="dashboard-gauge-core">
              <p className="text-3xl font-bold text-white">{contributionScore}</p>
              <p className="text-xs text-[#69e98b] font-semibold mt-1">Active</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#9fb0cd]">
            Vertex AI Insight: your open-source consistency improved this month.
          </p>
        </div>

        <QuickStatCard title="Active PRs" value="3" subtitle="2 approved, 1 under review" />
        <QuickStatCard title="Open Matches" value={activeMatches.length || 8} subtitle="Personalized opportunities waiting" />
        <QuickStatCard
          title="GitHub Impact"
          value={`${profile?.public_repos ?? 0} repos`}
          subtitle={`${profile?.followers ?? 0} followers, last 30 days`}
        />
      </section>

      <section className="mt-4 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-3 min-w-0">
          <LanguageBarChart />
        </div>

        <div className="dashboard-card p-5 col-span-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 flex-shrink-0">
            <div>
              <p className="text-lg text-white font-semibold">Top Recommended Matches</p>
              <p className="text-xs text-[#9fb0cd] mt-1">Swipe through your personalized matches</p>
            </div>
            <button
              type="button"
              onClick={handleFindMatch}
              disabled={loadingMatch || !profile}
              className="px-3 py-2 rounded-lg bg-[#205bc8] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[#2564d9] transition-colors flex-shrink-0"
            >
              {loadingMatch ? 'Ranking...' : 'Refresh'}
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-[#30496f] bg-[#0b1d37] p-4 relative flex-1 overflow-hidden">
            {loadingIssues || loadingMatch ? (
              <div className="h-44 grid place-items-center">
                <div className="flex items-center gap-2 text-[#9fb0cd] text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {status}
                </div>
              </div>
            ) : topIssue ? (
              <>
                <div className={`transition-all duration-300 ${swipeDirection === 'left' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'} ${swipeDirection === 'right' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                  <p className="text-xs text-[#88a4d1]">Project: {topIssue.repository_url?.replace('https://api.github.com/repos/', '') || 'open-source/project'}</p>
                  <p className="mt-3 text-xl text-white font-semibold leading-snug">{topIssue.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(topIssue.labels || []).slice(0, 3).map((label, idx) => (
                      <span
                        key={`${label?.name || 'label'}:${idx}`}
                        className="px-2 py-1 rounded-md text-xs font-medium border"
                        style={{
                          borderColor: `#${label.color || '5f83c8'}66`,
                          color: `#${label.color || '9fc3ff'}`,
                          background: `#${label.color || '2a3f67'}22`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#29446b] bg-[#0b182c] p-3">
                      <p className="text-xs text-[#89a0c5]">Similarity Score</p>
                      <p className="mt-1 text-2xl text-[#69e98b] font-semibold">{formatScore(topIssue.match_score || 95)}</p>
                    </div>
                    <div className="rounded-lg border border-[#29446b] bg-[#0b182c] p-3">
                      <p className="text-xs text-[#89a0c5]">Estimated Time</p>
                      <p className="mt-1 text-2xl text-white font-semibold">5-8 hours</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={topIssue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#2f72e4] text-white text-sm font-semibold hover:bg-[#3d7ff2] transition-colors"
                    >
                      View Issue on GitHub
                    </a>
                    <button
                      type="button"
                      onClick={handleDraftCard}
                      className="px-4 py-2 rounded-lg border border-[#35527b] bg-[#10203a] text-[#d3e1fb] text-sm font-semibold hover:bg-[#1a2a47] transition-colors"
                    >
                      Draft PR
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipCard}
                      className="px-4 py-2 rounded-lg border border-[#35527b] bg-[#10203a] text-[#d3e1fb] text-sm font-semibold hover:bg-[#1a2a47] transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>

                {/* Stacked cards preview */}
                {activeMatches[activeMatchIndex + 1] && (
                  <div className="absolute inset-4 rounded-2xl border border-[#30496f] bg-[#0a1629] p-4 transform translate-y-2 translate-x-1 opacity-50 pointer-events-none">
                    <p className="text-xs text-[#88a4d1]">Next: {activeMatches[activeMatchIndex + 1].repository_url?.replace('https://api.github.com/repos/', '') || 'repo'}</p>
                    <p className="mt-2 text-sm text-white font-semibold line-clamp-2">{activeMatches[activeMatchIndex + 1].title}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-44 grid place-items-center text-[#9fb0cd] text-sm">No matches found yet.</div>
            )}
          </div>

          {/* Navigation dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {activeMatches.slice(0, Math.min(5, activeMatches.length)).map((_, idx) => (
              <button
                key={`dot:${idx}`}
                type="button"
                onClick={() => {
                  setSwipeDirection(null);
                  setActiveMatchIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${activeMatchIndex === idx ? 'bg-[#2f72e4] w-7' : 'bg-[#3e557a] hover:bg-[#5a7199]'}`}
              />
            ))}
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4 min-w-0">
          <div className="dashboard-card p-4 flex-shrink-0">
            <p className="text-sm text-white font-semibold">Your Tech Stack</p>
            <div className="mt-4 flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-11 h-11 rounded-full object-cover border border-[#30486c]" alt="profile" />
              ) : (
                <div className="w-11 h-11 rounded-full border border-[#30486c] bg-[#0a1628] grid place-items-center">
                  <Github size={16} className="text-[#9fb0cd]" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">{displayName}</p>
                <p className="text-xs text-[#9fb0cd]">GitHub Profile</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="dashboard-tag">Python</span>
              <span className="dashboard-tag">TensorFlow</span>
              <span className="dashboard-tag">JAX</span>
              <span className="dashboard-tag">Rust</span>
            </div>
            <div className="mt-4 dashboard-heatmap">
              {heatmapCells.map((value, idx) => (
                <span key={`cell:${idx}:${value}`} className={`dashboard-cell lvl-${value}`} />
              ))}
            </div>
          </div>

          <div className="dashboard-card p-4 flex-1 overflow-y-auto">
            <p className="text-sm text-white font-semibold">Recent Recommendations</p>
            <div className="mt-3 space-y-3">
              {(activeMatches.slice(0, 3) || []).map((issue, idx) => (
                <div key={issue?.id || idx} className="rounded-lg border border-[#2a3f60] bg-[#0a1628] p-3 hover:border-[#3d567b] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#d5e3ff] line-clamp-2">{issue.title}</p>
                    <button
                      type="button"
                      onClick={() => handleGeneratePR(issue)}
                      className="text-[#9fb0cd] hover:text-[#2f72e4] transition-colors flex-shrink-0"
                      title="Generate PR Draft"
                    >
                      <FileText size={15} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[#88a4d1]">{formatScore(issue.match_score)}</span>
                    <a href={issue.html_url || issue.url} target="_blank" rel="noreferrer" className="text-xs text-[#76a7ff] inline-flex items-center gap-1 hover:text-[#a3c5ff]">
                      Open <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-4">
            <p className="text-sm text-white font-semibold">System Logs & Vertex AI Activity</p>
            <div className="mt-3 space-y-3">
              <div className="border-l-2 border-[#2f72e4] pl-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white">Recommendatin</p>
                  <span className="text-xs text-[#5a7199]">1h ago</span>
                </div>
                <p className="text-xs text-[#88a4d1] mt-1">Recent recommendations processed</p>
              </div>
              <div className="border-l-2 border-[#69e98b] pl-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white">Recommendatin</p>
                  <span className="text-xs text-[#5a7199]">2h ago</span>
                </div>
                <p className="text-xs text-[#88a4d1] mt-1">Recent recommendations processed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderMatchesSection = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Matches</h1>
          <p className="mt-1 text-[#9fb0cd]">Swipe through matches and take action.</p>
        </div>
        <button onClick={handleFindMatch} disabled={loadingMatch} className="px-4 py-2 rounded-lg bg-[#2f72e4] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#3d7ff2] transition-colors">
          Refresh Matches
        </button>
      </div>
      <div className="dashboard-card p-6">
        {!swipeCard ? (
          <p className="text-[#9fb0cd]">No more matches. Refresh to load new items.</p>
        ) : (
          <>
            <p className="text-xs text-[#88a4d1]">{swipeCard.repository_url?.replace('https://api.github.com/repos/', '') || 'repository'}</p>
            <h3 className="text-2xl text-white font-semibold mt-2">{swipeCard.title}</h3>
            <p className="text-sm text-[#9fb0cd] mt-3">Why this match: similar stack and contribution history.</p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <a href={swipeCard.html_url || swipeCard.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#2f72e4] text-white text-sm font-semibold hover:bg-[#3d7ff2] transition-colors">
                View on GitHub
              </a>
              <button
                type="button"
                onClick={handleSkipCard}
                className="px-4 py-2 rounded-lg border border-[#35527b] bg-[#10203a] text-[#d3e1fb] text-sm font-semibold hover:bg-[#1a2a47] transition-colors"
              >
                Skip
              </button>
              <button type="button" onClick={handleDraftCard} className="px-4 py-2 rounded-lg border border-[#35527b] bg-[#10203a] text-[#d3e1fb] text-sm font-semibold hover:bg-[#1a2a47] transition-colors">
                Draft PR
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 justify-center">
              {activeMatches.slice(0, Math.min(5, activeMatches.length)).map((_, idx) => (
                <button
                  key={`dot:${idx}`}
                  type="button"
                  onClick={() => {
                    setSwipeDirection(null);
                    setActiveMatchIndex(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeMatchIndex === idx ? 'bg-[#2f72e4] w-7' : 'bg-[#3e557a] hover:bg-[#5a7199]'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );

  const renderExploreSection = () => (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-white">Explore</h1>
      <p className="text-[#9fb0cd]">Browse open-source opportunities from the global feed.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {exploreIssues.map((issue, idx) => (
          <div key={issue?.id || idx} className="dashboard-card p-4">
            <p className="text-xs text-[#88a4d1]">{issue.repository_url?.replace('https://api.github.com/repos/', '') || 'repo'}</p>
            <p className="text-white mt-2 line-clamp-2">{issue.title}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[#88a4d1]">{formatScore(issue.match_score || 84)} fit</span>
              <a href={issue.html_url || issue.url} target="_blank" rel="noreferrer" className="text-xs text-[#76a7ff]">Open</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSimpleSection = (title, description) => (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <div className="dashboard-card p-6">
        <p className="text-[#9fb0cd]">{description}</p>
      </div>
    </section>
  );

  const renderActiveSection = () => {
    if (activeSection === 'dashboard') return renderDashboardSection();
    if (activeSection === 'matches') return renderMatchesSection();
    if (activeSection === 'explore') return renderExploreSection();
    if (activeSection === 'analytics') return renderSimpleSection('Analytics', 'Metrics panel is visible and ready for chart integrations.');
    if (activeSection === 'projects') return renderSimpleSection('My Projects', 'Project workspace is visible and ready for repository pinning.');
    return renderSimpleSection('Settings', 'Settings panel is visible and ready for preferences wiring.');
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#dbe7ff] flex">
      <aside className="w-64 border-r border-[#1d2a42] bg-[#09172b] p-4 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#1f74ff] flex items-center justify-center">
            <Github size={18} className="text-white" />
          </div>
          <p className="text-xl font-semibold text-white">GitMeet</p>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeSection === item.key}
              onClick={() => setActiveSection(item.key)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#9fb0cd] hover:text-white hover:bg-[#121c2d] transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-[#1d2a42] bg-[#0c1b31] px-4 md:px-8 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8095bb]" />
              <input
                className="w-full rounded-xl border border-[#223352] bg-[#0a1628] pl-10 pr-4 py-2.5 text-sm text-[#dbe7ff] placeholder:text-[#7f93b8] focus:outline-none focus:border-[#3f6bbb] focus:shadow-lg focus:shadow-[#205bc8]/20"
                placeholder="Search repos, issues, developers..."
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="w-9 h-9 rounded-lg border border-[#23324e] bg-[#0a1628] text-[#9fb0cd] hover:text-white hover:border-[#3d567b] grid place-items-center transition-colors relative"
                >
                  <Bell size={16} />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[#2f72e4] rounded-full" />
                </button>
                <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
              </div>
              <div className="flex items-center gap-2">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-[#334867] hover:border-[#3d567b] transition-colors cursor-pointer" />
                ) : (
                  <div className="w-9 h-9 rounded-full border border-[#334867] bg-[#0a1628] grid place-items-center">
                    <UserCheck size={14} className="text-[#9fb0cd]" />
                  </div>
                )}
                <span className="text-sm text-[#d7e5ff] hidden md:block">{displayName}</span>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 flex-1 overflow-y-auto">
            {renderActiveSection()}
          </main>
        </div>

        {generatingPR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(8,14,25,0.72)', backdropFilter: 'blur(10px)' }}>
            <div className="rounded-xl border border-[#314a73] bg-[#0d1b31] p-8 flex flex-col items-center gap-4 w-full max-w-xs">
              <Loader2 size={24} className="text-[#76a7ff] animate-spin" strokeWidth={2} />
              <p className="text-sm text-[#dbe7ff] font-semibold">Generating PR draft</p>
              <p className="text-xs text-[#7f93b8]">This typically takes 5-10 seconds...</p>
              <div className="w-full h-1 bg-[#1a2f4e] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#76a7ff] to-[#2f72e4] animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {prDraft && !generatingPR && <PRModal draft={prDraft} onClose={() => setPrDraft(null)} />}
      </div>
  );
}