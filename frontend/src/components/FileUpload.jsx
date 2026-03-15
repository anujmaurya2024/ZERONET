import { motion } from 'framer-motion';
import { FileUp, X } from 'lucide-react';

export default function FileUpload({ fileName, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 min-h-[52px]"
    >
      <FileUp className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{fileName}</p>
        <div className="mt-1.5 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 active:text-slate-600 active:bg-slate-200 transition-colors touch-manipulation"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
}
