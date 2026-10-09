import { motion } from 'framer-motion';
import { Radio, WifiOff, RefreshCw } from 'lucide-react';
import DeviceCard from './DeviceCard';
import { useSocket } from '../context/SocketContext';

export default function DeviceList({ devices, isScanning, onScan }) {
  const { connected, refreshDevices } = useSocket();

  const handleRefresh = () => {
    onScan();
    refreshDevices();
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div
        className="flex items-center justify-between gap-3 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2
          className="text-xs font-black tracking-widest uppercase flex items-center gap-2.5"
          style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(240,240,240,0.7)' }}
        >
          {connected ? (
            <Radio
              className="w-4 h-4"
              style={{ color: '#e10600' }}
            />
          ) : (
            <WifiOff className="w-4 h-4" style={{ color: 'rgba(240,240,240,0.3)' }} />
          )}
          Drivers on Track
          {devices.length > 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs font-black"
              style={{
                background: 'rgba(225,6,0,0.15)',
                border: '1px solid rgba(225,6,0,0.3)',
                color: '#e10600',
                fontFamily: 'Orbitron, monospace',
                fontSize: '10px',
              }}
            >
              {devices.length}
            </span>
          )}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isScanning || !connected}
          className="flex items-center gap-1.5 py-1.5 px-3 min-h-[36px] rounded-lg text-xs font-bold tracking-widest uppercase disabled:opacity-40 transition-all duration-200 touch-manipulation"
          style={{
            fontFamily: 'Orbitron, monospace',
            color: isScanning ? '#e10600' : 'rgba(240,240,240,0.5)',
            background: 'transparent',
            border: 'none',
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e10600'; }}
          onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = 'rgba(240,240,240,0.5)'; }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'SCANNING' : 'REFRESH'}
        </button>
      </div>

      {/* Scanning animation */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-xl p-6 overflow-hidden"
          style={{
            background: 'rgba(225,6,0,0.04)',
            border: '1px solid rgba(225,6,0,0.15)',
          }}
        >
          {/* Scan line animation */}
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #e10600, transparent)',
              animation: 'scan-line 2s linear infinite',
              opacity: 0.6,
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{ background: '#e10600' }}
                  animate={{ height: [8, 24, 8] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(225,6,0,0.8)' }}
            >
              Scanning circuit...
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {devices.length === 0 && !isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-14 px-4 rounded-xl relative overflow-hidden"
          style={{
            background: '#181818',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(225,6,0,0.08)',
                border: '1px solid rgba(225,6,0,0.2)',
              }}
            >
              <WifiOff className="w-6 h-6" style={{ color: 'rgba(225,6,0,0.6)' }} />
            </div>
            <p
              className="font-bold text-sm mb-2"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(240,240,240,0.7)' }}
            >
              NO DRIVERS FOUND
            </p>
            <p
              className="text-xs max-w-[230px] mx-auto leading-relaxed"
              style={{ color: 'rgba(240,240,240,0.35)', fontFamily: 'Inter, sans-serif' }}
            >
              Ensure other devices are on the same network and have Zeronet open.
            </p>
          </div>
        </motion.div>
      )}

      {/* Device cards */}
      {devices.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
          className="space-y-3"
        >
          {devices.map((device, i) => (
            <motion.li
              key={device.deviceId}
              variants={{
                visible: { opacity: 1, x: 0 },
                hidden: { opacity: 0, x: -16 },
              }}
            >
              <DeviceCard device={device} index={i} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
