import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
  const peerName = peer?.name || device?.deviceName || 'Device';

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] overflow-hidden bg-background">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shrink-0 flex items-center gap-3 pl-safe-l pr-safe-r px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-slate-200 bg-white min-h-[52px]"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2.5 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 active:bg-slate-100 sm:hover:bg-slate-100 text-text transition-colors touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0 py-1">
          <h1 className="font-semibold text-text truncate text-base sm:text-lg">{peerName}</h1>
          <p className="text-xs text-slate-500 truncate">{peerId}</p>
        </div>
      </motion.header>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ChatWindow peerId={peerId} peerName={peerName} />
      </main>
    </div>
  );
}
