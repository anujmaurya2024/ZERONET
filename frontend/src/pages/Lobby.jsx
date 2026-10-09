import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import DeviceList from '../components/DeviceList';
import ConnectionModal from '../components/ConnectionModal';
import { useSocket } from '../context/SocketContext';
import { useDiscovery } from '../context/DiscoveryContext';

export default function Lobby() {
  const { onlineDevices, connected } = useSocket();
  const { discoverServers, isScanning, serverUrl, setServerUrl, discoveredServers } = useDiscovery();

  useEffect(() => {
    discoverServers();
  }, []);

  return (
    <div
      className="min-h-screen min-h-[100dvh] pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))]"
      style={{ background: 'transparent' }}
    >
      <ConnectionModal />

      <div className="max-w-2xl mx-auto pl-safe-l pr-safe-r px-4 sm:px-6 py-6 sm:py-10">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 relative"
        >
          {/* Background speed lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px opacity-10"
                style={{
                  background: 'linear-gradient(90deg, transparent, #e10600, transparent)',
                  top: `${20 + i * 15}%`,
                  left: 0,
                  right: 0,
                  animation: `raceStripe ${2 + i * 0.5}s linear infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          </div>

          {/* F1 flag decoration */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(225,6,0,0.5))' }}
            />
            <div
              className="px-3 py-1 rounded text-xs font-black tracking-[0.2em] uppercase"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'rgba(225,6,0,0.12)',
                border: '1px solid rgba(225,6,0,0.3)',
                color: '#e10600',
              }}
            >
              LOCAL NETWORK
            </div>
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, rgba(225,6,0,0.5), transparent)' }}
            />
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight mb-3 leading-none"
            style={{ fontFamily: 'Orbitron, monospace', color: '#f0f0f0' }}
          >
            PIT LANE
          </h1>
          <p
            className="text-sm sm:text-base max-w-[300px] sm:max-w-none mx-auto leading-relaxed"
            style={{ color: 'rgba(240,240,240,0.55)', fontFamily: 'Inter, sans-serif' }}
          >
            Scan the circuit for nearby devices. Zero lag. No internet required.
          </p>
        </motion.div>

        {/* Server selector */}
        {discoveredServers.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 sm:mb-6 p-4 rounded-xl"
            style={{
              background: '#181818',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              className="absolute top-0 left-0 h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #e10600, transparent)' }}
            />
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ fontFamily: 'Orbitron, monospace', color: '#00d2ff' }}
            >
              Team Radio
            </p>
            <select
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-base focus:outline-none min-h-[48px] transition-all"
              style={{
                background: '#111',
                border: '1px solid rgba(225,6,0,0.25)',
                color: '#f0f0f0',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => { e.target.style.borderColor = '#e10600'; e.target.style.boxShadow = '0 0 0 2px rgba(225,6,0,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(225,6,0,0.25)'; e.target.style.boxShadow = 'none'; }}
            >
              {discoveredServers.map((s) => (
                <option key={s.url} value={s.url} style={{ background: '#111' }}>
                  {s.deviceName} ({s.url})
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-6 sm:mb-8"
        >
          <button
            onClick={discoverServers}
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[48px] rounded-xl text-base font-bold disabled:opacity-50 transition-all duration-200 touch-manipulation active:scale-95"
            style={{
              background: isScanning
                ? 'rgba(225,6,0,0.1)'
                : 'linear-gradient(135deg, #e10600, #a80400)',
              border: '1px solid rgba(225,6,0,0.4)',
              color: '#fff',
              fontFamily: 'Orbitron, monospace',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: isScanning ? 'none' : '0 0 12px rgba(225,6,0,0.25)',
            }}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'SCANNING...' : 'SCAN CIRCUIT'}
          </button>

          {connected && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: 'rgba(0,210,255,0.06)',
                border: '1px solid rgba(0,210,255,0.25)',
              }}
            >
              <Zap
                className="w-4 h-4"
                style={{ color: '#00d2ff', fill: '#00d2ff' }}
              />
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: 'Orbitron, monospace', color: '#00d2ff' }}
              >
                CONNECTED
              </span>
            </div>
          )}
        </motion.div>

        {/* Device list */}
        <DeviceList
          devices={onlineDevices}
          isScanning={isScanning}
          onScan={discoverServers}
        />
      </div>
    </div>
  );
}
