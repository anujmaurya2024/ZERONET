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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-text transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-text truncate">{peerName}</h1>
          <p className="text-xs text-slate-500 truncate">{peerId}</p>
        </div>
      </motion.header>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ChatWindow peerId={peerId} peerName={peerName} />
      </main>
    </div>
  );
}
