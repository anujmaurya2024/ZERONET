# Zeronet

A local-network web application that lets devices on the same WiFi or hotspot discover each other, connect, chat, and share files **without internet**.

## Structure

```
zeronet/
├── frontend/   # React 18 + Vite, Tailwind CSS, Framer Motion
└── backend/    # Java 17+, Spring Boot 3, WebSocket Signaling, JmDNS (Bonjour/mDNS)
```

## Quick Start

### 1. Run Everything at Once (Windows)
Double-click `START_ALL.bat` or run:
```cmd
START_ALL.bat
```

### 2. Manual Startup

#### Backend (Java + Spring Boot)

```bash
cd backend
mvn spring-boot:run
```
*(Or package and run JAR: `mvn package -DskipTests && java -jar target/zeronet-backend-1.0.0.jar`)*

Server runs at `http://0.0.0.0:3001` (all interfaces so other devices can reach it).

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. On another device on the same network, open `http://<your-local-ip>:5173`.

## How It Works

1. **Discovery**  
   The Spring Boot backend advertises itself via JmDNS (mDNS/Bonjour). The frontend discovers servers by scanning common LAN ranges (`192.168.43.x`, `172.20.10.x`, `192.168.1.x`) and calling `/api/info`.

2. **Connection**  
   Device A discovers Device B and clicks **Connect**. B gets a popup to **Accept** or **Reject**. On accept, WebRTC signaling (offer/answer/ICE) is relayed through Spring Boot WebSockets (`/ws`).

3. **Chat & files**  
   After the WebRTC data channel is established, chat and file transfers are direct peer-to-peer (P2P); the server is only used for initial discovery and signaling.

4. **File sharing**  
   Files are split into 64KB chunks and sent over the WebRTC data channel with chunk metadata. The receiver reassembles and allows one-click download.

## Tech Stack

- **Backend:** Java 17+, Spring Boot 3.3.4, Spring WebSocket, JmDNS 3.6.3, Maven
- **Frontend:** React 18, Vite, Tailwind CSS v3, Framer Motion, React Router v6, Lucide React, date-fns

## Requirements

- Java JDK 17+ & Apache Maven 3.8+
- Node.js 18+ & npm
- Devices on the same Wi-Fi network or hotspot
