import { Github, Sparkles, GitMerge, Zap, GitPullRequest, Shield, ArrowRight, Hexagon } from 'lucide-react';

const FeaturePill = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3 px-5 py-4 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] font-medium hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 group">
    <div className="w-8 h-8 rounded-md bg-[var(--bg-tertiary)] flex items-center justify-center group-hover:bg-[var(--bg-tertiary)] transition-colors">
      <Icon size={15} className="text-[var(--text-primary)]" strokeWidth={2} />
    </div>
    <span className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{label}</span>
  </div>
);

export default function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/login";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)' }} />

      <div className="noise" />

      {/* Main content — centralized */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto px-6 py-10 animate-fade-up">

        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-14">
          <div className="relative mb-8">
            {/* Logo mark */}
            <div className="w-16 h-16 rounded-md bg-[var(--text-primary)] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.06)]">
              <Hexagon size={28} className="text-[var(--bg-primary)]" strokeWidth={2.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-md border border-white/10" 
              style={{ animation: 'pulse-ring 3s cubic-bezier(0,0,0.2,1) infinite' }} />
          </div>

          <h1 className="text-[2.5rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] leading-none mb-4 text-center">
            OSS <span className="shimmer-text">Matchmaker</span>
          </h1>
          <p className="text-[var(--text-muted)] text-[0.95rem] leading-relaxed text-center max-w-[360px] font-normal">
            AI-powered GitHub profile analysis. Find your perfect open‑source contributions.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-7 mx-auto">

          {/* Features */}
          <div className="flex flex-col gap-2.5 mb-7">
            <FeaturePill icon={Zap} label="AI-Powered Issue Matching" />
            <FeaturePill icon={GitPullRequest} label="Auto PR Draft Generator" />
            <FeaturePill icon={Shield} label="Secure GitHub OAuth 2.0" />
          </div>

          <div className="gradient-divider mb-7" />

          {/* CTA Button */}
          <button
            onClick={handleLogin}
            className="btn-primary w-full py-4 text-[0.9rem] font-semibold tracking-[-0.01em] rounded-md"
          >
            <Github size={18} strokeWidth={2.5} />
            <span>Continue with GitHub</span>
            <ArrowRight size={16} strokeWidth={2} className="opacity-50" />
          </button>

          <p className="text-center text-xs text-[var(--text-muted)] mt-5 leading-relaxed font-medium">
            We only read your public GitHub data. Your code stays private.
          </p>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {['Secure OAuth', 'No Data Stored', 'Open Source'].map((label, i) => (
            <span key={i} className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              {label}
            </span>
          ))}
        </div>

        {/* Legal */}
        <div className="mt-10 text-center">
          <p className="text-[0.65rem] text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
            By signing in, you agree to let us analyze your public GitHub profile to match you with relevant open-source issues.
          </p>
        </div>
      </div>
    </div>
  );
}