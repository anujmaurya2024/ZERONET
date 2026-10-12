import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Wifi, Loader2, Smartphone, Laptop } from 'lucide-react';
import { usePeer } from '../context/PeerContext';
import { useChatContext } from '../context/ChatContext';
import { getAvatarColor, getInitials } from '../utils/avatar';

export default function DeviceCard({ device, index, onSelectPeer }) {
  const navigate = useNavigate();
  const { initiateConnection, peers } = usePeer();
  const { setActivePeerId } = useChatContext();

  const peer = peers[device.deviceId];
  const isConnecting = peer?.status === 'connecting' || peer?.status === 'requested';
  const isConnected = peer?.status === 'connected';

  const peerName = device.deviceName || 'Nearby Device';
  const avatarBg = getAvatarColor(peerName);
  const initials = getInitials(peerName);

  const isPhone = /iPhone|Android|Mobile/i.test(peerName);

  const handleStartChat = () => {
    setActivePeerId(device.deviceId);

    if (isConnected) {
      if (onSelectPeer) {
        onSelectPeer(device.deviceId);
      } else {
        navigate(`/chat/${device.deviceId}`);
      }
      return;
    }

    if (isConnecting) {
      if (onSelectPeer) {
        onSelectPeer(device.deviceId);
      } else {
        navigate(`/chat/${device.deviceId}`);
      }
      return;
    }

    initiateConnection(device.deviceId, device.deviceName, device.socketId);
    if (onSelectPeer) {
      onSelectPeer(device.deviceId);
    } else {
      navigate(`/chat/${device.deviceId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleStartChat}
      className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150 group"
      style={{
        background: '#111b21',
        border: '1px solid rgba(134, 150, 160, 0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#202c33';
        e.currentTarget.style.borderColor = 'rgba(0, 168, 132, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#111b21';
        e.currentTarget.style.borderColor = 'rgba(134, 150, 160, 0.12)';
      }}
    >
      {/* Left: Avatar with live in-range indicator */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
          style={{ background: avatarBg }}
        >
          {initials}
        </div>
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#111b21] bg-[#25d366]"
          title="In range and online"
        />
      </div>

      {/* Middle: Name & In-range details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isPhone ? (
            <Smartphone className="w-3.5 h-3.5 text-[#8696a0]" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-[#8696a0]" />
          )}
          <h3 className="text-sm font-semibold text-[#e9edef] truncate">
            {peerName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8696a0]">
          <Wifi className="w-3 h-3 text-[#25d366]" />
          <span className="text-[#25d366] font-medium">In Range</span>
          <span>•</span>
          <span className="truncate">Local Network</span>
        </div>
      </div>

      {/* Right: Action button */}
      <div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#00a884]/15 text-[#25d366] border border-[#00a884]/30">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </span>
        ) : isConnecting ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#202c33] text-[#8696a0] border border-white/10">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a884]" />
            Connecting
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] shadow-sm transition-colors active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Start Chat
          </button>
        )}
      </div>
    </motion.div>
  );
}
