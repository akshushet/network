// Simple localStorage helpers for offline persistence
const PREFIX = 'chat:'

export function convoKey(me, peer) {
  const [a,b] = [me, peer].sort()
  return `${PREFIX}${a}-${b}`
}

export function loadMessages(me, peer) {
  try {
    const raw = localStorage.getItem(convoKey(me, peer))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMessages(me, peer, messages) {
  try {
    localStorage.setItem(convoKey(me, peer), JSON.stringify(messages))
  } catch {}
}

export function getMyCode() {
  return localStorage.getItem('myCode')
}

export function setMyCode(code) {
  localStorage.setItem('myCode', code)
}

export function clearMyCode() {
  localStorage.removeItem('myCode')
}
