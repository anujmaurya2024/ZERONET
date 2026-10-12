import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Check, CheckCheck, X, Download } from 'lucide-react';

export default function ImageMessage({ message, isOwn, onReact }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'hh:mm a')
    : '';

  const imageUrl = message.dataUrl || message.blobUrl;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}
      >
        <div
          className="relative max-w-[85%] sm:max-w-[70%] rounded-xl p-1 overflow-hidden"
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
          {/* Image Thumbnail */}
          <div
            className="rounded-lg overflow-hidden cursor-pointer max-h-72 relative bg-black/30 group"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={imageUrl}
              alt={message.fileName || 'Photo'}
              className="w-full h-full object-cover rounded-lg group-hover:scale-[1.02] transition-transform duration-200"
              loading="lazy"
            />
          </div>

          {/* Caption if present */}
          {message.caption && (
            <p className="px-2 pt-1.5 pb-0.5 text-sm text-[#e9edef] whitespace-pre-wrap">
              {message.caption}
            </p>
          )}

          {/* Footer timestamp & checkmark */}
          <div className="flex items-center justify-end gap-1 px-2 pt-1 pb-0.5">
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
                {message.status === 'sent' ? (
                  <Check className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />
                )}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <a
                href={imageUrl}
                download={message.fileName || 'photo.png'}
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={imageUrl}
              alt={message.fileName || 'Full photo'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
