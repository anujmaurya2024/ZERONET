import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:py-2.5 ${
          isOwn
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-slate-100 text-text rounded-bl-md'
        }`}
      >
        <p className="text-[15px] sm:text-sm leading-snug whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={`text-xs mt-1.5 ${
            isOwn ? 'text-white/80' : 'text-slate-400'
          }`}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}
