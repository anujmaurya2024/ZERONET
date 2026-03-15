import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Loader2 } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export default function DeviceCard({ device, index }) {
  const navigate = useNavigate();
  const { initiateConnection, peers } = usePeer();
  const peer = peers[device.deviceId];
  const isConnecting = peer?.status === 'connecting';
  const isConnected = peer?.status === 'connected';

  const handleConnect = () => {
    if (isConnected) {
      navigate(`/chat/${device.deviceId}`);
      return;
    }
    if (isConnecting) return;
    initiateConnection(device.deviceId, device.deviceName, device.socketId);
    navigate(`/chat/${device.deviceId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-text truncate">{device.deviceName}</p>
          <p className="text-xs text-slate-400 truncate">{device.deviceId}</p>
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          'Chat'
        ) : (
          'Connect'
        )}
      </button>
    </motion.div>
  );
}
