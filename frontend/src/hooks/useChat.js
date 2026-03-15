import { useState, useCallback, useRef, useEffect } from 'react';
import { usePeer } from '../context/PeerContext';
import { readFileInChunks, CHUNK_SIZE } from '../utils/fileChunks';

export function useChat(peerId) {
  const { peers, sendToPeer, registerDataChannelHandler, unregisterDataChannelHandler } = usePeer();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [fileProgress, setFileProgress] = useState({});
  const [incomingFiles, setIncomingFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const peerRef = useRef(null);

  const peer = peerId ? peers[peerId] : null;
  const dc = peer?.dc;

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  useEffect(() => {
    if (!peerId) return;

    const handleStringMessage = (str) => {
      try {
        const msg = JSON.parse(str);
        if (msg.type === 'text') {
          setMessages((m) => [
            ...m,
            { type: 'text', text: msg.payload, timestamp: Date.now(), isOwn: false },
          ]);
        }
        if (msg.type === 'typing') {
          setTyping(msg.payload);
        }
        if (msg.type === 'file-meta') {
          setIncomingFiles((f) => ({
            ...f,
            [msg.fileId]: {
              fileName: msg.fileName,
              fileSize: msg.fileSize,
              totalChunks: msg.totalChunks,
              chunks: {},
            },
          }));
        }
      } catch {
        setMessages((m) => [
          ...m,
          { type: 'text', text: str, timestamp: Date.now(), isOwn: false },
        ]);
      }
    };

    const onMessage = (e) => {
      const data = e.data;
      if (typeof data === 'string') {
        handleStringMessage(data);
      } else if (data instanceof Blob) {
        data.text().then(handleStringMessage);
      } else if (data instanceof ArrayBuffer) {
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
          setFileProgress((p) => ({ ...p, [fileId]: { ...p[fileId], progress, fileName: file.fileName } }));
          if (received === totalChunks) {
            const sorted = Array.from({ length: totalChunks }, (_, i) => chunks[i]);
            const blob = new Blob(sorted);
            const url = URL.createObjectURL(blob);
            setMessages((m) => [
              ...m,
              {
                type: 'file',
                fileId,
                fileName: file.fileName,
                fileSize: file.fileSize,
                blobUrl: url,
                timestamp: Date.now(),
                isOwn: false,
                status: 'complete',
                progress: 100,
              },
            ]);
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
      }
    };

    registerDataChannelHandler(peerId, onMessage);
    return () => unregisterDataChannelHandler(peerId);
  }, [peerId, registerDataChannelHandler, unregisterDataChannelHandler]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !dc || dc.readyState !== 'open') return;
      sendToPeer(peerId, JSON.stringify({ type: 'text', payload: text }));
      setMessages((m) => [
        ...m,
        { type: 'text', text, timestamp: Date.now(), isOwn: true },
      ]);
    },
    [dc, peerId, sendToPeer]
  );

  const sendTyping = useCallback(
    (value) => {
      if (dc?.readyState === 'open') {
        sendToPeer(peerId, JSON.stringify({ type: 'typing', payload: value }));
      }
    },
    [dc, peerId, sendToPeer]
  );

  const sendFile = useCallback(
    async (file) => {
      if (!dc || dc.readyState !== 'open') return;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;

      dc.send(
        JSON.stringify({
          type: 'file-meta',
          fileId,
          fileName: file.name,
          fileSize: file.size,
          totalChunks,
        })
      );

      setMessages((m) => [
        ...m,
        {
          type: 'file',
          fileId,
          fileName: file.name,
          fileSize: file.size,
          timestamp: Date.now(),
          isOwn: true,
          progress: 0,
          status: 'sending',
        },
      ]);

      let sent = 0;
      await readFileInChunks(file, async (chunk) => {
        const fileIdBytes = new TextEncoder().encode(chunk.fileId);
        const header = new ArrayBuffer(12 + fileIdBytes.length);
        const view = new DataView(header);
        view.setUint32(0, fileIdBytes.length, true);
        new Uint8Array(header, 4, fileIdBytes.length).set(fileIdBytes);
        view.setUint32(4 + fileIdBytes.length, chunk.chunkIndex, true);
        view.setUint32(8 + fileIdBytes.length, chunk.totalChunks, true);
        const combined = await mergeBuffers(header, chunk.data);
        dc.send(combined);
        sent++;
        const progress = Math.round((sent / totalChunks) * 100);
        setUploadProgress((p) => ({ ...p, [fileId]: progress }));
        setMessages((m) =>
          m.map((msg) =>
            msg.type === 'file' && msg.fileId === fileId
              ? { ...msg, progress, status: sent === totalChunks ? 'complete' : 'sending' }
              : msg
          )
        );
      });

      setUploadProgress((p) => {
        const next = { ...p };
        delete next[fileId];
        return next;
      });
    },
    [dc, peerId]
  );

  const downloadFile = useCallback((message) => {
    if (message.blobUrl) {
      const a = document.createElement('a');
      a.href = message.blobUrl;
      a.download = message.fileName;
      a.click();
    }
  }, []);

  return {
    messages,
    typing,
    fileProgress,
    sendMessage,
    sendTyping,
    sendFile,
    downloadFile,
    isConnected: dc?.readyState === 'open',
  };
}

function mergeBuffers(a, b) {
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(new Uint8Array(a));
  out.set(new Uint8Array(b), a.byteLength);
  return out.buffer;
}
