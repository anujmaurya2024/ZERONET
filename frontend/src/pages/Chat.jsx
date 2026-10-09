import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Gauge } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { useSocket } from '../context/SocketContext';
import { usePeer } from '../context/PeerContext';

export default function Chat() {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const { onlineDevices } = useSocket();
  const { peers } = usePeer();

  const device = onlineDevices.find((d) => d.deviceId === peerId);
  const peer = peerId ? peers[peerId] : null;
  const peerName = peer?.name || device?.deviceName || 'Unknown Driver';

  return (
    <div
      className="flex flex-col h-screen max-h-[100dvh] overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Chat header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 flex items-center gap-3 pl-safe-l pr-safe-r px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] min-h-[56px] relative overflow-hidden"
        style={{
          background: 'rgba(18,18,18,0.98)',
          borderBottom: '1px solid rgba(225,6,0,0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 w-full h-0.5"
          style={{ background: 'linear-gradient(90deg, #e10600, rgba(225,6,0,0.2))' }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation active:scale-95"
          aria-label="Back to Pit Lane"
          style={{ color: 'rgba(240,240,240,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e10600'; e.currentTarget.style.background = 'rgba(225,6,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,240,240,0.6)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Peer avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #e10600, #a80400)',
            boxShadow: '0 0 10px rgba(225,6,0,0.3)',
          }}
        >
          <Gauge className="w-4 h-4 text-white" />
        </div>

        {/* Peer info */}
        <div className="flex-1 min-w-0 py-1">
          <h1
            className="font-black truncate text-sm sm:text-base leading-none mb-1"
            style={{ fontFamily: 'Orbitron, monospace', color: '#f0f0f0', letterSpacing: '0.04em' }}
          >
            {peerName.toUpperCase()}
          </h1>
          <p
            className="text-xs truncate"
            style={{ color: 'rgba(240,240,240,0.35)', fontFamily: 'Inter, monospace' }}
          >
            {peerId}
          </p>
        </div>

        {/* Live signal */}
        <div
          className="shrink-0 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(0,210,255,0.06)',
            border: '1px solid rgba(0,210,255,0.2)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: '#00d2ff',
              boxShadow: '0 0 6px #00d2ff',
              animation: 'telemetry-blink 1.5s ease-in-out infinite',
            }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ fontFamily: 'Orbitron, monospace', color: '#00d2ff' }}
          >
            RADIO
          </span>
        </div>
      </motion.header>

      {/* Chat content */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ChatWindow peerId={peerId} peerName={peerName} />
      </main>
    </div>
  );
}
