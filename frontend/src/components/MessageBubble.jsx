import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:py-2.5 relative"
        style={
          isOwn
            ? {
                background: 'linear-gradient(135deg, #e10600, #a80400)',
                borderBottomRightRadius: '4px',
                boxShadow: '0 2px 12px rgba(225,6,0,0.2)',
              }
            : {
                background: '#222222',
                border: '1px solid rgba(255,255,255,0.07)',
                borderBottomLeftRadius: '4px',
              }
        }
      >
        {/* Own message: left accent bar */}
        {isOwn && (
          <div
            className="absolute top-2 bottom-2 right-0 w-0.5 rounded-l"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          />
        )}
        <p
          className="text-[15px] sm:text-sm leading-snug whitespace-pre-wrap break-words"
          style={{ color: isOwn ? '#fff' : '#f0f0f0', fontFamily: 'Inter, sans-serif' }}
        >
          {message.text}
        </p>
        <p
          className="text-xs mt-1.5"
          style={{
            color: isOwn ? 'rgba(255,255,255,0.6)' : 'rgba(240,240,240,0.35)',
            fontFamily: 'Inter, monospace',
          }}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}
