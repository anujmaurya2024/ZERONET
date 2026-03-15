import { motion } from 'framer-motion';
import { FileUp, X } from 'lucide-react';

export default function FileUpload({ fileName, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3"
    >
      <FileUp className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{fileName}</p>
        <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
