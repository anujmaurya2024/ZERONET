import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useDiscovery } from './DiscoveryContext';

const SocketContext = createContext(null);

const DEVICE_ID = `device-${Math.random().toString(36).slice(2, 11)}`;
const DEVICE_NAME = typeof navigator !== 'undefined' && navigator.userAgent
  ? `Device-${navigator.userAgent.slice(0, 20)}`
  : 'My Device';

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
      this.handlers.get(event).delete(handler);
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
  const socketRef = useRef(null);

  useEffect(() => {
    if (!serverUrl) return;
    const s = new ZeronetSocket(serverUrl);
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('register', { deviceId: DEVICE_ID, deviceName: DEVICE_NAME });
      s.emit('get-online-devices');
    });

    s.on('disconnect', () => setConnected(false));

    s.on('online-devices', (devices) => {
      setOnlineDevices(devices || []);
    });

    s.on('device-online', ({ deviceId, deviceName, socketId }) => {
      setOnlineDevices((prev) => {
        if (prev.some((d) => d.deviceId === deviceId)) return prev;
        return [...prev, { deviceId, deviceName, socketId }];
      });
    });

    s.on('device-offline', ({ deviceId }) => {
      setOnlineDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    });

    setSocket(s);
    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setOnlineDevices([]);
    };
  }, [serverUrl]);

  const requestConnection = useCallback((toDeviceId, toSocketId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('request-connection', {
      fromDeviceId: DEVICE_ID,
      fromDeviceName: DEVICE_NAME,
      toDeviceId,
      toSocketId,
    });
  }, []);

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
    deviceId: DEVICE_ID,
    deviceName: DEVICE_NAME,
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
