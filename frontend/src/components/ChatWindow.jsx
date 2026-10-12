import { useRef, useEffect, useState } from 'react';
import {
  Paperclip,
  Send,
  Smile,
  Mic,
  Image as ImageIcon,
  FileText,
  Phone,
  Video,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Lock,
  Trash2,
  Square,
  X,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import FileMessage from './FileMessage';
import ImageMessage from './ImageMessage';
import VoiceMessage from './VoiceMessage';
import TypingIndicator from './TypingIndicator';
import FileUpload from './FileUpload';
import { useChatContext } from '../context/ChatContext';
import { usePeer } from '../context/PeerContext';
import { getAvatarColor, getInitials } from '../utils/avatar';

const EMOJI_LIST = [
  '😊', '😂', '🤣', '❤️', '😍', '👍', '🔥', '🎉',
  '👏', '🙏', '🙌', '😎', '😉', '😢', '😮', '🤩',
  '💯', '✨', '👋', '🤝', '💪', '👌', '🤔', '🥳',
  '☕', '🍕', '🚀', '⭐', '💡', '🎵', '🚗', '📱',
];

export default function ChatWindow({ peerId, peerName, onBack }) {
  const {
    getChatMessages,
    typingByPeer,
    sendMessage,
    sendTyping,
    addReaction,
    sendVoiceNote,
    sendImage,
    sendDocument,
    markAsRead,
    clearChat,
  } = useChatContext();

  const { peers } = usePeer();
  const peer = peerId ? peers[peerId] : null;
  const isConnected = peer?.status === 'connected';
  const isConnecting = peer?.status === 'connecting' || peer?.status === 'requested';

  const messages = getChatMessages(peerId);
  const isPeerTyping = !!typingByPeer[peerId];

  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (peerId) {
      markAsRead(peerId);
    }
  }, [peerId, markAsRead, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(peerId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(peerId, false);
    }, 1500);
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !isConnected) return;
    sendMessage(peerId, input.trim());
    setInput('');
    setShowEmojis(false);
    sendTyping(peerId, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && isConnected) {
      sendDocument(peerId, file);
    }
    e.target.value = '';
    setShowAttachMenu(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && isConnected) {
      sendImage(peerId, file);
    }
    e.target.value = '';
    setShowAttachMenu(false);
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or support error:', err);
      // Fallback simulated voice note if user tests in environment without microphone permission
      const confirmed = window.confirm(
        'Microphone is not accessible or permission was not granted. Would you like to send a simulated voice note to test audio delivery?'
      );
      if (confirmed) {
        // Create an audio context beep blob
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const dst = ctx.createMediaStreamDestination();
        osc.connect(dst);
        osc.start();
        const simMr = new MediaRecorder(dst.stream);
        const chunks = [];
        simMr.ondataavailable = (e) => chunks.push(e.data);
        simMr.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          sendVoiceNote(peerId, blob, 3);
          ctx.close();
        };
        simMr.start();
        setTimeout(() => {
          simMr.stop();
          osc.stop();
        }, 3000);
      }
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    clearInterval(recordingTimerRef.current);

    const mr = mediaRecorderRef.current;
    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      sendVoiceNote(peerId, blob, recordingSeconds || 1);
      mr.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
    };
    mr.stop();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const avatarColor = getAvatarColor(peerName || peerId);
  const initials = getInitials(peerName || peerId);

  return (
    <div className="flex flex-col h-full w-full bg-[#0b141a] overflow-hidden select-none">
      {/* WhatsApp Chat Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2.5 min-h-[58px] z-10"
        style={{
          background: '#202c33',
          borderBottom: '1px solid rgba(134, 150, 160, 0.15)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-[#8696a0] hover:text-[#e9edef] rounded-full active:bg-white/10"
            >
              ←
            </button>
          )}

          {/* Contact Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>

          {/* Contact Details & Status */}
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#e9edef] leading-tight truncate">
              {peerName || 'Nearby User'}
            </h2>
            <p className="text-xs leading-normal truncate">
              {isPeerTyping ? (
                <span className="text-[#25d366] font-medium animate-pulse">typing...</span>
              ) : isConnected ? (
                <span className="text-[#8696a0]">online • in range</span>
              ) : isConnecting ? (
                <span className="text-[#e9edef]/60">connecting...</span>
              ) : (
                <span className="text-[#8696a0]">offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 text-[#aebac1]">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
            title="Video call"
            onClick={() => alert(`Starting video call with ${peerName}... (feature preview)`)}
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
            title="Voice call"
            onClick={() => alert(`Starting voice call with ${peerName}... (feature preview)`)}
          >
            <Phone className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptionsMenu((v) => !v)}
              className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div
                className="absolute right-0 top-10 w-44 rounded-xl py-1 z-30 shadow-2xl"
                style={{
                  background: '#233138',
                  border: '1px solid rgba(134, 150, 160, 0.15)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    clearChat(peerId);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-[#e9edef] hover:bg-[#182229] flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Body with WhatsApp Wallpaper Pattern */}
      <div
        className="flex-1 min-h-0 overflow-y-auto wa-chat-wallpaper p-3 sm:p-4 md:p-6 space-y-2 overscroll-contain"
        onClick={() => {
          setShowEmojis(false);
          setShowAttachMenu(false);
          setShowOptionsMenu(false);
        }}
      >
        {/* End-to-end Local Network Notice */}
        <div className="flex justify-center my-3">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-center max-w-md shadow-sm"
            style={{
              background: '#182229',
              border: '1px solid rgba(134, 150, 160, 0.15)',
              color: '#ffd279',
              fontSize: '11.5px',
            }}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Messages are transferred directly between devices in range (P2P). No internet used.</span>
          </div>
        </div>

        {/* Date separator */}
        <div className="flex justify-center my-2">
          <span
            className="px-3 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase shadow-sm"
            style={{
              background: '#182229',
              color: '#8696a0',
              border: '1px solid rgba(134, 150, 160, 0.12)',
            }}
          >
            Today
          </span>
        </div>

        {/* Connecting Notice if awaiting handshake */}
        {isConnecting && (
          <div className="flex justify-center my-4">
            <div
              className="p-4 rounded-xl text-center max-w-sm shadow-md animate-pulse"
              style={{
                background: '#202c33',
                border: '1px solid rgba(0, 168, 132, 0.3)',
              }}
            >
              <p className="text-sm font-semibold text-[#00a884] mb-1">
                Awaiting Connection...
              </p>
              <p className="text-xs text-[#8696a0]">
                Waiting for {peerName} to accept your chat request on their screen.
              </p>
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => {
          if (msg.type === 'text') {
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.isOwn}
                onReact={(messageId, emoji) => addReaction(peerId, messageId, emoji)}
              />
            );
          }
          if (msg.type === 'image') {
            return (
              <ImageMessage
                key={msg.id}
                message={msg}
                isOwn={msg.isOwn}
                onReact={(messageId, emoji) => addReaction(peerId, messageId, emoji)}
              />
            );
          }
          if (msg.type === 'audio') {
            return <VoiceMessage key={msg.id} message={msg} isOwn={msg.isOwn} />;
          }
          if (msg.type === 'file') {
            return <FileMessage key={msg.id} message={msg} isOwn={msg.isOwn} />;
          }
          return null;
        })}

        {isPeerTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojis && (
        <div
          className="shrink-0 p-3 max-h-48 overflow-y-auto grid grid-cols-8 gap-2 z-20"
          style={{
            background: '#202c33',
            borderTop: '1px solid rgba(134, 150, 160, 0.15)',
          }}
        >
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiSelect(emoji)}
              className="text-2xl p-2 rounded-lg hover:bg-[#2a3942] transition-colors flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* WhatsApp Input Bar */}
      <div
        className="shrink-0 px-3 py-2.5 relative z-20"
        style={{
          background: '#202c33',
          borderTop: '1px solid rgba(134, 150, 160, 0.15)',
        }}
      >
        {/* Hidden File and Image inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Attachment Menu Popup */}
        {showAttachMenu && (
          <div
            className="absolute left-10 bottom-16 w-48 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-1"
            style={{
              background: '#233138',
              border: '1px solid rgba(134, 150, 160, 0.15)',
            }}
          >
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e9edef] hover:bg-[#182229] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              Photos & Media
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e9edef] hover:bg-[#182229] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              Document
            </button>
          </div>
        )}

        {/* Input Bar or Active Voice Recording Bar */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-medium text-red-400">
                Recording {Math.floor(recordingSeconds / 60)}:
                {recordingSeconds % 60 < 10 ? '0' : ''}
                {recordingSeconds % 60}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-full text-[#8696a0] hover:text-white"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-lg active:scale-95"
                title="Send Voice Note"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Smile / Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojis((v) => !v)}
              className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#2a3942] transition-colors"
              title="Emojis"
            >
              <Smile className="w-6 h-6" />
            </button>

            {/* Paperclip / Attach Button */}
            <button
              type="button"
              onClick={() => setShowAttachMenu((v) => !v)}
              className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#2a3942] transition-colors"
              title="Attach"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full py-2.5 px-4 rounded-lg bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] focus:outline-none text-[15px]"
              />
            </div>

            {/* Send Button or Mic Button */}
            {input.trim() ? (
              <button
                type="button"
                onClick={handleSend}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-md active:scale-95 shrink-0"
                title="Send"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="p-2 text-[#8696a0] hover:text-[#00a884] rounded-full hover:bg-[#2a3942] transition-colors shrink-0"
                title="Record voice message"
              >
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
