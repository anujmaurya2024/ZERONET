import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDiscovery } from './DiscoveryContext';

const SocketContext = createContext(null);

const DEVICE_ID = `device-${Math.random().toString(36).slice(2, 11)}`;
const DEVICE_NAME = typeof navigator !== 'undefined' && navigator.userAgent
  ? `Device-${navigator.userAgent.slice(0, 20)}`
  : 'My Device';

export function SocketProvider({ children }) {
  const { serverUrl } = useDiscovery();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!serverUrl) return;
    const s = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('register', { deviceId: DEVICE_ID, deviceName: DEVICE_NAME });
      s.emit('get-online-devices');
    });

    s.on('disconnect', () => setConnected(false));

    s.on('online-devices', (devices) => {
      setOnlineDevices(devices);
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
