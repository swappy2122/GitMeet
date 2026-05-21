import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../lib/api';

function makeNotification(id) {
  const now = new Date();
  return {
    id,
    title: `New match found #${id}`,
    body: `We found a potential match in example/repo-${id}`,
    time: now.toLocaleTimeString(),
    read: false,
  };
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const saved = api.getNotifications();
    setItems(saved.length ? saved : [makeNotification(1), makeNotification(2)]);
    setNextId((saved && saved.length ? saved.length : 2) + 1);
  }, []);

  useEffect(() => { api.saveNotifications(items); }, [items]);

  function pushMock() {
    const n = makeNotification(nextId);
    setItems((s) => [n, ...s]);
    setNextId((nxt) => nxt + 1);
  }

  function markRead(id) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, read: true } : it)));
  }

  function remove(id) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  return (
    <main className="app-shell min-h-screen p-6 bg-(--bg-primary) text-(--text-primary)">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-2xl font-bold flex items-center gap-3"><Bell /> Notifications</h1>
          <div>
            <button onClick={pushMock} className="cyber-button rounded-2xl px-4 py-2">Generate mock</button>
          </div>
        </div>

        <div className="space-y-3">
          {items.length === 0 && <div className="text-(--text-muted)">No notifications</div>}
          {items.map((n) => (
            <div key={n.id} className={`cyber-card p-4 rounded-3xl ${n.read ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-(--text-secondary)">{n.body}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-(--text-muted)">{n.time}</div>
                  {!n.read && <button onClick={() => markRead(n.id)} className="text-sm text-(--accent-green)">Mark read</button>}
                  <button onClick={() => remove(n.id)} className="text-sm text-red-400">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
