import { motion } from 'framer-motion';
import { Wifi, RefreshCw, Radar, ShieldCheck } from 'lucide-react';
import DeviceCard from './DeviceCard';
import { useSocket } from '../context/SocketContext';

export default function DeviceList({ devices, isScanning, onScan, onSelectPeer }) {
  const { connected, refreshDevices } = useSocket();

  const handleRefresh = () => {
    if (onScan) onScan();
    refreshDevices();
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-1 pb-2 border-b border-[rgba(134,150,160,0.12)]">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25d366]" />
            <span className="absolute w-4 h-4 rounded-full bg-[#25d366]/40 animate-ping" />
          </div>
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#e9edef] flex items-center gap-2">
            Within Range
            {devices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#25d366] text-[10px] font-bold">
                {devices.length}
              </span>
            )}
          </h2>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isScanning || !connected}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium text-[#8696a0] hover:text-[#00a884] hover:bg-[#202c33] transition-colors disabled:opacity-40"
          title="Scan network for nearby devices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#00a884]' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan Range'}</span>
        </button>
      </div>

      {/* Devices list or empty radar state */}
      {devices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: '#111b21',
            border: '1px dashed rgba(134, 150, 160, 0.2)',
          }}
        >
          {/* Radar visualization */}
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#00a884]/20 wa-radar-pulse" />
            <div className="w-12 h-12 rounded-full bg-[#202c33] border border-[#00a884]/30 flex items-center justify-center text-[#00a884]">
              <Radar className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-[#e9edef] mb-1">
            {isScanning ? 'Scanning for nearby devices...' : 'Searching Within Range'}
          </h3>
          <p className="text-xs text-[#8696a0] max-w-xs mx-auto mb-4 leading-relaxed">
            Ensure other phones or PCs are connected to the same Wi-Fi router or hotspot, and have this page open.
          </p>

          <button
            onClick={handleRefresh}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            Scan Nearby
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {devices.map((device, idx) => (
            <DeviceCard
              key={device.deviceId || idx}
              device={device}
              index={idx}
              onSelectPeer={onSelectPeer}
            />
          ))}
        </div>
      )}

      {/* Security reminder */}
      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-[#8696a0]">
        <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0" />
        <span>Direct device-to-device chat within local Wi-Fi range</span>
      </div>
    </div>
  );
}
