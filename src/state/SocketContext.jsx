import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketCtx = createContext(null)

export function SocketProvider({ code, children }) {
  const [connected, setConnected] = useState(false)
  const [socketError, setSocketError] = useState(null)

  const socket = useMemo(() => {
    const url = import.meta.env.VITE_SOCKET_URL
    const s = io(url, {
      autoConnect: false,
      transports: ['websocket'],
      query: { code }
    })
    return s
  }, [code])

  useEffect(() => {
    function onConnect() { setConnected(true); setSocketError(null) }
    function onDisconnect() { setConnected(false) }
    function onError(err) { setSocketError(err?.message || 'Socket error') }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)
    socket.on('error', onError)

    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
      socket.off('error', onError)
      socket.close()
    }
  }, [socket])

  return (
    <SocketCtx.Provider value={{ socket, connected, socketError }}>
      {children}
    </SocketCtx.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketCtx)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
