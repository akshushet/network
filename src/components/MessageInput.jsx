import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  async function uploadImage(file) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(msg || 'Upload failed')
    }
    return res.json() // { url, path, size, mime, width, height, filename }
  }

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const meta = await uploadImage(file)
      // send an image message (no text needed)
      onSend({ media: { url: meta.url, mime: meta.mime, width: meta.width, height: meta.height, size: meta.size } })
      toast.success('Image sent')
    } catch (err) {
      toast.error(err?.message || 'Upload error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function submit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t) // keep text flow unchanged
    setText('')
  }

  return (
    <form className="inputBar" onSubmit={submit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message"
        disabled={busy}
      />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
        📎
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onPick}
      />
      <button type="submit" disabled={busy}>Send</button>
    </form>
  )
}
