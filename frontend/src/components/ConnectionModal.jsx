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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text">Connection request</p>
                  <p className="text-sm text-slate-500">Wants to connect with you</p>
                </div>
              </div>
              <p className="text-text font-medium mb-6">
                <span className="text-primary">{incomingRequest?.fromDeviceName}</span> would like to start a chat.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={rejectRequest}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={acceptRequest}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
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
