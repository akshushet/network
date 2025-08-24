import React from 'react'

const CheckIcon = ({ className }) => (
  <span className={`check ${className}`}>
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M1 14l5 5L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  </span>
)

export default function Checks({ status }) {
  // status: 'sending' | 'sent' | 'delivered' | 'read'
  if (status === 'sending') return <span className="small">sending…</span>
  if (status === 'sent') return (
    <span className="checks">
      <CheckIcon className="sent" />
    </span>
  )
  if (status === 'delivered') return (
    <span className="checks">
      <CheckIcon className="delivered" /><CheckIcon className="delivered" />
    </span>
  )
  if (status === 'read') return (
    <span className="checks">
      <CheckIcon className="read" /><CheckIcon className="read" />
    </span>
  )
  return null
}
