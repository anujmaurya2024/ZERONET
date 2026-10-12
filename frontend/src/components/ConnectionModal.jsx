import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, X, Wifi } from 'lucide-react';
import { usePeer } from '../context/PeerContext';
import { useChatContext } from '../context/ChatContext';
import { getAvatarColor, getInitials } from '../utils/avatar';

export default function ConnectionModal() {
  const navigate = useNavigate();
  const { incomingRequest, acceptRequest, rejectRequest } = usePeer();
  const { setActivePeerId, markAsRead } = useChatContext();

  const handleAccept = async () => {
    const fromDeviceId = incomingRequest?.fromDeviceId;
    await acceptRequest();
    if (fromDeviceId) {
      setActivePeerId(fromDeviceId);
      markAsRead(fromDeviceId);
      navigate(`/chat/${fromDeviceId}`);
    }
  };

  const peerName = incomingRequest?.fromDeviceName || 'Nearby User';
  const avatarBg = getAvatarColor(peerName);
  const initials = getInitials(peerName);

  return (
    <AnimatePresence>
      {incomingRequest && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(11, 20, 26, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={rejectRequest}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 pointer-events-auto relative overflow-hidden text-center"
              style={{
                background: '#111b21',
                border: '1px solid rgba(0, 168, 132, 0.35)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0, 168, 132, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* WhatsApp Green Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #00a884, #25d366)' }}
              />

              {/* In-Range Radar Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                style={{
                  background: 'rgba(37, 211, 102, 0.12)',
                  color: '#25d366',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                }}
              >
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>Within Range • Local Wi-Fi</span>
              </div>

              {/* Peer Avatar with pulsating ring */}
              <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full wa-radar-pulse"
                  style={{ background: 'rgba(0, 168, 132, 0.3)' }}
                />
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10"
                  style={{
                    background: avatarBg,
                    border: '3px solid #111b21',
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Title & Name */}
              <h2 className="text-xl font-bold text-white mb-1">
                {peerName}
              </h2>
              <p className="text-sm mb-6" style={{ color: '#8696a0' }}>
                is within range on your local network and wants to start a chat with you.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={rejectRequest}
                  className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-150 touch-manipulation active:scale-95 text-sm"
                  style={{
                    background: '#202c33',
                    border: '1px solid rgba(134, 150, 160, 0.2)',
                    color: '#8696a0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e9edef';
                    e.currentTarget.style.background = '#2a3942';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#8696a0';
                    e.currentTarget.style.background = '#202c33';
                  }}
                >
                  <X className="w-4 h-4 shrink-0" />
                  Decline
                </button>

                <button
                  onClick={handleAccept}
                  className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-150 touch-manipulation active:scale-95 text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #00a884, #008069)',
                    boxShadow: '0 4px 18px rgba(0, 168, 132, 0.4)',
                  }}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  Accept & Chat
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
