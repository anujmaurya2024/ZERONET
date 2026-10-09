import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div
        className="rounded-2xl rounded-bl px-4 py-3"
        style={{
          background: '#222222',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex gap-1.5 items-end">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="rounded-full"
              style={{ background: '#e10600', width: '6px', height: '6px', display: 'block' }}
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
