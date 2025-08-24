// import React from 'react'
// import Checks from './Checks'

// export default function MessageBubble({ m, isMe }) {
//   const when = new Date(m.timestamp)
//   const hh = when.getHours().toString().padStart(2, '0')
//   const mm = when.getMinutes().toString().padStart(2, '0')
//   return (
//     <div className={`bubble ${isMe ? 'me' : 'them'}`}>
//       <div>{m.text}</div>
//       <div className="meta">
//         <span>{hh}:{mm}</span>
//         {isMe && <Checks status={m.status || 'sent'} />}
//       </div>
//     </div>
//   )
// }

import React from 'react'
import Checks from './Checks'
import { API } from '../utils/api'

const API_URL = API.BASE_URL || API.SOCKET_URL

export default function MessageBubble({ m, isMe }) {
  const when = new Date(m.timestamp)
  const hh = when.getHours().toString().padStart(2, '0')
  const mm = when.getMinutes().toString().padStart(2, '0')

  // determine if this is an image message
  const isImage = (m.type === 'image') || (!!m.media && !!m.media.url)
  // support both absolute url and relative path (fallback)
  const imgSrc = m.media?.url || (m.media?.path ? `${API_URL}${m.media.path}` : null)

  return (
    <div className={`bubble ${isMe ? 'me' : 'them'}`}>
      {isImage && imgSrc ? (
        <a href={imgSrc} target="_blank" rel="noreferrer">
          <img
            src={imgSrc}
            alt="attachment"
            style={{ maxWidth: 240, borderRadius: 12, display: 'block' }}
            loading="lazy"
          />
        </a>
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
