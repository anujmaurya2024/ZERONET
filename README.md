# Zeronet

A local-network web application that lets devices on the same WiFi or hotspot discover each other, connect, chat, and share files **without internet**.

## Structure

```
zeronet/
├── frontend/   # React 18 + Vite, Tailwind, Framer Motion
└── backend/    # Node.js, Express, Socket.IO, Bonjour (mDNS)
```

## Quick Start

### Backend

```bash
cd backend
npm install
node server.js
```

Server runs at `http://0.0.0.0:3001` (all interfaces so other devices can reach it).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). On another device on the same network, use the same backend URL (e.g. `http://<server-ip>:5173` if you use the same machine, or run frontend elsewhere and set the server in the UI).

## How It Works

1. **Discovery**  
   The backend advertises itself via mDNS/Bonjour. The frontend discovers servers by scanning common LAN ranges (`192.168.43.x`, `172.20.10.x`, `192.168.1.x`) and calling `/api/info`.

2. **Connection**  
   Device A discovers Device B and clicks **Connect**. B gets a popup to **Accept** or **Reject**. On accept, WebRTC signaling (offer/answer/ICE) is relayed through Socket.IO.

3. **Chat & files**  
   After the WebRTC data channel is open, chat and file transfer are direct P2P; the server is only used for signaling.

4. **File sharing**  
   Files are split into 64KB chunks and sent over the data channel with metadata (`fileId`, `chunkIndex`, `totalChunks`). The receiver reassembles and allows download.

## Routes

- `/` — Lobby (device discovery, connect)
- `/chat/:peerId` — Chat room with a specific peer

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v3, Framer Motion, React Router v6, Lucide React, date-fns  
**Backend:** Node.js, Express, Socket.IO v4, bonjour-service, helmet, cors

## Requirements

- Devices on the same WiFi or hotspot
- No internet required after loading the app (except optional STUN: `stun.l.google.com` for NAT)
- Backend must be reachable at the same IP/port from all devices (e.g. run on a machine that others can access)
