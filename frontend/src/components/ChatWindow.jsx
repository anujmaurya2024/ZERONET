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
      <div className="flex-1 flex items-center justify-center px-4 text-slate-500 text-center">
        <p className="text-sm sm:text-base max-w-[280px]">Waiting for connection... Ask the other device to accept.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-4 space-y-3 overscroll-contain">
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

      {currentUpload && (
        <div className="shrink-0 px-4 pb-2 bg-background">
          <FileUpload
            fileName={currentUpload.fileName}
            progress={currentUpload.progress || 0}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 sticky bottom-0 left-0 right-0 border-t border-slate-200 bg-white pt-3 px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 active:bg-slate-50 sm:hover:bg-slate-50 active:text-primary transition-colors touch-manipulation"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping(true);
            }}
            onBlur={() => sendTyping(false)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-slate-200 px-4 py-3 text-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
          />
          <button
            type="submit"
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-primary text-white active:bg-primary/90 sm:hover:bg-primary/90 transition-colors touch-manipulation"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
