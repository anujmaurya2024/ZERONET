import { useRef, useEffect, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import FileMessage from './FileMessage';
import TypingIndicator from './TypingIndicator';
import FileUpload from './FileUpload';
import { useChat } from '../hooks/useChat';

export default function ChatWindow({ peerId, peerName }) {
  const {
    messages,
    typing,
    sendMessage,
    sendTyping,
    sendFile,
    downloadFile,
    isConnected,
  } = useChat(peerId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUpload = messages.find((m) => m.type === 'file' && m.isOwn && m.status === 'sending');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && isConnected) sendFile(file);
    e.target.value = '';
  };

  if (!isConnected) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4"
        style={{ background: '#0a0a0a' }}
      >
        {/* Waiting animation */}
        <div className="flex gap-1.5 mb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: '#e10600',
                animation: `scan-line ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div>
          <p
            className="text-sm font-bold tracking-widest uppercase mb-1"
            style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(240,240,240,0.7)' }}
          >
            AWAITING CONNECTION
          </p>
          <p
            className="text-xs max-w-[260px]"
            style={{ color: 'rgba(240,240,240,0.35)', fontFamily: 'Inter, sans-serif' }}
          >
            Waiting for the other driver to accept your request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ background: '#0a0a0a' }}
    >
      {/* Messages area */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-3 overscroll-contain"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(225,6,0,0.03) 0%, transparent 60%)',
        }}
      >
        {messages.map((msg, i) =>
          msg.type === 'text' ? (
            <MessageBubble key={i} message={msg} isOwn={msg.isOwn} />
          ) : (
            <FileMessage
              key={i}
              message={msg}
              isOwn={msg.isOwn}
              onDownload={msg.isOwn ? undefined : downloadFile}
            />
          )
        )}
        {typing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* File upload progress */}
      {currentUpload && (
        <div
          className="shrink-0 px-4 pb-2"
          style={{ background: '#121212' }}
        >
          <FileUpload
            fileName={currentUpload.fileName}
            progress={currentUpload.progress || 0}
          />
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 sticky bottom-0 left-0 right-0 pt-3 px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          background: 'rgba(16,16,16,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex gap-2 items-center">
          {/* File input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation active:scale-95"
            aria-label="Attach file"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(240,240,240,0.5)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.35)'; e.currentTarget.style.color = '#e10600'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(240,240,240,0.5)'; }}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping(true);
            }}
            placeholder="Team radio message..."
            className="flex-1 min-w-0 min-h-[44px] rounded-xl px-4 py-3 text-base focus:outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f0f0',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(225,6,0,0.4)';
              e.target.style.boxShadow = '0 0 0 2px rgba(225,6,0,0.12)';
            }}
            onBlur={e => {
              sendTyping(false);
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Send button */}
          <button
            type="submit"
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation active:scale-95"
            aria-label="Send"
            style={{
              background: 'linear-gradient(135deg, #e10600, #a80400)',
              boxShadow: '0 0 12px rgba(225,6,0,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(225,6,0,0.45)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px rgba(225,6,0,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
