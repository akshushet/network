import React from 'react'
import { clearMyCode } from '../utils/storage'

function formatLastSeen(ts) {
  if (!ts) return 'Offline';
  const d = new Date(ts);
  // Simple format; you can swap with dayjs/date-fns if you already use them
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = d.toLocaleDateString();
  return `Last seen ${dd} ${hh}:${mm}`;
}

export default function ChatHeader({ me, peer, online, lastSeen, onLogout }) {
  return (
    <div className="header">
      <span className={`dot ${online ? 'online' : 'offline'}`} /> 
      <div>
        <div className="title"><strong>{peer}</strong></div>
        <div className="sub">
          {online ? 'Online' : formatLastSeen(lastSeen)}
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <span className="badge"><strong>You:</strong> {me}</span>
        <button
          onClick={onLogout}
          style={{ background: 'transparent', color: '#ef4444', border: '1px solid #2a2f34', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
