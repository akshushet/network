import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const VALID = ['A','B']

export default function CodeLogin({ onLogin }) {
  const [code, setCode] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!VALID.includes(c)) {
      toast.error('Invalid code. Use A (Baby) or B (Mommy).')
      return
    }
    toast.success('Logged in!')
    onLogin(c)
  }

  return (
    <div className="loginWrap">
      <Toaster position="top-center" />
      <h1>Enter your chat code</h1>
      <p>Use <strong>A</strong> for Baby or <strong>B</strong> for Mommy.</p>
      <form className="row" onSubmit={handleLogin}>
        <input placeholder="e.g. A" value={code} onChange={e => setCode(e.target.value)} />
        <button type="submit">Continue</button>
      </form>
      <p className="small" style={{marginTop:12}}>No Redux used. Toasts show login/errors.</p>
    </div>
  )
}
