import { ArrowRight, Github, Shield, Sparkles, Terminal } from 'lucide-react';

const FeaturePill = ({ label }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-white/3 px-4 py-3 text-sm text-(--text-secondary) transition-colors hover:border-[rgba(0,242,254,0.45)] hover:bg-white/5">
    <span className="h-2 w-2 rounded-full bg-(--accent-green) shadow-[0_0_14px_rgba(74,242,161,0.75)]" />
    <span className="font-medium">{label}</span>
  </div>
);

const terminalLines = [
  '[SYSTEM]   Ingesting repositories... OK',
  '[SIGNAL]   Parsing commit velocity... OK',
  '[MATCHING] Ranking cross-over profiles... 94%',
  '[AI_TRACE]  Signal confidence stabilized',
];

export default function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/login';
  };

  return (
    <main className="app-shell min-h-screen overflow-hidden bg-(--bg-primary) text-(--text-primary)">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[rgba(0,242,254,0.14)] blur-3xl" />
      <div className="absolute -right-32 top-32 h-88 w-88 rounded-full bg-[rgba(74,242,161,0.12)] blur-3xl" />
      <div className="noise" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-fade-up space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-white/4 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.24em] text-(--text-muted)">
              <Sparkles size={12} className="text-(--accent)" />
              Developer matching system
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.06em] text-(--text-primary) sm:text-5xl lg:text-6xl">
                Find your next co-creator.
                <span className="shimmer-text block">Driven by git commits.</span>
              </h1>
              <p className="max-w-xl font-mono text-sm leading-7 text-(--text-muted) sm:text-[0.95rem]">
                AI-powered repository analysis for developers who want a sharper signal than follower counts or generic bios.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <FeaturePill label="Repository intelligence" />
              <FeaturePill label="Match scoring" />
              <FeaturePill label="PR draft synthesis" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleLogin}
                className="cyber-button inline-flex items-center justify-center gap-3 rounded-2xl border border-(--border-subtle) bg-transparent px-5 py-4 text-sm font-semibold text-white"
              >
                <Github size={18} />
                Connect with GitHub
                <ArrowRight size={16} className="text-(--text-muted)" />
              </button>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-[rgba(22,27,34,0.7)] px-5 py-4 text-sm text-(--text-muted)">
                <Shield size={16} className="text-(--accent-green)" />
                Public repo data only, no code leaves your GitHub scope.
              </div>
            </div>
          </section>

          <aside className="animate-fade-up rounded-3xl border border-(--border-subtle) bg-[linear-gradient(180deg,rgba(22,27,34,0.96),rgba(12,16,24,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.4)] lg:p-5" style={{ animationDelay: '100ms' }}>
            <div className="terminal-frame overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-(--text-muted)">
                  <Terminal size={13} className="text-(--accent)" />
                  Repository ingest
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
              </div>

              <div className="space-y-3 px-4 py-5 code-font text-[0.82rem] leading-6">
                {terminalLines.map((line, index) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="w-12 shrink-0 text-(--text-muted)">{String(index + 1).padStart(2, '0')}</span>
                    <span className={index === terminalLines.length - 1 ? 'text-(--accent-green)' : 'text-(--text-secondary)'}>
                      {line}
                    </span>
                  </div>
                ))}

                <div className="mt-3 rounded-2xl border border-(--border-subtle) bg-[rgba(11,15,25,0.9)] p-4">
                  <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] text-(--text-muted)">
                    <span>[SYSTEM]</span>
                    <span className="text-(--accent-green)">live</span>
                  </div>
                  <div className="mt-3 space-y-2 text-[0.8rem] text-(--text-secondary)">
                    <div>{'> analyzing commit graph...'} <span className="text-(--accent-green)">ok</span></div>
                    <div>{'> extracting tags...'} <span className="text-(--accent-green)">ok</span></div>
                    <div>{'> building compatibility index...'} <span className="text-(--accent-green)">ok</span></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}