import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'
import CodeLogin from './components/CodeLogin'
import ChatHeader from './components/ChatHeader'
import MessageBubble from './components/MessageBubble'
import MessageInput from './components/MessageInput'
import { SocketProvider, useSocket } from './state/SocketContext'
import { getMyCode, setMyCode, clearMyCode, loadMessages, saveMessages } from './utils/storage'
import { API } from './utils/api'

const PEER = { A: 'B', B: 'A' }
const API_URL = API.BASE_URL || API.SOCKET_URL

function ChatScreen({ code }) {
  const peer = PEER[code]
  const { socket, connected, socketError } = useSocket()
  const [messages, setMessages] = useState(() => loadMessages(code, peer))
  const listRef = useRef(null)

  // initial history fetch from server (merge with local unsent)
  useEffect(() => {
    async function fetchHistory() {
      try {
        const r = await fetch(`${API_URL}/api/messages?me=${code}&peer=${peer}&limit=200`)
        const data = await r.json()
        if (Array.isArray(data?.messages)) {
          // Merge strategy: keep unique by id; preserve local "sending" messages without server ids
          const serverMsgs = data.messages.map(m => ({
            id: m._id || m.id,
            text: m.text,
            from: m.from, to: m.to,
            type: m.type || 'text',         // <-- NEW
            media: m.media || null,         // <-- NEW
            timestamp: new Date(m.timestamp).getTime(),
            status: m.status || 'sent'
          }))
          setMessages(prev => {
            const locals = prev.filter(m => !m.id || m.id.length === 36) // uuid temp ids
            const mergedMap = new Map(serverMsgs.map(m => [String(m.id), m]))
            const merged = [...serverMsgs]
            // append local temp messages that are not on server yet
            locals.forEach(m => merged.push(m))
            return merged
          })

          // Reconcile delivery/read for any history addressed to me
          const needDelivered = serverMsgs.filter(m => m.to === code && m.status === 'sent').map(m => String(m.id))
          needDelivered.forEach(id => socket.emit('message:delivered', { id }))
          if (document.visibilityState === 'visible') {
            const needRead = serverMsgs.filter(m => m.to === code && (m.status === 'sent' || m.status === 'delivered')).map(m => String(m.id))
            needRead.forEach(id => socket.emit('message:read', { id }))
            setMessages(prev => prev.map(m => needRead.includes(String(m.id)) ? { ...m, status: 'read' } : m))
          }
        }
      } catch (e) {
        console.warn('history fetch failed', e)
      }
    }
    fetchHistory()
  }, [code, peer, socket])

  // scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  // Save to localStorage whenever messages change
  useEffect(() => {
    saveMessages(code, peer, messages)
  }, [messages, code, peer])

  // Incoming socket events
  useEffect(() => {
    function onIncoming(msg) {
      setMessages(prev => {
        if (prev.find(m => String(m.id) === String(msg.id))) return prev
        return [...prev, {
          id: msg.id,
          text: msg.text,
          from: msg.from,
          to: msg.to,
          type: msg.type || 'text',    // <-- NEW
          media: msg.media || null,    // <-- NEW
          timestamp: msg.timestamp,
          status: 'delivered'
        }]
      })
      socket.emit('message:delivered', { id: msg.id })
      if (document.visibilityState === 'visible') {
        socket.emit('message:read', { id: msg.id })
        setMessages(prev => prev.map(m => String(m.id) === String(msg.id) ? { ...m, status: 'read' } : m))
      }
    }

    function onSentAck({ tempId, realId }) {
      setMessages(prev => prev.map(m => String(m.id) === String(tempId) ? { ...m, id: realId || tempId, status: 'sent' } : m))
    }

    function onDelivered({ id }) {
      setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, status: 'delivered' } : m))
    }

    function onRead({ id }) {
      setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, status: 'read' } : m))
    }

    socket.on('message', onIncoming)
    socket.on('message:sent', onSentAck)
    socket.on('message:delivered', onDelivered)
    socket.on('message:read', onRead)

    return () => {
      socket.off('message', onIncoming)
      socket.off('message:sent', onSentAck)
      socket.off('message:delivered', onDelivered)
      socket.off('message:read', onRead)
    }
  }, [socket, code, peer])

  // When visible, mark any received (delivered) messages as read
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'visible') {
        const idsToRead = messages.filter(m => m.to === code && (m.status === 'delivered')).map(m => m.id)
        idsToRead.forEach(id => socket.emit('message:read', { id }))
        setMessages(prev => prev.map(m => idsToRead.includes(m.id) ? { ...m, status: 'read' } : m))
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [messages, code, socket])

  function send(payload) {
    const isText = typeof payload === 'string'
    const tempId = uuid()

    const base = {
      id: tempId,
      from: code,
      to: peer,
      timestamp: Date.now(),
    }

    // Build the outbound socket payload
    let outbound
    if (isText) {
      outbound = { ...base, text: payload }
    } else if (payload && payload.media?.url) {
      outbound = { ...base, type: 'image', media: payload.media }
    } else {
      toast.error('Nothing to send')
      return
    }

    // optimistic update
    setMessages(prev => [...prev, {
      ...outbound,
      status: 'sending'
    }])

    const fallback = setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === tempId && m.status === 'sending' ? { ...m, status: 'sent' } : m))
    }, 2000)

    try {
      socket.emit('message:send', outbound, (ack) => {
        clearTimeout(fallback)
        if (ack && ack.ok) {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: ack.id || tempId, status: 'sent' } : m))
        } else {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m))
        }
      })
    } catch (e) {
      clearTimeout(fallback)
      toast.error('Failed to send (socket not connected).')
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m))
    }
  }

  function logout() {
    clearMyCode()
    window.location.reload()
  }

  return (
    <div className="app">
      <Toaster position="top-center" />
      <ChatHeader me={code} peer={peer} online={connected} onLogout={logout} />
      <div className="messages" ref={listRef}>
        {messages.map(m => (
          <MessageBubble key={m.id} m={m} isMe={m.from === code} />
        ))}
      </div>
      <MessageInput onSend={send} />
      {!connected && (
        <div style={{ position: 'fixed', bottom: 16, left: 16 }} className="badge">
          <span>Socket: offline</span>
        </div>
      )}
      {socketError && (
        <div style={{ position: 'fixed', bottom: 16, right: 16 }} className="badge">
          <span>Socket error: {socketError}</span>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [code, setCode] = useState(() => getMyCode())

  const valid = code === 'A' || code === 'B'
  if (!valid) {
    return <CodeLogin onLogin={(c) => { setMyCode(c); setCode(c) }} />
  }

  return (
    <SocketProvider code={code}>
      <ChatScreen code={code} />
    </SocketProvider>
  )
}
