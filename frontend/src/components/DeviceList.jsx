import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-text flex items-center gap-2">
          {connected ? (
            <Wifi className="w-5 h-5 text-accent shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          Nearby devices
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isScanning || !connected}
          className="text-sm font-medium text-primary active:underline sm:hover:underline disabled:opacity-50 disabled:no-underline py-2 px-3 min-h-[44px] flex items-center touch-manipulation"
        >
          {isScanning ? 'Scanning...' : 'Refresh'}
        </button>
      </div>

      {devices.length === 0 && !isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 sm:py-12 px-4 text-slate-500 rounded-xl bg-slate-50 border border-dashed border-slate-200"
        >
          <p className="font-medium text-base">No devices found</p>
          <p className="text-sm mt-1.5 max-w-[260px] mx-auto">Make sure other devices are on the same network and have Zeronet open.</p>
        </motion.div>
      )}

      {devices.length > 0 && (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
            hidden: {},
          }}
          className="space-y-3"
        >
          {devices.map((device, i) => (
            <motion.li
              key={device.deviceId}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 10 },
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
