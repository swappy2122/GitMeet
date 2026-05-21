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
      role="dialog"
      aria-modal="true"
      aria-label="PR draft preview"
    >
      <div className="w-full max-w-2xl rounded-md overflow-hidden border border-(--border-subtle) bg-(--bg-secondary) animate-slide-up glass-card">

        {/* Header */}
        <div className="px-6 py-5 border-b border-(--border-subtle)">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-(--text-primary) flex items-center justify-center">
                <GitPullRequest size={17} className="text-(--bg-primary)" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-(--text-primary) tracking-[-0.02em]">
                  AI-Generated PR Draft
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-semibold bg-(--bg-tertiary) border border-(--border-subtle) text-(--text-muted)">
                    <Sparkles size={10} strokeWidth={2.5} />
                    Powered by Gemini
                  </span>
                  <span className="text-xs text-(--text-muted)">Ready to paste</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition-all duration-200"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[0.65rem] uppercase tracking-widest text-(--text-muted) font-semibold mb-3">Pull Request Content</p>
          <div className="rounded-md p-5 overflow-y-auto max-h-80 bg-(--bg-primary) border border-(--border-subtle)">
            <pre className="whitespace-pre-wrap text-sm text-(--text-secondary) font-mono leading-relaxed tracking-tight">
              {draft}
            </pre>
          </div>
          <div className="text-[0.65rem] text-(--text-muted) text-right mt-2.5 font-medium">
            {draft?.length ?? 0} characters
          </div>
        </div>

        {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--border-subtle)">
          <button
            onClick={onClose}
            className="btn-ghost text-xs py-2.5 px-5"
            aria-label="Dismiss PR draft"
          >
            Dismiss
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${copied ? 'bg-(--success)/20 text-(--success) border border-(--success)/30' : 'btn-primary'}`}
            aria-label="Copy PR draft to clipboard"
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