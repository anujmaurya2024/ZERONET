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
        className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3"
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
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(225,6,0,0.12)',
              border: isOwn ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(225,6,0,0.2)',
            }}
          >
            <FileText
              className="w-5 h-5"
              style={{ color: isOwn ? '#fff' : '#e10600' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              style={{ color: isOwn ? '#fff' : '#f0f0f0', fontFamily: 'Inter, sans-serif' }}
            >
              {fileName}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: isOwn ? 'rgba(255,255,255,0.65)' : 'rgba(240,240,240,0.45)', fontFamily: 'Inter, monospace' }}
            >
              {(fileSize / 1024).toFixed(1)} KB
              {typeof progress === 'number' && (
                <span> · {progress}%</span>
              )}
            </p>

            {/* Progress bar */}
            {typeof progress === 'number' && progress < 100 && (
              <div
                className="mt-2 h-1 rounded-full overflow-hidden"
                style={{ background: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isOwn ? '#fff' : '#e10600' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {isComplete && onDownload && (
              <button
                onClick={() => onDownload(message)}
                className="mt-2 py-2 -mb-1 min-h-[44px] flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase touch-manipulation transition-all"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  color: isOwn ? 'rgba(255,255,255,0.9)' : '#00d2ff',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD
              </button>
            )}
            {isComplete && !onDownload && (
              <p
                className="mt-1.5 flex items-center gap-1 text-xs"
                style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'rgba(57,255,20,0.8)', fontFamily: 'Orbitron, monospace', fontSize: '10px' }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                SENT
              </p>
            )}
          </div>
        </div>
        <p
          className="text-xs mt-2"
          style={{
            color: isOwn ? 'rgba(255,255,255,0.55)' : 'rgba(240,240,240,0.35)',
            fontFamily: 'Inter, monospace',
          }}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}
