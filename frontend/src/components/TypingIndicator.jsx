import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start my-1"
    >
      <div
        className="rounded-xl px-3.5 py-2.5 flex items-center gap-1.5"
        style={{
          background: '#202c33',
          borderBottomLeftRadius: '3px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <span className="text-xs mr-1 text-[#8696a0] font-normal">typing</span>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="rounded-full"
              style={{ background: '#25d366', width: '5px', height: '5px', display: 'block' }}
              animate={{
                y: [0, -4, 0],
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 0.65,
                repeat: Infinity,
                delay: i * 0.16,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
