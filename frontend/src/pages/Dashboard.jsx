import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Github,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  MoveRight,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fallbackMatches = [
  {
    name: 'Signal Forge',
    repo: 'open-source/signal-forge',
    score: 94,
    summary: 'High overlap on Python, observability tooling, and repository hygiene. Strong contribution timing across maintenance-heavy issues.',
    tags: ['Python', 'Observability', 'Maintenance'],
    status: 'Ready for outreach',
    activity: '2 open issues',
    diffLines: [
      '+ Added repository scoring weights for maintainers with recent review activity.',
      '+ Expanded signal heuristics for documentation-heavy issue queues.',
      '- Removed generic popularity bias from the ranking model.',
    ],
  },
  {
    name: 'Web3 Relay',
    repo: 'protocol-labs/web3-relay',
    score: 91,
    summary: 'Commit profile suggests strong fit for smart-contract support tasks, API integration work, and developer experience fixes.',
    tags: ['Web3', 'TypeScript', 'API'],
    status: 'Active sync',
    activity: '5 recent PRs',
    diffLines: [
      '+ Introduced better transaction tracing in the developer dashboard.',
      '+ Added typed response contracts for match previews.',
      '- Removed duplicated request state from the drawer view.',
    ],
  },
  {
    name: 'Studio Orbit',
    repo: 'team/orbit-studio',
    score: 88,
    summary: 'Balanced front-end and backend signal with a clear preference for rapid iteration and polished UX layers.',
    tags: ['React', 'Design Systems', 'Node'],
    status: 'Stable',
    activity: '8 merged PRs',
    diffLines: [
      '+ Added a denser activity stream to surface contributor momentum.',
      '+ Styled the request action to stay visible inside the right rail.',
      '- Removed low-signal badges from the match header.',
    ],
  },
];

const terminalStatus = ['INGEST', 'VECTORIZE', 'RANK', 'SHIELD'];

const formatScore = (value) => `${Math.round(value)}%`;

const getInitials = (value) =>
  value
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const buildMatchCards = (repositories) => {
  if (!repositories.length) return fallbackMatches;

  return repositories.slice(0, 6).map((repository, index) => {
    const language = repository.language || 'JavaScript';
    const score = Math.max(72, 95 - index * 3);

    return {
      name: repository.name,
      repo: repository.full_name,
      score,
      summary: `Repository signal aligns with ${language} work, recent update cadence, and practical collaboration patterns visible in the latest commits.`,
      tags: [language, index % 2 === 0 ? 'Open Source' : 'Tooling', index % 3 === 0 ? 'Fast Merge' : 'Review Ready'],
      status: index === 0 ? 'Priority match' : 'Watchlist',
      activity: `${repository.open_issues_count ?? 0} open issues`,
      diffLines: [
        `+ Strengthened ${language} match weight for this repository cluster.`,
        '+ Added a tighter branch-level activity summary inside the drawer.',
        '- Removed soft language inference from low-confidence sources.',
      ],
    };
  });
};

const MatchRing = ({ score }) => (
  <div
    className="match-ring flex h-14 w-14 items-center justify-center rounded-full text-[0.72rem] font-bold text-(--accent-green)"
    style={{ '--progress': `${score}%` }}
  >
    {formatScore(score)}
  </div>
);

const Tag = ({ children }) => (
  <span className="rounded-full border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
    {children}
  </span>
);

function Drawer({ match, onClose }) {
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close drawer" className="absolute inset-0 bg-[rgba(3,6,12,0.72)] backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-135 border-l border-(--border-subtle) bg-(--bg-secondary) shadow-[0_24px_100px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-(--border-subtle) px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,242,254,0.25)] bg-[rgba(0,242,254,0.08)] text-(--accent)">
                <Layers3 size={18} />
              </div>
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-(--text-muted)">Match deep dive</p>
                <h2 className="mt-1 text-lg font-semibold text-(--text-primary)">{match.name}</h2>
                <p className="text-sm text-(--text-muted)">{match.repo}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-(--border-subtle) p-2 text-(--text-muted) transition-colors hover:border-[rgba(0,242,254,0.45)] hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MatchRing score={match.score} />
                <div>
                  <p className="text-sm text-(--text-muted)">Compatibility score</p>
                  <p className="text-2xl font-bold text-(--text-primary)">{formatScore(match.score)}</p>
                </div>
              </div>

              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(0,242,254,0.45)] bg-[rgba(0,242,254,0.08)] px-4 py-3 text-sm font-semibold text-(--accent) transition-all hover:bg-[rgba(0,242,254,0.12)]">
                Request Connection
                <ArrowRight size={16} />
              </button>
            </div>

            <section className="rounded-3xl border border-(--border-subtle) bg-[rgba(11,15,25,0.72)] p-5">
              <div className="mb-3 inline-flex rounded-full border border-[rgba(0,242,254,0.28)] bg-[rgba(0,242,254,0.08)] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-(--accent)">
                [AI_ANALYSIS]
              </div>
              <p className="text-sm leading-7 text-(--text-secondary)">
                This developer shows strong cross-over potential on {match.tags[0]} and product-facing tooling. The repository pattern indicates high-value collaboration around fast iterations, review-ready changes, and compact feature work.
              </p>
            </section>

            <section className="rounded-3xl border border-(--border-subtle) bg-[rgba(11,15,25,0.8)]">
              <div className="border-b border-(--border-subtle) px-5 py-4">
                <p className="text-sm font-semibold text-(--text-primary)">Pull request diff</p>
              </div>
              <div className="space-y-2 px-5 py-4 code-font text-sm leading-7">
                {match.diffLines.map((line) => {
                  const isAddition = line.startsWith('+');
                  const isRemoval = line.startsWith('-');
                  const lineClassName = isAddition ? 'diff-add' : isRemoval ? 'diff-remove' : 'bg-transparent text-(--text-secondary)';

                  return (
                    <div key={line} className={`rounded-xl px-3 py-2 ${lineClassName}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-(--text-muted)">Status</p>
                <p className="mt-2 text-sm font-semibold text-(--accent-green)">{match.status}</p>
              </div>
              <div className="rounded-3xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-(--text-muted)">Activity</p>
                <p className="mt-2 text-sm font-semibold text-(--text-primary)">{match.activity}</p>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function Dashboard() {
  const token = localStorage.getItem('github_token');
  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    })
      .then((response) => response.json())
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetch('https://api.github.com/user/repos?sort=updated&per_page=12', {
      headers: { Authorization: `token ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setRepositories(Array.isArray(data) ? data : []))
      .catch(() => setRepositories([]));
  }, [token]);

  const displayName = profile?.name || profile?.login || 'Developer';
  const matches = useMemo(() => buildMatchCards(repositories), [repositories]);
  const activeMatch = matches[activeMatchIndex] || matches[0];
  const initials = getInitials(displayName);

  const trackerItems = useMemo(
    () =>
      matches.slice(0, 5).map((match, index) => ({
        title: match.name,
        repository: match.repo,
        time: `${index + 2}m ago`,
      })),
    [matches],
  );

  const openDrawer = (index) => {
    setActiveMatchIndex(index);
    setDrawerOpen(true);
  };

  return (
    <main className="app-shell min-h-screen overflow-hidden bg-(--bg-primary) text-(--text-primary)">
      <div className="absolute inset-0 dot-grid opacity-35" />
      <div className="absolute -left-40 -top-40 h-104 w-104 rounded-full bg-[rgba(0,242,254,0.1)] blur-3xl" />
      <div className="absolute -right-40 top-72 h-104 w-104 rounded-full bg-[rgba(74,242,161,0.08)] blur-3xl" />
      <div className="noise" />

      <div className="relative z-10 mx-auto max-w-400 px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-[28px] border border-(--border-subtle) bg-[rgba(22,27,34,0.75)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,242,254,0.25)] bg-[rgba(0,242,254,0.08)] text-(--accent)">
              <Github size={20} />
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-(--text-muted)">GitMeet</p>
              <h1 className="text-xl font-semibold text-(--text-primary)">Developer matching command center</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-(--text-muted)">
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-white/3 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-(--accent-green) shadow-[0_0_12px_rgba(74,242,161,0.7)]" />
              [CONNECTED TO GOOGLE SHEETS]
            </span>
            {token ? (
              <button type="button" onClick={() => { localStorage.removeItem('github_token'); window.location.href = '/login'; }} className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) px-3 py-1.5 text-(--text-secondary) transition-colors hover:border-[rgba(0,242,254,0.4)] hover:text-white">
                Logout
                <MoveRight size={14} />
              </button>
            ) : (
              <a href="/login" className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) px-3 py-1.5 text-(--text-secondary) transition-colors hover:border-[rgba(0,242,254,0.4)] hover:text-white">
                Connect GitHub
                <ChevronRight size={14} />
              </a>
            )}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_2fr_1fr]">
          <div className="col-span-3 mb-2">
            <div className="flex flex-wrap gap-3">
              <Link to="/matches" className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">Matches</Link>
              <Link to="/explore" className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">Explore</Link>
              <Link to="/projects" className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">Projects</Link>
              <Link to="/analytics" className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">Analytics</Link>
              <Link to="/notifications" className="rounded-2xl border border-(--border-subtle) px-4 py-2 text-(--text-muted)">Notifications</Link>
            </div>
          </div>
          <aside className="space-y-5">
            <section className="cyber-card rounded-3xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(0,242,254,0.2)] bg-[rgba(255,255,255,0.03)] text-lg font-bold text-(--text-primary)">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile avatar" className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-(--text-muted)">Developer profile</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--text-primary)">{displayName}</h2>
                  <p className="text-sm text-(--text-muted)">@{profile?.login || 'demo-mode'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-(--text-muted)">Repos</p>
                  <p className="mt-2 text-2xl font-bold text-(--text-primary)">{repositories.length || '12'}</p>
                </div>
                <div className="rounded-2xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-(--text-muted)">Followers</p>
                  <p className="mt-2 text-2xl font-bold text-(--text-primary)">{profile?.followers ?? '—'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[rgba(74,242,161,0.18)] bg-[rgba(74,242,161,0.06)] px-4 py-4">
                <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-(--accent-green)">
                  <span className="h-2 w-2 rounded-full bg-(--accent-green) shadow-[0_0_12px_rgba(74,242,161,0.65)]" />
                  Sync status
                </div>
                <p className="mt-2 text-sm text-(--text-secondary)">Connected to Google Sheets with live profile and issue ingestion.</p>
              </div>
            </section>

            <section className="cyber-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-(--text-primary)">Repository tags</h3>
                  <RefreshCcw size={14} className="text-(--text-muted)" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(() => {
                    const langs = repositories.slice(0, 4).map((repo) => repo.language).filter(Boolean);
                    const unique = Array.from(new Set(langs));
                    const tags = unique.length ? unique : ['TypeScript', 'Python', 'Docs'];
                    return tags.map((tag) => <Tag key={tag}>{tag}</Tag>);
                  })()}
                </div>
            </section>
          </aside>

          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-(--text-muted)">Matching feed</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-(--text-primary)">High-signal developer matches</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-(--border-subtle) bg-white/3 px-3 py-2 text-sm text-(--text-muted)">
                <Sparkles size={14} className="text-(--accent)" />
                94% match ceiling
              </div>
            </div>

            <div className="grid gap-4">
              {matches.map((match, index) => (
                <button
                  key={`${match.repo}-${match.name}`}
                  type="button"
                  onClick={() => openDrawer(index)}
                  className="cyber-card group rounded-3xl p-5 text-left transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <MatchRing score={match.score} />

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-(--text-muted)">{match.repo}</p>
                          <h3 className="mt-1 text-xl font-semibold text-(--text-primary)">{match.name}</h3>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,242,161,0.22)] bg-[rgba(74,242,161,0.08)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-(--accent-green)">
                          <CheckCircle2 size={12} />
                          {match.status}
                        </span>
                      </div>

                      <p className="max-w-3xl text-sm leading-7 text-(--text-secondary)">{match.summary}</p>

                      <div className="flex flex-wrap gap-2">
                        {match.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>

                    <ChevronRight size={18} className="mt-1 text-(--text-muted) transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="cyber-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-(--text-muted)">PR Collision Tracker</p>
                  <h3 className="mt-1 text-lg font-semibold text-(--text-primary)">Active activity stream</h3>
                </div>
                <MessageSquareText size={16} className="text-(--accent)" />
              </div>

              <div className="mt-5 space-y-3">
                {trackerItems.map((item) => (
                  <div key={`${item.title}-${item.time}`} className="rounded-2xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-(--text-primary)">{item.title}</p>
                        <p className="truncate text-xs text-(--text-muted)">{item.repository}</p>
                      </div>
                      <GitBranch size={14} className="shrink-0 text-(--accent-green)" />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-(--text-muted)">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--accent-green)" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="cyber-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-(--text-muted)">System pulse</p>
                <ShieldCheck size={16} className="text-(--accent-green)" />
              </div>
              <div className="mt-4 space-y-3 code-font text-sm text-(--text-secondary)">
                {terminalStatus.map((step, index) => (
                  <div key={step} className="flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-[rgba(255,255,255,0.03)] px-4 py-3">
                    <span>{String(index + 1).padStart(2, '0')} / {step}</span>
                    <span className="text-(--accent-green)">OK</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {drawerOpen && activeMatch ? <Drawer match={activeMatch} onClose={() => setDrawerOpen(false)} /> : null}
    </main>
  );
}