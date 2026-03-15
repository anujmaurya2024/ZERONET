import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, RefreshCw } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <ConnectionModal />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-text mb-2">Zeronet</h1>
          <p className="text-slate-500 text-sm">
            Discover devices on your local network. No internet required.
          </p>
        </motion.div>

        {discoveredServers.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-white border border-slate-200"
          >
            <p className="text-sm font-medium text-text mb-2">Server</p>
            <select
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {discoveredServers.map((s) => (
                <option key={s.url} value={s.url}>
                  {s.deviceName} ({s.url})
                </option>
              ))}
            </select>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <button
            onClick={discoverServers}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-text text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Find servers'}
          </button>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-sm text-accent">
              <Wifi className="w-4 h-4" />
              Connected
            </span>
          )}
        </motion.div>

        <DeviceList
          devices={onlineDevices}
          isScanning={isScanning}
          onScan={discoverServers}
        />
      </div>
    </div>
  );
}
