import React from 'react'
import { clearMyCode } from '../utils/storage'

export default function ChatHeader({ me, peer, online, onLogout }) {
  return (
    <div className="header">
      <span className={`dot ${online ? 'online' : 'offline'}`} />
      <div>
        <div className="title">Chat with <strong>{peer}</strong></div>
        <div className="sub">{online ? 'Online' : 'Offline'}</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <span className="badge"><strong>Me:</strong> {me}</span>
        <span className="badge"><strong>Peer:</strong> {peer}</span>
        <button onClick={onLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #2a2f34', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>Logout</button>
      </div>
    </div>
  )
}
