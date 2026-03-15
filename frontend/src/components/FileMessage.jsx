import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Download, CheckCircle } from 'lucide-react';

export default function FileMessage({ message, isOwn, onDownload }) {
  const { fileName, fileSize, progress, status } = message;
  const isComplete = status === 'complete' || progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isOwn
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-slate-100 text-text rounded-bl-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 shrink-0 opacity-80" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs opacity-80">
              {(fileSize / 1024).toFixed(1)} KB
              {typeof progress === 'number' && (
                <span> · {progress}%</span>
              )}
            </p>
            {isComplete && onDownload && (
              <button
                onClick={() => onDownload(message)}
                className="mt-2 py-2 -mb-1 min-h-[44px] flex items-center gap-1.5 text-sm font-medium active:underline sm:hover:underline touch-manipulation"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            )}
            {isComplete && !onDownload && (
              <p className="mt-1 flex items-center gap-1 text-xs opacity-80">
                <CheckCircle className="w-3.5 h-3.5" />
                Received
              </p>
            )}
          </div>
        </div>
        <p className={`text-xs mt-2 ${isOwn ? 'text-white/80' : 'text-slate-400'}`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}
