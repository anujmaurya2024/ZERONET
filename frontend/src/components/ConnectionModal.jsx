import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Check, X } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export default function ConnectionModal() {
  const navigate = useNavigate();
  const { incomingRequest, acceptRequest, rejectRequest } = usePeer();

  const handleAccept = async () => {
    const fromDeviceId = incomingRequest?.fromDeviceId;
    await acceptRequest();
    if (fromDeviceId) {
      navigate(`/chat/${fromDeviceId}`);
    }
  };

  return (
    <AnimatePresence>
      {incomingRequest && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={rejectRequest}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pointer-events-none"
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 pointer-events-auto relative overflow-hidden"
              style={{
                background: '#181818',
                border: '1px solid rgba(225,6,0,0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(225,6,0,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, #e10600, rgba(225,6,0,0.3))' }}
              />

              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-10"
                style={{
                  background: 'radial-gradient(circle, #e10600, transparent)',
                }}
              />

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #e10600, #a80400)',
                    boxShadow: '0 0 16px rgba(225,6,0,0.3)',
                  }}
                >
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-black text-sm tracking-widest uppercase"
                    style={{ fontFamily: 'Orbitron, monospace', color: '#f0f0f0' }}
                  >
                    INCOMING REQUEST
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'rgba(240,240,240,0.45)', fontFamily: 'Inter, sans-serif' }}
                  >
                    New driver wants to connect
                  </p>
                </div>
              </div>

              {/* Driver name */}
              <div
                className="mb-6 p-3 rounded-xl"
                style={{
                  background: 'rgba(225,6,0,0.06)',
                  border: '1px solid rgba(225,6,0,0.15)',
                }}
              >
                <p
                  className="text-base font-bold break-words"
                  style={{ fontFamily: 'Orbitron, monospace', color: '#e10600', letterSpacing: '0.04em' }}
                >
                  {incomingRequest?.fromDeviceName}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'rgba(240,240,240,0.45)', fontFamily: 'Inter, sans-serif' }}
                >
                  wants to open a team radio channel
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={rejectRequest}
                  className="flex-1 min-h-[48px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 touch-manipulation active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(240,240,240,0.6)',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <X className="w-4 h-4 shrink-0" />
                  REJECT
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 min-h-[48px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 touch-manipulation active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #e10600, #a80400)',
                    border: '1px solid rgba(225,6,0,0.5)',
                    color: '#fff',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: '0 0 16px rgba(225,6,0,0.3)',
                  }}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  ACCEPT
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
