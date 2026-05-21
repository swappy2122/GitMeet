import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="w-full border-b border-(--border-subtle) bg-(--bg-secondary)">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="font-bold text-(--text-primary)">GitMeet</Link>
          <Link to="/matches" className="text-sm text-(--text-muted) hover:text-white">Matches</Link>
          <Link to="/explore" className="text-sm text-(--text-muted) hover:text-white">Explore</Link>
          <Link to="/projects" className="text-sm text-(--text-muted) hover:text-white">Projects</Link>
          <Link to="/analytics" className="text-sm text-(--text-muted) hover:text-white">Analytics</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/notifications" className="text-sm text-(--text-muted) hover:text-white">Notifications</Link>
          <Link to="/settings" className="text-sm text-(--text-muted) hover:text-white">Settings</Link>
        </div>
      </div>
    </nav>
  );
}
