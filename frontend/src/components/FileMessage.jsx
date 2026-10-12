import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Download, Check, CheckCheck } from 'lucide-react';

export default function FileMessage({ message, isOwn, onDownload }) {
  const { fileName, fileSize, progress, status, blobUrl, dataUrl } = message;
  const isComplete = status === 'complete' || progress === 100 || !progress;

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'hh:mm a')
    : '';

  const handleDownload = () => {
    if (onDownload) {
      onDownload(message);
      return;
    }
    const url = blobUrl || dataUrl;
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formattedSize =
    fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${(fileSize / 1024).toFixed(1)} KB`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}
    >
      <div
        className="max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2.5"
        style={
          isOwn
            ? {
                background: '#005c4b',
                borderBottomRightRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
            : {
                background: '#202c33',
                borderBottomLeftRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
        }
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: isOwn ? 'rgba(255,255,255,0.12)' : 'rgba(0, 168, 132, 0.15)',
              border: isOwn ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0, 168, 132, 0.3)',
            }}
          >
            <FileText
              className="w-5 h-5"
              style={{ color: isOwn ? '#fff' : '#00a884' }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              style={{ color: '#e9edef' }}
            >
              {fileName}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: isOwn ? 'rgba(233,237,239,0.7)' : '#8696a0' }}
            >
              {formattedSize}
              {typeof progress === 'number' && progress < 100 && (
                <span> · {progress}%</span>
              )}
            </p>
          </div>

          {/* Download button */}
          {isComplete && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors shrink-0"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar if downloading/sending */}
        {typeof progress === 'number' && progress < 100 && (
          <div className="mt-2 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#25d366] h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Footer timestamp & checkmark */}
        <div className="flex items-center justify-end gap-1 mt-1.5 -mb-0.5">
          <span
            className="text-[11px]"
            style={{
              color: isOwn ? 'rgba(233, 237, 239, 0.65)' : 'rgba(134, 150, 160, 0.85)',
            }}
          >
            {formattedTime}
          </span>
          {isOwn && (
            <span className="inline-flex items-center">
              {isComplete ? (
                <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />
              ) : (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
