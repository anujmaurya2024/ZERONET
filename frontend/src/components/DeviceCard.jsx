import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Loader2, ChevronRight } from 'lucide-react';
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-xl flex items-center justify-between gap-3 sm:gap-4 p-4 transition-all duration-200 cursor-pointer group"
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(225,6,0,0.3)';
        e.currentTarget.style.boxShadow = '0 4px 28px rgba(225,6,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
      }}
      onClick={handleConnect}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 h-0.5 transition-all duration-300"
        style={{
          width: isConnected ? '100%' : '30%',
          background: isConnected
            ? 'linear-gradient(90deg, #00d2ff, #00d2ff80)'
            : 'linear-gradient(90deg, #e10600, transparent)',
        }}
      />

      {/* Left: Icon + info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Device icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
          style={{
            background: isConnected
              ? 'rgba(0,210,255,0.1)'
              : 'rgba(225,6,0,0.1)',
            border: `1px solid ${isConnected ? 'rgba(0,210,255,0.25)' : 'rgba(225,6,0,0.2)'}`,
          }}
        >
          <Gauge
            className="w-5 h-5"
            style={{ color: isConnected ? '#00d2ff' : '#e10600' }}
          />
        </div>

        {/* Device info */}
        <div className="min-w-0 flex-1">
          <p
            className="font-bold truncate text-sm"
            style={{ color: '#f0f0f0', fontFamily: 'Orbitron, monospace', letterSpacing: '0.03em' }}
          >
            {device.deviceName}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: 'rgba(240,240,240,0.35)', fontFamily: 'Inter, monospace' }}
          >
            {device.deviceId}
          </p>

          {/* Status pill */}
          {isConnected && (
            <div
              className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'rgba(0,210,255,0.08)',
                color: '#00d2ff',
                border: '1px solid rgba(0,210,255,0.2)',
                fontSize: '9px',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#00d2ff', boxShadow: '0 0 4px #00d2ff' }}
              />
              LINKED
            </div>
          )}
        </div>
      </div>

      {/* Right: Connect button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleConnect(); }}
        disabled={isConnecting}
        className="shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 touch-manipulation active:scale-95 disabled:opacity-50"
        style={{
          background: isConnected
            ? 'rgba(0,210,255,0.1)'
            : 'linear-gradient(135deg, #e10600, #a80400)',
          border: isConnected
            ? '1px solid rgba(0,210,255,0.3)'
            : '1px solid rgba(225,6,0,0.5)',
          color: isConnected ? '#00d2ff' : '#fff',
          fontFamily: 'Orbitron, monospace',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: isConnected ? 'none' : '0 0 10px rgba(225,6,0,0.2)',
        }}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="hidden sm:inline">LINKING</span>
          </>
        ) : isConnected ? (
          <>
            <span>RACE</span>
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>CONNECT</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
