import React from 'react'
import Checks from './Checks'
import { API } from '../utils/api'

const API_URL = API.BASE_URL || API.SOCKET_URL

function getMediaKind(m) {
  const kind = m?.media?.kind || m?.type
  const mime = m?.media?.mime || ''
  const url  = m?.media?.url || ''
  if (kind === 'video' || mime.startsWith('video/') || /\.(mp4|mov|mkv|webm)(\?|$)/i.test(url)) return 'video'
  if (kind === 'image' || mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|heic|heif|svg)(\?|$)/i.test(url)) return 'image'
  return null
}

export default function MessageBubble({ m, isMe }) {
  const when = new Date(m.timestamp)
  const hh = when.getHours().toString().padStart(2, '0')
  const mm = when.getMinutes().toString().padStart(2, '0')

  const kind = getMediaKind(m)
  const src =
    m.media?.url ||
    (m.media?.path ? `${API_URL}${m.media.path}` : null)

  const poster =
    m.media?.poster || // if you ever attach a generated thumbnail
    (kind === 'video' && m.media?.width && m.media?.height
      ? undefined
      : undefined)

  return (
    <div className={`bubble ${isMe ? 'me' : 'them'}`}>
      {kind === 'image' && src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img
            src={src}
            alt={m.media?.filename || 'image'}
            style={{ maxWidth: 260, maxHeight: 320, borderRadius: 12, display: 'block', objectFit: 'cover' }}
            loading="lazy"
          />
        </a>
      ) : kind === 'video' && src ? (
        <div style={{ maxWidth: 260 }}>
          <video
            src={src}
            poster={poster}
            controls
            preload="metadata"
            style={{ width: '100%', borderRadius: 12, display: 'block' }}
          />
          {/* Optional: filename below the video for context */}
          {m.media?.filename ? (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {m.media.filename}
            </div>
          ) : null}
        </div>
      ) : (
        <div>{m.text}</div>
      )}

      <div className="meta">
        <span>{hh}:{mm}</span>
        {isMe && <Checks status={m.status || 'sent'} />}
      </div>
    </div>
  )
}
