import { useState } from 'react';
import { Copy, Check, X, GitPullRequest, Sparkles } from 'lucide-react';

export default function PRModal({ draft, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-md overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] animate-slide-up">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
                <GitPullRequest size={17} className="text-[var(--bg-primary)]" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
                  AI-Generated PR Draft
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <Sparkles size={10} strokeWidth={2.5} />
                    Powered by Gemini
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Ready to paste</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] font-semibold mb-3">Pull Request Content</p>
          <div className="rounded-md p-5 overflow-y-auto max-h-80 bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
            <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] font-mono leading-relaxed tracking-tight">
              {draft}
            </pre>
          </div>
          <div className="text-[0.65rem] text-[var(--text-muted)] text-right mt-2.5 font-medium">
            {draft?.length ?? 0} characters
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="btn-ghost text-xs py-2.5 px-5"
          >
            Dismiss
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              copied
                ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30'
                : 'btn-primary'
            }`}
          >
            {copied ? (
              <><Check size={15} strokeWidth={2.5} /> Copied!</>
            ) : (
              <><Copy size={15} strokeWidth={2.5} /> Copy Markdown</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}