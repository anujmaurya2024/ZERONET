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
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 active:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text truncate text-base">{device.deviceName}</p>
          <p className="text-xs text-slate-400 truncate">{device.deviceId}</p>
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="shrink-0 min-h-[44px] px-4 py-2.5 sm:py-2 rounded-xl bg-primary text-white text-sm font-medium active:bg-primary/90 sm:hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors touch-manipulation"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="hidden sm:inline">Connecting...</span>
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
