import { motion } from 'framer-motion';
import { FileUp, X } from 'lucide-react';

export default function FileUpload({ fileName, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl px-4 py-3 min-h-[52px] relative overflow-hidden"
      style={{
        background: '#1e1e1e',
        border: '1px solid rgba(225,6,0,0.2)',
      }}
    >
      {/* Animated background progress */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ background: '#e10600', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0.2 }}
      />

      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative"
        style={{
          background: 'rgba(225,6,0,0.1)',
          border: '1px solid rgba(225,6,0,0.2)',
        }}
      >
        <FileUp className="w-4 h-4" style={{ color: '#e10600' }} />
      </div>

      <div className="flex-1 min-w-0 relative">
        <p
          className="text-sm font-medium truncate mb-1.5"
          style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif' }}
        >
          {fileName}
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #e10600, #ff4d00)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p
          className="text-xs mt-1"
          style={{ color: 'rgba(225,6,0,0.7)', fontFamily: 'Orbitron, monospace', fontSize: '10px', letterSpacing: '0.05em' }}
        >
          TRANSMITTING {progress}%
        </p>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200 touch-manipulation relative"
          aria-label="Cancel"
          style={{ color: 'rgba(240,240,240,0.4)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e10600'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,240,240,0.4)'; }}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
}
