import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { API } from '../utils/api'

const API_URL = API.BASE_URL || API.SOCKET_URL
const MAX_MB = 15 // tweak as needed

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0) // 0..100
  const [statusMsg, setStatusMsg] = useState('')
  const fileRef = useRef(null)

  function resetPicker() {
    if (fileRef.current) fileRef.current.value = ''
  }

  function uploadImageWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_URL}/api/upload`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        else onProgress(null) // fallback to indeterminate
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'))
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

    // basic guards
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      resetPicker()
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Max file size is ${MAX_MB}MB`)
      resetPicker()
      return
    }

    setUploading(true)
    setProgress(0)
    setStatusMsg('Uploading…')

    try {
      const meta = await uploadImageWithProgress(file, (p) => {
        if (p == null) setStatusMsg('Uploading…')
        else {
          setProgress(p)
          setStatusMsg(`Uploading ${p}%`)
        }
      })

      onSend({
        media: {
          url: meta.url,
          mime: meta.mime,
          width: meta.width,
          height: meta.height,
          size: meta.size,
          filename: meta.filename,
        },
      })
      toast.success('Image sent')
      setStatusMsg('Uploaded ✓')
    } catch (err) {
      const msg = err?.message || 'Upload error'
      toast.error(msg)
      setStatusMsg(msg)
    } finally {
      setUploading(false)
      // let the user read the status for a moment, then clear
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
          title="Attach image"
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          aria-label="Attach image"
        >
          {uploading ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            '📎'
          )}
        </button>

        <input
          className="textInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={uploading ? 'Uploading image…' : 'Type a message'}
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
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onPick}
          // on mobile you can hint camera with capture attr if you like:
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
