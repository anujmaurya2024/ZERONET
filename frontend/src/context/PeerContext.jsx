import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';

const PeerContext = createContext(null);

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export function PeerProvider({ children }) {
  const { socket, deviceId, deviceName } = useSocket();
  const [peers, setPeers] = useState({}); // peerId -> { pc, dc, name, status, remoteSocketId }
  const activePeersRef = useRef({}); // Synchronous map: peerId -> { pc, dc, name, status, remoteSocketId }
  const [incomingRequest, setIncomingRequest] = useState(null);
  const socketIdToPeerId = useRef({});
  const peerIdToSocketId = useRef({});
  const candidateQueues = useRef({}); // peerId -> candidate[]
  const dataChannelHandlers = useRef({}); // peerId -> (e) => void

  const updatePeer = useCallback((peerId, updates) => {
    const current = activePeersRef.current[peerId] || {};
    const updated = { ...current, ...updates };
    activePeersRef.current[peerId] = updated;
    setPeers((prev) => ({
      ...prev,
      [peerId]: updated,
    }));
  }, []);

  const flushCandidateQueue = useCallback(async (peerId, pc) => {
    const queue = candidateQueues.current[peerId];
    if (queue && queue.length > 0) {
      candidateQueues.current[peerId] = [];
      for (const cand of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn(`[WebRTC] Failed to add queued ICE candidate for ${peerId}:`, err);
        }
      }
    }
  }, []);

  const addIceCandidateSafely = useCallback(async (peerId, pc, candidate) => {
    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
      if (!candidateQueues.current[peerId]) {
        candidateQueues.current[peerId] = [];
      }
      candidateQueues.current[peerId].push(candidate);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn(`[WebRTC] Failed to add direct ICE candidate for ${peerId}:`, err);
    }
  }, []);

  const createPeerConnection = useCallback((peerId, remoteSocketId, isInitiator, peerName) => {
    return new Promise((resolve) => {
      // Clean up previous connection if exists
      const existing = activePeersRef.current[peerId];
      if (existing?.pc) {
        try {
          existing.pc.close();
        } catch {
          // ignore close error
        }
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      let dc = null;

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
        const handleOpen = () => {
          console.log(`[WebRTC] DataChannel open (initiator) for ${peerId}`);
          updatePeer(peerId, { dc, status: 'connected' });
        };
        dc.onopen = handleOpen;
        dc.onclose = () => {
          console.log(`[WebRTC] DataChannel closed for ${peerId}`);
          updatePeer(peerId, { status: 'disconnected' });
        };
        if (dc.readyState === 'open') {
          handleOpen();
        }
      } else {
        pc.ondatachannel = (e) => {
          dc = e.channel;
          console.log(`[WebRTC] ondatachannel received for ${peerId}, readyState: ${dc.readyState}`);
          attachMessageForwarder(dc);
          const handleOpen = () => {
            console.log(`[WebRTC] DataChannel open (receiver) for ${peerId}`);
            updatePeer(peerId, { dc, status: 'connected' });
          };
          dc.onopen = handleOpen;
          dc.onclose = () => {
            console.log(`[WebRTC] DataChannel closed for ${peerId}`);
            updatePeer(peerId, { status: 'disconnected' });
          };
          if (dc.readyState === 'open') {
            handleOpen();
          }
        };
      }

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit('webrtc-ice-candidate', {
            toSocketId: remoteSocketId,
            toDeviceId: peerId,
            candidate: e.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state for ${peerId}: ${pc.connectionState}`);
        if (pc.connectionState === 'connected') {
          updatePeer(peerId, { status: 'connected' });
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          updatePeer(peerId, { status: 'disconnected' });
        } else {
          updatePeer(peerId, { status: pc.connectionState });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE state for ${peerId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          updatePeer(peerId, { status: 'connected' });
        }
      };

      const peerRecord = {
        pc,
        dc: dc || null,
        name: peerName || existing?.name || peerId,
        status: 'connecting',
        remoteSocketId,
      };

      activePeersRef.current[peerId] = peerRecord;
      socketIdToPeerId.current[remoteSocketId] = peerId;
      peerIdToSocketId.current[peerId] = remoteSocketId;

      setPeers((prev) => ({
        ...prev,
        [peerId]: peerRecord,
      }));

      resolve({ pc, dc, isInitiator });
    });
  }, [socket, updatePeer]);

  const initiateConnection = useCallback((peerId, peerName, remoteSocketId) => {
    if (remoteSocketId) {
      socketIdToPeerId.current[remoteSocketId] = peerId;
      peerIdToSocketId.current[peerId] = remoteSocketId;
    }
    updatePeer(peerId, {
      name: peerName || peerId,
      status: 'connecting',
      remoteSocketId,
    });
    socket.emit('request-connection', {
      fromDeviceId: deviceId,
      fromDeviceName: deviceName,
      toDeviceId: peerId,
    });
  }, [socket, deviceId, deviceName, updatePeer]);

  useEffect(() => {
    if (!socket) return;

    const handleConnectionRequest = ({ fromDeviceId, fromDeviceName, fromSocketId }) => {
      console.log(`[WebRTC] Incoming connection request from ${fromDeviceName} (${fromDeviceId})`);
      socketIdToPeerId.current[fromSocketId] = fromDeviceId;
      peerIdToSocketId.current[fromDeviceId] = fromSocketId;
      setIncomingRequest({ fromDeviceId, fromDeviceName, fromSocketId });
    };

    const handleConnectionAccepted = async ({ toSocketId, toDeviceId, toDeviceName }) => {
      console.log(`[WebRTC] Connection accepted by ${toDeviceName} (${toDeviceId}) with socket ${toSocketId}`);
      const peerId = toDeviceId;
      socketIdToPeerId.current[toSocketId] = peerId;
      peerIdToSocketId.current[peerId] = toSocketId;

      const { pc } = await createPeerConnection(peerId, toSocketId, true, toDeviceName);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', {
        toSocketId,
        toDeviceId: peerId,
        offer,
      });
    };

    const handleConnectionRejected = () => {
      console.log('[WebRTC] Connection request rejected');
      setIncomingRequest(null);
    };

    const handleWebRtcOffer = async ({ fromSocketId, toDeviceId, offer }) => {
      console.log(`[WebRTC] Received offer from socket ${fromSocketId}`);
      const peerId = socketIdToPeerId.current[fromSocketId] || toDeviceId;
      if (!peerId) {
        console.warn('[WebRTC] Cannot resolve peerId for received offer');
        return;
      }

      let peer = activePeersRef.current[peerId];
      let pc = peer?.pc;
      if (!pc) {
        console.log(`[WebRTC] Creating peer connection on offer for ${peerId}`);
        const res = await createPeerConnection(peerId, fromSocketId, false);
        pc = res.pc;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushCandidateQueue(peerId, pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        toSocketId: fromSocketId,
        toDeviceId: peerId,
        answer,
      });

      setIncomingRequest(null);
    };

    const handleWebRtcAnswer = async ({ fromSocketId, answer }) => {
      console.log(`[WebRTC] Received answer from socket ${fromSocketId}`);
      const peerId = socketIdToPeerId.current[fromSocketId];
      const peer = peerId ? activePeersRef.current[peerId] : null;
      const pc = peer?.pc;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidateQueue(peerId, pc);
      } else {
        console.warn(`[WebRTC] Peer connection not found for answer from ${fromSocketId}`);
      }
    };

    const handleWebRtcIceCandidate = async ({ fromSocketId, candidate }) => {
      const peerId = socketIdToPeerId.current[fromSocketId];
      if (!peerId) {
        console.warn(`[WebRTC] Unknown peer for ICE candidate from ${fromSocketId}`);
        return;
      }
      const peer = activePeersRef.current[peerId];
      await addIceCandidateSafely(peerId, peer?.pc, candidate);
    };

    socket.on('connection-request', handleConnectionRequest);
    socket.on('connection-accepted', handleConnectionAccepted);
    socket.on('connection-rejected', handleConnectionRejected);
    socket.on('webrtc-offer', handleWebRtcOffer);
    socket.on('webrtc-answer', handleWebRtcAnswer);
    socket.on('webrtc-ice-candidate', handleWebRtcIceCandidate);

    return () => {
      socket.off('connection-request', handleConnectionRequest);
      socket.off('connection-accepted', handleConnectionAccepted);
      socket.off('connection-rejected', handleConnectionRejected);
      socket.off('webrtc-offer', handleWebRtcOffer);
      socket.off('webrtc-answer', handleWebRtcAnswer);
      socket.off('webrtc-ice-candidate', handleWebRtcIceCandidate);
    };
  }, [socket, createPeerConnection, flushCandidateQueue, addIceCandidateSafely]);

  const acceptRequest = useCallback(async () => {
    if (!incomingRequest) return null;
    const { fromDeviceId, fromSocketId, fromDeviceName } = incomingRequest;
    console.log(`[WebRTC] Accepting request from ${fromDeviceName} (${fromDeviceId})`);

    socketIdToPeerId.current[fromSocketId] = fromDeviceId;
    peerIdToSocketId.current[fromDeviceId] = fromSocketId;

    await createPeerConnection(
      fromDeviceId,
      fromSocketId,
      false,
      fromDeviceName
    );

    socket.emit('connection-accepted', {
      fromSocketId,
      toDeviceId: deviceId,
    });

    setIncomingRequest(null);
    return fromDeviceId;
  }, [incomingRequest, socket, deviceId, createPeerConnection]);

  const rejectRequest = useCallback(() => {
    if (incomingRequest) {
      socket.emit('connection-rejected', { fromSocketId: incomingRequest.fromSocketId });
      setIncomingRequest(null);
    }
  }, [incomingRequest, socket]);

  const sendToPeer = useCallback((peerId, data) => {
    const peer = activePeersRef.current[peerId] || peers[peerId];
    if (peer?.dc?.readyState === 'open') {
      peer.dc.send(data);
    }
  }, [peers]);

  const registerDataChannelHandler = useCallback((peerId, handler) => {
    dataChannelHandlers.current[peerId] = handler;
    const peer = activePeersRef.current[peerId];
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
