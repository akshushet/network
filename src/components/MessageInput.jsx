import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { API } from '../utils/api'

const API_URL = API.BASE_URL || API.SOCKET_URL

// Size caps (tweak as needed)
const MAX_IMAGE_MB = 15
const MAX_VIDEO_MB = 100 // e.g., 150 MB for videos

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0) // 0..100
  const [statusMsg, setStatusMsg] = useState('')
  const fileRef = useRef(null)

  function resetPicker() {
    if (fileRef.current) fileRef.current.value = ''
  }

  function parseServerError(text) {
    try {
      const j = JSON.parse(text)
      return j.message || j.error || text || 'Upload failed'
    } catch {
      return text || 'Upload failed'
    }
  }

  function uploadFileWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_URL}/api/upload`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        else onProgress(null) // indeterminate
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(parseServerError(xhr.responseText)))
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      const fd = new FormData()
      fd.append('file', file)
      xhr.send(fd)
    })
  }

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error('Please select an image or a video')
      resetPicker()
      return
    }

    // Per-type size caps
    const maxMb = isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Max ${isImage ? 'image' : 'video'} size is ${maxMb} MB`)
      resetPicker()
      return
    }

    setUploading(true)
    setProgress(0)
    setStatusMsg('Uploading file…')

    try {
      const meta = await uploadFileWithProgress(file, (p) => {
        if (p == null) setStatusMsg('Uploading file…')
        else {
          setProgress(p)
          setStatusMsg(`Uploading ${p}%`)
        }
      })

      // Note: your backend returns url, mime, width, height, size, filename
      onSend({
        media: {
          url: meta.url,
          mime: meta.mime,
          width: meta.width,
          height: meta.height,
          size: meta.size,
          filename: meta.filename,
          kind: isVideo ? 'video' : 'image',
        },
      })

      toast.success(`${isVideo ? 'Video' : 'Image'} sent`)
      setStatusMsg('Uploaded ✓')
    } catch (err) {
      const msg = err?.message || 'Upload error'
      toast.error(msg)
      setStatusMsg(msg)
    } finally {
      setUploading(false)
      setTimeout(() => setStatusMsg(''), 1500)
      resetPicker()
      setProgress(0)
    }
  }

  function submit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t || uploading) return
    onSend(t) // keep text flow unchanged
    setText('')
  }

  return (
    <form className="inputBar" onSubmit={submit} aria-busy={uploading}>
      <div className={`composer ${uploading ? 'is-busy' : ''}`}>
        <button
          type="button"
          className="btn icon"
          title="Attach file"
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          aria-label="Attach file"
        >
          {uploading ? <span className="spinner" aria-hidden="true" /> : '📎'}
        </button>

        <input
          className="textInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={uploading ? 'Uploading…' : 'Type a message'}
          disabled={uploading}
          aria-label="Type a message"
        />

        <button
          type="submit"
          className="btn primary"
          disabled={uploading || !text.trim()}
          title="Send message"
        >
          Send
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={onPick}
          // For image-only camera capture on mobile you could do:
          // capture="environment"
        />
      </div>

      {statusMsg ? (
        <div className="statusRow" role="status" aria-live="polite">
          <div className={`progress ${progress ? '' : 'indeterminate'}`}>
            <div
              className="bar"
              style={{ width: progress ? `${progress}%` : undefined }}
            />
          </div>
          <span className="statusText">{statusMsg}</span>
        </div>
      ) : null}
    </form>
  )
}
