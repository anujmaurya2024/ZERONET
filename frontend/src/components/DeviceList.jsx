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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          {connected ? (
            <Wifi className="w-5 h-5 text-accent" />
          ) : (
            <WifiOff className="w-5 h-5 text-slate-400" />
          )}
          Nearby devices
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isScanning || !connected}
          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {isScanning ? 'Scanning...' : 'Refresh'}
        </button>
      </div>

      {devices.length === 0 && !isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-500 rounded-xl bg-slate-50 border border-dashed border-slate-200"
        >
          <p className="font-medium">No devices found</p>
          <p className="text-sm mt-1">Make sure other devices are on the same network and have Zeronet open.</p>
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
