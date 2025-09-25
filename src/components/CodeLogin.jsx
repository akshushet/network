import React, { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const VALID = ['A','B']

export default function CodeLogin({ onLogin }) {
  const [code, setCode] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [seqIdx, setSeqIdx] = useState(0)
  const inputRef = useRef(null)

  const SECRET = ['B','E','X'] 

  useEffect(() => {
    if (revealed && inputRef.current) inputRef.current.focus()
  }, [revealed])

  function handleLogin(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!VALID.includes(c)) {
      toast.error('Invalid code')
      return
    }
    toast.success('Logged in!')
    onLogin(c)
  }

  function advance(letter) {
    if (revealed) return
    if (letter === SECRET[seqIdx]) {
      const next = seqIdx + 1
      if (next === SECRET.length) setRevealed(true)
      else setSeqIdx(next)
    } else {
      setSeqIdx(letter === SECRET[0] ? 1 : 0)
    }
  }

  return (
    <div className="loginWrap">
      {/* In-page CSS */}
      <style>{`
        :root{
          --bg-1:red;
          --bg-2:#ffffff;
          --card:#ffffff;
          --ink:#1b1f24;
          --sub:#5e6875;
          --line:#e8edf5;
          --accent:#2563eb;
          --accent-2:#0ea5e9;
        }
        .loginWrap{
          position:relative; overflow:hidden;
          min-height:100dvh; padding:48px 20px;
          display:grid; place-items:center;
          background: radial-gradient(1200px 800px at -10% -20%, #e6f2ff 0%, transparent 60%),
                      radial-gradient(900px 700px at 120% 10%, #e7fff7 0%, transparent 55%),
                      linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 60%);
        }
        .decor{
          position:absolute; border-radius:999px; filter:blur(60px); opacity:.25; pointer-events:none;
        }
        .decor.d1{ width:520px;height:520px; top:-160px; left:-160px;
          background: radial-gradient(closest-side, #bfe3ff, transparent); }
        .decor.d2{ width:420px;height:420px; bottom:-140px; right:-120px;
          background: radial-gradient(closest-side, #c6fff0, transparent); }

        .hero{
          max-width:980px; text-align:center; color:var(--ink); line-height:1.15; user-select:text;
        }
        .badges{display:flex; gap:10px; justify-content:center; margin-bottom:14px; flex-wrap:wrap;}
        .badge{
          background:#fff; border:1px solid var(--line); color:var(--sub);
          padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600;
        }
        .headline{
          font-size:clamp(28px,6vw,62px); font-weight:800; letter-spacing:-0.02em; margin:0 0 8px;
        }
        .sub{
          font-size:clamp(14px,2.2vw,18px); color:var(--sub); margin:0 0 16px;
        }
        .ctas{display:flex; gap:12px; justify-content:center; margin-top:8px;}
        .btn, .ghost{
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:12px 18px; border-radius:12px; font-weight:700; text-decoration:none;
          box-shadow:0 1px 0 rgba(0,0,0,.04);
        }
        .btn{
          background: linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%);
          color:#fff; border:0;
        }
        .ghost{
          background:#fff; border:1px solid var(--line); color:var(--ink);
        }

        /* Secret letter spans: look like plain text (no pointer hand) */
        .tap{ cursor:default; display:inline; }

        .loginCard{
          width:100%; max-width:420px; background:var(--card);
          border:1px solid var(--line); border-radius:16px; padding:22px;
          box-shadow:0 10px 30px rgba(17, 24, 39, .08);
          margin-top:28px; opacity:0; transform:translateY(6px) scale(.985);
          pointer-events:none; transition:opacity .18s ease, transform .18s ease;
        }
        .loginCard.show{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }
        .loginCard h2{ color:var(--ink); margin:0 0 8px; font-size:20px; }
        .loginCard p{ color:var(--sub); margin:0 0 10px; }

        .row{ display:flex; gap:10px; margin-top:14px; }
        .row input{
          flex:1; padding:12px 14px; border-radius:10px;
          border:1px solid var(--line); background:#fff; color:var(--ink); outline:none;
        }
        .row input::placeholder{ color:#9aa6b2; }
        .row button{
          padding:12px 16px; border-radius:10px; border:0;
          background:var(--accent); color:#fff; font-weight:700; cursor:pointer;
        }

        @media (max-width:520px){
          .ctas{flex-direction:column;}
        }
        @media (prefers-reduced-motion: reduce){
          .loginCard{ transition:none; }
        }
      `}</style>

      <Toaster position="bottom-center" />
      <div className="decor d1" aria-hidden />
      <div className="decor d2" aria-hidden />

      {/* Hero feels like a real sale landing */}
      <div className="hero" aria-live="polite">
        <div className="badges">
          <span className="badge">New Arrivals</span>
          <span className="badge">Limited Bundles</span>
          <span className="badge">Free Shipping over ₹499</span>
        </div>

        <h1 className="headline">
          <span className="tap" onClick={() => advance('B')}>B</span>ig{' '}
          <span className="tap" onClick={() => advance('E')}>E</span>nd-of-season{' '}
          E<span className="tap" onClick={() => advance('X')}>X</span>travaganza
        </h1>

        <p className="sub">
          Fresh drops, member-only picks, and weekend doorbusters. Shop what’s trending now.
        </p>

        <div className="ctas">
          <a href="#" className="btn" aria-label="Shop New Arrivals">Shop New Arrivals</a>
          <a href="#" className="ghost" aria-label="View All Deals">View All Deals</a>
        </div>
      </div>

      {/* Hidden until B → E → X are clicked */}
      <div className={`loginCard ${revealed ? 'show' : ''}`} aria-hidden={!revealed}>
        <form className="row" onSubmit={handleLogin}>
          <input
            ref={inputRef}
            placeholder="Gateway here"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            tabIndex={revealed ? 0 : -1}
          />
          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  )
}
