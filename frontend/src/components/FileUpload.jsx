import { motion } from 'framer-motion';
import { FileUp, X } from 'lucide-react';

export default function FileUpload({ fileName, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 min-h-[50px] relative overflow-hidden"
      style={{
        background: '#202c33',
        border: '1px solid rgba(0, 168, 132, 0.25)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative"
        style={{
          background: 'rgba(0, 168, 132, 0.15)',
          border: '1px solid rgba(0, 168, 132, 0.3)',
        }}
      >
        <FileUp className="w-4 h-4 text-[#00a884]" />
      </div>

      <div className="flex-1 min-w-0 relative">
        <p className="text-xs font-medium truncate mb-1 text-[#e9edef]">
          {fileName}
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00a884, #25d366)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="text-[10px] mt-0.5 text-[#8696a0]">
          Sending {progress}%
        </p>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="p-1 rounded-full text-[#8696a0] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
