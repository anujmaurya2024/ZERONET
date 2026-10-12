import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useDiscovery } from './DiscoveryContext';

const SocketContext = createContext(null);

function getInitialDeviceId() {
  if (typeof window === 'undefined') return `wa_${Math.random().toString(36).slice(2, 8)}`;
  let id = localStorage.getItem('zeronet_device_id');
  if (!id) {
    id = `wa_${Math.random().toString(36).slice(2, 9)}`;
    try {
      localStorage.setItem('zeronet_device_id', id);
    } catch {}
  }
  return id;
}

function detectPlatformName() {
  if (typeof window === 'undefined') return 'User';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'MacBook';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux Device';
  return 'Mobile';
}

function getInitialDeviceName() {
  if (typeof window === 'undefined') return 'WhatsApp User';
  let name = localStorage.getItem('zeronet_device_name');
  if (!name) {
    const platform = detectPlatformName();
    name = `${platform} (${Math.floor(100 + Math.random() * 900)})`;
    try {
      localStorage.setItem('zeronet_device_name', name);
    } catch {}
  }
  return name;
}

class ZeronetSocket {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.handlers = new Map();
    this.connected = false;
    this.closedByUser = false;
    this.reconnectTimer = null;
    this.connect();
  }

  connect() {
    try {
      const wsUrl = this.serverUrl.replace(/^http/, 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.trigger('connect');
      };

      this.ws.onclose = () => {
        const wasConnected = this.connected;
        this.connected = false;
        if (wasConnected) {
          this.trigger('disconnect');
        }
        if (!this.closedByUser) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => this.connect(), 2000);
        }
      };

      this.ws.onerror = () => {
        // Handled via onclose
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.event) {
            this.trigger(msg.event, msg.data);
          }
        } catch (err) {
          console.error('Invalid message received', err);
        }
      };
    } catch (e) {
      if (!this.closedByUser) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    }
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.handlers.has(event)) {
      if (handler) {
        this.handlers.get(event).delete(handler);
      } else {
        this.handlers.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data: data !== undefined ? data : null }));
    }
  }

  trigger(event, data) {
    const cbs = this.handlers.get(event);
    if (cbs) {
      cbs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket event handler [${event}]:`, e);
        }
      });
    }
  }

  disconnect() {
    this.closedByUser = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }
}

export function SocketProvider({ children }) {
  const { serverUrl } = useDiscovery();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState([]);
  const [deviceId] = useState(getInitialDeviceId);
  const [deviceName, setDeviceName] = useState(getInitialDeviceName);
  const socketRef = useRef(null);

  const updateDeviceName = useCallback((newName) => {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    setDeviceName(trimmed);
    try {
      localStorage.setItem('zeronet_device_name', trimmed);
    } catch {}
    if (socketRef.current?.connected) {
      socketRef.current.emit('register', { deviceId, deviceName: trimmed });
    }
  }, [deviceId]);

  useEffect(() => {
    if (!serverUrl) return;
    const s = new ZeronetSocket(serverUrl);
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('register', { deviceId, deviceName });
      s.emit('get-online-devices');
    });

    s.on('disconnect', () => setConnected(false));

    s.on('online-devices', (devices) => {
      setOnlineDevices(devices || []);
    });

    s.on('device-online', ({ deviceId: incomingDeviceId, deviceName: incomingName, socketId }) => {
      setOnlineDevices((prev) => {
        if (incomingDeviceId === deviceId) return prev;
        const exists = prev.some((d) => d.deviceId === incomingDeviceId);
        if (exists) {
          return prev.map((d) =>
            d.deviceId === incomingDeviceId ? { ...d, deviceName: incomingName, socketId } : d
          );
        }
        return [...prev, { deviceId: incomingDeviceId, deviceName: incomingName, socketId }];
      });
    });

    s.on('device-offline', ({ deviceId: offlineId }) => {
      setOnlineDevices((prev) => prev.filter((d) => d.deviceId !== offlineId));
    });

    setSocket(s);
    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setOnlineDevices([]);
    };
  }, [serverUrl, deviceId, deviceName]);

  const requestConnection = useCallback((toDeviceId, toSocketId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('request-connection', {
      fromDeviceId: deviceId,
      fromDeviceName: deviceName,
      toDeviceId,
      toSocketId,
    });
  }, [deviceId, deviceName]);

  const acceptConnection = useCallback((fromSocketId, toDeviceId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('connection-accepted', { fromSocketId, toDeviceId });
  }, []);

  const rejectConnection = useCallback((fromSocketId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('connection-rejected', { fromSocketId });
  }, []);

  const refreshDevices = useCallback(() => {
    if (socketRef.current?.connected) socketRef.current.emit('get-online-devices');
  }, []);

  const value = {
    socket,
    connected,
    onlineDevices,
    deviceId,
    deviceName,
    updateDeviceName,
    requestConnection,
    acceptConnection,
    rejectConnection,
    refreshDevices,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
