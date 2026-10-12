import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePeer } from './PeerContext';
import { useSocket } from './SocketContext';
import { playIncomingMessageSound, playSentMessageSound } from '../utils/sound';
import { CHUNK_SIZE } from '../utils/fileChunks';

const ChatContext = createContext(null);

const STORAGE_KEY = 'zeronet_whatsapp_chats_v1';

function loadStoredChats() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredChats(chats) {
  if (typeof window === 'undefined') return;
  try {
    // Only store text, meta, and compact messages (exclude huge raw blobs from localStorage)
    const sanitized = {};
    for (const [peerId, msgs] of Object.entries(chats)) {
      sanitized[peerId] = msgs.slice(-50).map((m) => ({
        id: m.id,
        type: m.type,
        text: m.text,
        fileName: m.fileName,
        fileSize: m.fileSize,
        duration: m.duration,
        timestamp: m.timestamp,
        isOwn: m.isOwn,
        status: m.status || 'read',
        reactions: m.reactions || [],
        previewUrl: m.type === 'image' && m.dataUrl?.length < 100000 ? m.dataUrl : undefined,
      }));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.debug('Failed to save chat storage', e);
  }
}

export function ChatProvider({ children }) {
  const { peers, sendToPeer, registerDataChannelHandler, unregisterDataChannelHandler } = usePeer();
  const { deviceId, deviceName } = useSocket();

  const [chats, setChats] = useState(loadStoredChats);
  const [activePeerId, setActivePeerId] = useState(null);
  const [typingByPeer, setTypingByPeer] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [fileProgress, setFileProgress] = useState({}); // fileId -> { progress, fileName }
  const [incomingFiles, setIncomingFiles] = useState({});

  const activePeerRef = useRef(activePeerId);
  useEffect(() => {
    activePeerRef.current = activePeerId;
  }, [activePeerId]);

  // Save to localStorage whenever chats update
  useEffect(() => {
    saveStoredChats(chats);
  }, [chats]);

  const markAsRead = useCallback((peerId) => {
    if (!peerId) return;
    setUnreadCounts((prev) => ({ ...prev, [peerId]: 0 }));
    setChats((prev) => {
      const list = prev[peerId];
      if (!list) return prev;
      const updated = list.map((m) => (m.isOwn ? m : { ...m, status: 'read' }));
      return { ...prev, [peerId]: updated };
    });
  }, []);

  const addMessageToChat = useCallback((peerId, message) => {
    setChats((prev) => {
      const existing = prev[peerId] || [];
      // Prevent duplicate messages by ID
      if (existing.some((m) => m.id === message.id)) {
        return prev;
      }
      return {
        ...prev,
        [peerId]: [...existing, message],
      };
    });

    if (!message.isOwn) {
      if (activePeerRef.current !== peerId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [peerId]: (prev[peerId] || 0) + 1,
        }));
      }
      playIncomingMessageSound();
    }
  }, []);

  // Handle incoming parsed JSON or string payload from peer
  const handleIncomingPayload = useCallback((payloadStr, fromPeerId) => {
    if (!fromPeerId) return;
    try {
      const data = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
      
      if (data.type === 'text') {
        const msg = {
          id: data.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'text',
          text: data.payload,
          timestamp: data.timestamp || Date.now(),
          isOwn: false,
          status: 'read',
          reactions: [],
        };
        addMessageToChat(fromPeerId, msg);
      } else if (data.type === 'typing') {
        setTypingByPeer((prev) => ({ ...prev, [fromPeerId]: !!data.payload }));
      } else if (data.type === 'reaction') {
        setChats((prev) => {
          const list = prev[fromPeerId] || [];
          const updated = list.map((m) => {
            if (m.id === data.messageId) {
              const reactions = (m.reactions || []).filter((r) => r.from !== fromPeerId);
              if (data.emoji) reactions.push({ from: fromPeerId, emoji: data.emoji });
              return { ...m, reactions };
            }
            return m;
          });
          return { ...prev, [fromPeerId]: updated };
        });
      } else if (data.type === 'image') {
        const msg = {
          id: data.id || `img_${Date.now()}`,
          type: 'image',
          fileName: data.fileName,
          fileSize: data.fileSize,
          dataUrl: data.dataUrl,
          blobUrl: data.dataUrl,
          caption: data.caption,
          timestamp: data.timestamp || Date.now(),
          isOwn: false,
          status: 'read',
          reactions: [],
        };
        addMessageToChat(fromPeerId, msg);
      } else if (data.type === 'voice') {
        const msg = {
          id: data.id || `voice_${Date.now()}`,
          type: 'audio',
          duration: data.duration || 0,
          dataUrl: data.dataUrl,
          blobUrl: data.dataUrl,
          timestamp: data.timestamp || Date.now(),
          isOwn: false,
          status: 'read',
          reactions: [],
        };
        addMessageToChat(fromPeerId, msg);
      } else if (data.type === 'file-meta') {
        setIncomingFiles((f) => ({
          ...f,
          [data.fileId]: {
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            totalChunks: data.totalChunks,
            fromPeerId,
            chunks: {},
          },
        }));
      }
    } catch {
      // Fallback plain text
      addMessageToChat(fromPeerId, {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'text',
        text: String(payloadStr),
        timestamp: Date.now(),
        isOwn: false,
        status: 'read',
        reactions: [],
      });
    }
  }, [addMessageToChat]);

  // Set up message handlers for all active peers
  useEffect(() => {
    const peerIds = Object.keys(peers);

    peerIds.forEach((peerId) => {
      const handler = (e) => {
        const data = e.data;
        if (typeof data === 'string') {
          handleIncomingPayload(data, peerId);
        } else if (data instanceof Blob) {
          data.text().then((text) => handleIncomingPayload(text, peerId));
        } else if (data instanceof ArrayBuffer) {
          try {
            const view = new DataView(data);
            const fileIdLen = view.getUint32(0, true);
            const fileId = new TextDecoder().decode(data.slice(4, 4 + fileIdLen));
            const chunkIndex = view.getUint32(4 + fileIdLen, true);
            const totalChunks = view.getUint32(8 + fileIdLen, true);
            const payload = data.slice(12 + fileIdLen);

            setIncomingFiles((prev) => {
              const file = prev[fileId];
              if (!file) return prev;
              const chunks = { ...file.chunks, [chunkIndex]: payload };
              const received = Object.keys(chunks).length;
              const progress = Math.round((received / totalChunks) * 100);
              setFileProgress((p) => ({
                ...p,
                [fileId]: { progress, fileName: file.fileName },
              }));

              if (received === totalChunks) {
                const sorted = Array.from({ length: totalChunks }, (_, i) => chunks[i]);
                const blob = new Blob(sorted, { type: file.fileType || 'application/octet-stream' });
                const blobUrl = URL.createObjectURL(blob);
                const isImg = file.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName);

                const newMsg = {
                  id: fileId,
                  type: isImg ? 'image' : 'file',
                  fileName: file.fileName,
                  fileSize: file.fileSize,
                  blobUrl,
                  dataUrl: isImg ? blobUrl : undefined,
                  timestamp: Date.now(),
                  isOwn: false,
                  status: 'complete',
                  reactions: [],
                };
                addMessageToChat(peerId, newMsg);

                setFileProgress((p) => {
                  const next = { ...p };
                  delete next[fileId];
                  return next;
                });
                const next = { ...prev };
                delete next[fileId];
                return next;
              }
              return { ...prev, [fileId]: { ...file, chunks } };
            });
          } catch (err) {
            console.error('Error processing ArrayBuffer chunk', err);
          }
        }
      };

      registerDataChannelHandler(peerId, handler);
    });

    return () => {
      peerIds.forEach((peerId) => unregisterDataChannelHandler(peerId));
    };
  }, [peers, registerDataChannelHandler, unregisterDataChannelHandler, handleIncomingPayload, addMessageToChat]);

  // Send plain text message
  const sendMessage = useCallback(
    (peerId, text) => {
      if (!peerId || !text.trim()) return;
      const trimmed = text.trim();
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const payload = {
        id: messageId,
        type: 'text',
        payload: trimmed,
        timestamp: Date.now(),
        fromDeviceId: deviceId,
        fromDeviceName: deviceName,
      };

      sendToPeer(peerId, JSON.stringify(payload));
      playSentMessageSound();

      const newMsg = {
        id: messageId,
        type: 'text',
        text: trimmed,
        timestamp: Date.now(),
        isOwn: true,
        status: 'delivered',
        reactions: [],
      };
      addMessageToChat(peerId, newMsg);
    },
    [deviceId, deviceName, sendToPeer, addMessageToChat]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (peerId, isTyping) => {
      if (!peerId) return;
      sendToPeer(peerId, JSON.stringify({ type: 'typing', payload: isTyping }));
    },
    [sendToPeer]
  );

  // Send quick reaction
  const addReaction = useCallback(
    (peerId, messageId, emoji) => {
      if (!peerId || !messageId) return;
      sendToPeer(
        peerId,
        JSON.stringify({
          type: 'reaction',
          messageId,
          emoji,
        })
      );
      setChats((prev) => {
        const list = prev[peerId] || [];
        const updated = list.map((m) => {
          if (m.id === messageId) {
            const reactions = (m.reactions || []).filter((r) => r.from !== deviceId);
            if (emoji) reactions.push({ from: deviceId, emoji });
            return { ...m, reactions };
          }
          return m;
        });
        return { ...prev, [peerId]: updated };
      });
    },
    [deviceId, sendToPeer]
  );

  // Send voice note
  const sendVoiceNote = useCallback(
    (peerId, audioBlob, durationSec) => {
      if (!peerId || !audioBlob) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const messageId = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const payload = {
          id: messageId,
          type: 'voice',
          dataUrl,
          duration: durationSec,
          timestamp: Date.now(),
        };

        sendToPeer(peerId, JSON.stringify(payload));
        playSentMessageSound();

        const newMsg = {
          id: messageId,
          type: 'audio',
          duration: durationSec,
          blobUrl: URL.createObjectURL(audioBlob),
          dataUrl,
          timestamp: Date.now(),
          isOwn: true,
          status: 'delivered',
          reactions: [],
        };
        addMessageToChat(peerId, newMsg);
      };
      reader.readAsDataURL(audioBlob);
    },
    [sendToPeer, addMessageToChat]
  );

  // Send Image with preview
  const sendImage = useCallback(
    (peerId, file, caption = '') => {
      if (!peerId || !file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const messageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const payload = {
          id: messageId,
          type: 'image',
          fileName: file.name,
          fileSize: file.size,
          dataUrl,
          caption,
          timestamp: Date.now(),
        };

        sendToPeer(peerId, JSON.stringify(payload));
        playSentMessageSound();

        const newMsg = {
          id: messageId,
          type: 'image',
          fileName: file.name,
          fileSize: file.size,
          blobUrl: URL.createObjectURL(file),
          dataUrl,
          caption,
          timestamp: Date.now(),
          isOwn: true,
          status: 'delivered',
          reactions: [],
        };
        addMessageToChat(peerId, newMsg);
      };
      reader.readAsDataURL(file);
    },
    [sendToPeer, addMessageToChat]
  );

  // Send regular document/file
  const sendDocument = useCallback(
    async (peerId, file) => {
      if (!peerId || !file) return;
      const peer = peers[peerId];
      const dc = peer?.dc;

      // If file is an image, send as image with direct preview
      if (file.type.startsWith('image/')) {
        sendImage(peerId, file);
        return;
      }

      // If DataChannel is open, send chunked
      if (dc && dc.readyState === 'open') {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileId = `${file.name}-${file.size}-${Date.now()}`;

        // Send metadata
        dc.send(
          JSON.stringify({
            type: 'file-meta',
            fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            totalChunks,
          })
        );

        const newMsg = {
          id: fileId,
          type: 'file',
          fileName: file.name,
          fileSize: file.size,
          blobUrl: URL.createObjectURL(file),
          timestamp: Date.now(),
          isOwn: true,
          status: 'sending',
          progress: 0,
          reactions: [],
        };
        addMessageToChat(peerId, newMsg);

        // Read and send chunks
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const slice = file.slice(start, end);
          const buffer = await slice.arrayBuffer();

          const fileIdBytes = new TextEncoder().encode(fileId);
          const header = new ArrayBuffer(12 + fileIdBytes.length);
          const view = new DataView(header);
          view.setUint32(0, fileIdBytes.length, true);
          new Uint8Array(header, 4, fileIdBytes.length).set(fileIdBytes);
          view.setUint32(4 + fileIdBytes.length, chunkIndex, true);
          view.setUint32(8 + fileIdBytes.length, totalChunks, true);

          const combined = new Uint8Array(header.byteLength + buffer.byteLength);
          combined.set(new Uint8Array(header), 0);
          combined.set(new Uint8Array(buffer), header.byteLength);

          dc.send(combined.buffer);

          const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
          setChats((prev) => {
            const list = prev[peerId] || [];
            return {
              ...prev,
              [peerId]: list.map((m) =>
                m.id === fileId ? { ...m, progress, status: progress === 100 ? 'complete' : 'sending' } : m
              ),
            };
          });
        }
      } else {
        // Fallback for smaller files via DataURL over relay
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const fileId = `file_${Date.now()}`;
          sendToPeer(
            peerId,
            JSON.stringify({
              type: 'file',
              fileId,
              fileName: file.name,
              fileSize: file.size,
              dataUrl,
              timestamp: Date.now(),
            })
          );
          addMessageToChat(peerId, {
            id: fileId,
            type: 'file',
            fileName: file.name,
            fileSize: file.size,
            blobUrl: URL.createObjectURL(file),
            dataUrl,
            timestamp: Date.now(),
            isOwn: true,
            status: 'complete',
            reactions: [],
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [peers, sendImage, sendToPeer, addMessageToChat]
  );

  const getChatMessages = useCallback(
    (peerId) => {
      return chats[peerId] || [];
    },
    [chats]
  );

  const getLastMessage = useCallback(
    (peerId) => {
      const list = chats[peerId];
      if (!list || list.length === 0) return null;
      return list[list.length - 1];
    },
    [chats]
  );

  const clearChat = useCallback((peerId) => {
    if (!peerId) return;
    setChats((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    setUnreadCounts((prev) => ({ ...prev, [peerId]: 0 }));
  }, []);

  const value = {
    chats,
    activePeerId,
    setActivePeerId,
    typingByPeer,
    unreadCounts,
    fileProgress,
    getChatMessages,
    getLastMessage,
    sendMessage,
    sendTyping,
    addReaction,
    sendVoiceNote,
    sendImage,
    sendDocument,
    markAsRead,
    clearChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
