import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';

const PeerContext = createContext(null);

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export function PeerProvider({ children }) {
  const { socket, deviceId, deviceName } = useSocket();
  const [peers, setPeers] = useState({}); // peerId -> { pc, dc, name, status, remoteSocketId }
  const peersRef = useRef(peers);
  peersRef.current = peers;
  const [incomingRequest, setIncomingRequest] = useState(null);
  const socketIdToPeerId = useRef({});
  const pendingPeerBySocketId = useRef({});
  const dataChannelHandlers = useRef({}); // peerId -> (e) => void, so messages are handled even if useChat effect runs late

  const createPeerConnection = useCallback((peerId, remoteSocketId, isInitiator, peerName) => {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      let dc = null;

      const updatePeer = (updates) => {
        setPeers((p) => ({
          ...p,
          [peerId]: { ...(p[peerId] || {}), ...updates },
        }));
      };

      const attachMessageForwarder = (channel) => {
        if (!channel) return;
        channel.binaryType = 'arraybuffer';
        channel.onmessage = (e) => {
          const fn = dataChannelHandlers.current[peerId];
          if (fn) fn(e);
        };
      };

      if (isInitiator) {
        dc = pc.createDataChannel('zeronet', { ordered: true });
        attachMessageForwarder(dc);
        dc.onopen = () => updatePeer({ dc, status: 'connected' });
        dc.onclose = () => updatePeer({ status: 'disconnected' });
      } else {
        pc.ondatachannel = (e) => {
          dc = e.channel;
          attachMessageForwarder(dc);
          dc.onopen = () => updatePeer({ dc, status: 'connected' });
          dc.onclose = () => updatePeer({ status: 'disconnected' });
        };
      }

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit('webrtc-ice-candidate', {
            toSocketId: remoteSocketId,
            candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        updatePeer({ status: pc.connectionState });
      };

      setPeers((p) => ({
        ...p,
        [peerId]: {
          pc,
          dc: dc || null,
          name: peerName || peerId,
          status: 'connecting',
          remoteSocketId,
        },
      }));

      socketIdToPeerId.current[remoteSocketId] = peerId;
      if (!isInitiator) pendingPeerBySocketId.current[remoteSocketId] = { pc };
      resolve({ pc, dc, isInitiator });
    });
  }, [socket]);

  const initiateConnection = useCallback((peerId, peerName, remoteSocketId) => {
    socket.emit('request-connection', {
      fromDeviceId: deviceId,
      fromDeviceName: deviceName,
      toDeviceId: peerId,
    });
  }, [socket, deviceId, deviceName]);

  useEffect(() => {
    if (!socket) return;

    socket.on('connection-request', ({ fromDeviceId, fromDeviceName, fromSocketId }) => {
      setIncomingRequest({ fromDeviceId, fromDeviceName, fromSocketId });
    });

    socket.on('connection-accepted', async ({ toSocketId, toDeviceId, toDeviceName }) => {
      const peerId = toDeviceId;
      const { pc } = await createPeerConnection(peerId, toSocketId, true, toDeviceName);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { toSocketId, offer });
    });

    socket.on('connection-rejected', () => {
      setIncomingRequest(null);
    });

    socket.on('webrtc-offer', async ({ fromSocketId, offer }) => {
      const fromDeviceId = socketIdToPeerId.current[fromSocketId];
      const peerData = peersRef.current[fromDeviceId] ?? pendingPeerBySocketId.current[fromSocketId];
      const pc = peerData?.pc;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { toSocketId: fromSocketId, answer });
      delete pendingPeerBySocketId.current[fromSocketId];
      setIncomingRequest(null);
    });

    socket.on('webrtc-answer', async ({ fromSocketId, answer }) => {
      const peerId = socketIdToPeerId.current[fromSocketId];
      const peer = peerId && peersRef.current[peerId];
      if (peer?.pc) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('webrtc-ice-candidate', async ({ fromSocketId, candidate }) => {
      const peerId = socketIdToPeerId.current[fromSocketId];
      const peer = peerId && peersRef.current[peerId];
      if (peer?.pc) {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off('connection-request');
      socket.off('connection-accepted');
      socket.off('connection-rejected');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
    };
  }, [socket, incomingRequest, createPeerConnection]);

  const acceptRequest = useCallback(async () => {
    if (!incomingRequest) return;
    await createPeerConnection(
      incomingRequest.fromDeviceId,
      incomingRequest.fromSocketId,
      false,
      incomingRequest.fromDeviceName
    );
    socket.emit('connection-accepted', {
      fromSocketId: incomingRequest.fromSocketId,
      toDeviceId: deviceId,
    });
    setIncomingRequest(null);
  }, [incomingRequest, socket, deviceId, createPeerConnection]);

  const rejectRequest = useCallback(() => {
    if (incomingRequest) {
      socket.emit('connection-rejected', { fromSocketId: incomingRequest.fromSocketId });
      setIncomingRequest(null);
    }
  }, [incomingRequest, socket]);

  const sendToPeer = useCallback((peerId, data) => {
    const peer = peers[peerId];
    if (peer?.dc?.readyState === 'open') {
      peer.dc.send(data);
    }
  }, [peers]);

  const registerDataChannelHandler = useCallback((peerId, handler) => {
    dataChannelHandlers.current[peerId] = handler;
    const peer = peersRef.current[peerId];
    if (peer?.dc) {
      peer.dc.onmessage = (e) => {
        const fn = dataChannelHandlers.current[peerId];
        if (fn) fn(e);
      };
    }
  }, []);

  const unregisterDataChannelHandler = useCallback((peerId) => {
    delete dataChannelHandlers.current[peerId];
  }, []);

  const value = {
    peers,
    incomingRequest,
    initiateConnection,
    acceptRequest,
    rejectRequest,
    sendToPeer,
    registerDataChannelHandler,
    unregisterDataChannelHandler,
    setPeers,
  };

  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  );
}

export function usePeer() {
  const ctx = useContext(PeerContext);
  if (!ctx) throw new Error('usePeer must be used within PeerProvider');
  return ctx;
}
