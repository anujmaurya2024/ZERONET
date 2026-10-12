import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Check, CheckCheck, Smile } from 'lucide-react';

const POPULAR_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageBubble({ message, isOwn, onReact }) {
  const [showReactions, setShowReactions] = useState(false);

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'hh:mm a')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Reaction quick picker bar on hover */}
      <AnimatePresence>
        {showReactions && onReact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: isOwn ? -8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: -34 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={`absolute z-30 flex items-center gap-1 px-2 py-1 rounded-full shadow-xl ${
              isOwn ? 'right-2' : 'left-2'
            }`}
            style={{
              background: '#202c33',
              border: '1px solid rgba(134, 150, 160, 0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {POPULAR_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowReactions(false);
                }}
                className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform duration-100 text-base"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative max-w-[85%] sm:max-w-[70%] rounded-xl px-3.5 py-2 transition-shadow"
        style={
          isOwn
            ? {
                background: '#005c4b',
                borderBottomRightRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
            : {
                background: '#202c33',
                borderBottomLeftRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
        }
      >
        {/* Hover trigger for reactions button */}
        {onReact && (
          <button
            type="button"
            onClick={() => setShowReactions((v) => !v)}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-gray-400 hover:text-white ${
              isOwn ? '-left-7' : '-right-7'
            }`}
            title="React"
          >
            <Smile className="w-4 h-4" />
          </button>
        )}

        {/* Message text */}
        <p
          className="text-[14.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words pr-2 select-text"
          style={{ color: '#e9edef', fontFamily: 'inherit' }}
        >
          {message.text}
        </p>

        {/* Footer: timestamp + status checkmarks */}
        <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 select-none">
          <span
            className="text-[11px]"
            style={{
              color: isOwn ? 'rgba(233, 237, 239, 0.65)' : 'rgba(134, 150, 160, 0.85)',
            }}
          >
            {formattedTime}
          </span>
          {isOwn && (
            <span className="inline-flex items-center">
              {message.status === 'sent' ? (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />
              )}
            </span>
          )}
        </div>

        {/* Reactions display underneath */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 ${isOwn ? 'right-2' : 'left-2'} flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs shadow-md z-10`}
            style={{
              background: '#182229',
              border: '1px solid rgba(134, 150, 160, 0.2)',
            }}
          >
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-xs">
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
