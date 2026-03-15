import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check, X } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export default function ConnectionModal() {
  const { incomingRequest, acceptRequest, rejectRequest } = usePeer();

  return (
    <AnimatePresence>
      {incomingRequest && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={rejectRequest}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pointer-events-none"
          >
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text text-base">Connection request</p>
                  <p className="text-sm text-slate-500">Wants to connect with you</p>
                </div>
              </div>
              <p className="text-text font-medium mb-6 text-[15px] break-words">
                <span className="text-primary font-semibold">{incomingRequest?.fromDeviceName}</span> would like to start a chat.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={rejectRequest}
                  className="flex-1 min-h-[48px] py-3 rounded-xl border border-slate-200 text-slate-600 font-medium active:bg-slate-50 sm:hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 shrink-0" />
                  Reject
                </button>
                <button
                  onClick={acceptRequest}
                  className="flex-1 min-h-[48px] py-3 rounded-xl bg-primary text-white font-medium active:bg-primary/90 sm:hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors touch-manipulation"
                >
                  <Check className="w-5 h-5 shrink-0" />
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
