# WhatsApp-Lite (Client-Only)

A minimal React (Vite) chat UI that logs in via a simple **code** (ABC / QWR), persists messages locally,
and integrates **Socket.IO** for real-time messaging + read receipts. No Redux; toasts handle login/errors.

> This is the **client**. Plug into your Socket.IO backend later. For now, the UI works and stores messages in localStorage so both tabs/windows can be used to simulate two users.

## Features
- Login screen with codes: **ABC** (Person A) or **QWR** (Person B)
- Clean chat UI: message list, input bar, header with presence
- Read receipts: sent ✓, delivered ✓✓, read ✓✓ (blue)
- Local persistence with `localStorage`
- Socket.IO client integrated (no Redux)
- Toasts for auth/errors via `react-hot-toast`

## Quick Start
```bash
npm install
# (Optional) set your backend URL; defaults to http://localhost:4000
echo "VITE_SOCKET_URL=http://localhost:4000" > .env
npm run dev
```
Open two browser windows:
- Window 1: login with **ABC**
- Window 2: login with **QWR**
Type messages and see them flow in real time when a compatible backend is running.

### Without a backend (for UI-only testing)
- You can still type and "send" messages; they are saved locally with status **sent**.
- When you wire up a backend, statuses will upgrade to **delivered** / **read** automatically via socket events.

## Expected Socket Events (server contract)
- Client → Server: `message:send` `{ id, text, from, to, timestamp }` (ack: `{ ok: true, id })`
- Server → Client: `message` `{ id, text, from, to, timestamp }` (to receiver)
- Client ↔ Server: `message:sent` `{ tempId, realId }` (optional)
- Client ↔ Server: `message:delivered` `{ id }`
- Client ↔ Server: `message:read` `{ id }`

## Project Structure
```
src/
  components/
    ChatHeader.jsx
    Checks.jsx
    CodeLogin.jsx
    MessageBubble.jsx
    MessageInput.jsx
  state/
    SocketContext.jsx
  utils/
    storage.js
  App.jsx
  main.jsx
styles.css
```

## Build & Preview
```bash
npm run build
npm run preview
```

## Notes
- No Redux; state is local and persisted per-conversation in `localStorage`.
- Read receipts are rendered only on the sender's bubbles (like WhatsApp).
- Change the Socket URL via `VITE_SOCKET_URL` in `.env`.
