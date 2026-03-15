import React, { createContext, useContext, useState, useCallback } from 'react';
import { scanNetwork, getDefaultServerUrl } from '../utils/discovery';

const DiscoveryContext = createContext(null);

export function DiscoveryProvider({ children }) {
  const [serverUrl, setServerUrl] = useState(getDefaultServerUrl());
  const [discoveredServers, setDiscoveredServers] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const discoverServers = useCallback(async () => {
    setIsScanning(true);
    setDiscoveredServers([]);
    try {
      const servers = await scanNetwork();
      setDiscoveredServers(servers);
      if (servers.length > 0 && !serverUrl) {
        setServerUrl(servers[0].url);
      }
    } finally {
      setIsScanning(false);
    }
  }, [serverUrl]);

  const value = {
    serverUrl,
    setServerUrl,
    discoveredServers,
    discoverServers,
    isScanning,
  };

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used within DiscoveryProvider');
  return ctx;
}
