import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Check, Lock, Eye, UserX, AlertCircle } from 'lucide-react';
import { usePhoneAuth } from '../context/PhoneAuthContext';

export default function PrivacySettingsModal({ isOpen, onClose }) {
  const { privacySettings, updatePrivacy, blockedUsers, unblockUser } = usePhoneAuth();

  const [discoveryVisibility, setDiscoveryVisibility] = useState(privacySettings.discoveryVisibility || 'EVERYONE');
  const [phoneVisibility, setPhoneVisibility] = useState(privacySettings.phoneVisibility || 'CONTACTS');
  const [allowContactDiscovery, setAllowContactDiscovery] = useState(privacySettings.allowContactDiscovery ?? true);
  const [allowMessageRequests, setAllowMessageRequests] = useState(privacySettings.allowMessageRequests ?? true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    await updatePrivacy({
      discoveryVisibility,
      phoneVisibility,
      allowContactDiscovery,
      allowMessageRequests,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#00a884]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] border-b border-[rgba(134,150,160,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#25d366] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#e9edef]">Privacy Settings</h3>
                <p className="text-[11px] text-[#8696a0]">Control discovery, phone visibility & security</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 flex-1 overflow-y-auto space-y-5">
            {/* 1. Who can find me by mobile number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#e9edef] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Who can find me by my mobile number?</span>
              </label>
              <p className="text-[11px] text-[#8696a0]">
                Choose who can discover your profile when searching for your phone number.
              </p>
              <select
                value={discoveryVisibility}
                onChange={(e) => setDiscoveryVisibility(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#202c33] text-sm text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
              >
                <option value="EVERYONE">Everyone (Public Discovery)</option>
                <option value="CONTACTS">My Contacts Only</option>
                <option value="NOBODY">Nobody (Hidden from Search)</option>
              </select>
            </div>

            {/* 2. Who can see my phone number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#e9edef] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Who can see my phone number in chats?</span>
              </label>
              <p className="text-[11px] text-[#8696a0]">
                If hidden, your number is masked (e.g. <code>+91 98765 ***10</code>).
              </p>
              <select
                value={phoneVisibility}
                onChange={(e) => setPhoneVisibility(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#202c33] text-sm text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
              >
                <option value="CONTACTS">My Contacts Only</option>
                <option value="EVERYONE">Everyone</option>
                <option value="NOBODY">Nobody (Always Masked)</option>
              </select>
            </div>

            {/* 3. Toggles */}
            <div className="space-y-3 pt-2 border-t border-[rgba(134,150,160,0.12)]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#e9edef] block">Allow Contact Discovery</span>
                  <span className="text-[11px] text-[#8696a0] block">Allow contacts to see when you join ZeroNet</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowContactDiscovery}
                  onChange={(e) => setAllowContactDiscovery(e.target.checked)}
                  className="w-4 h-4 accent-[#00a884]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#e9edef] block">Allow Message Requests</span>
                  <span className="text-[11px] text-[#8696a0] block">Allow new direct chats from registered users</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowMessageRequests}
                  onChange={(e) => setAllowMessageRequests(e.target.checked)}
                  className="w-4 h-4 accent-[#00a884]"
                />
              </label>
            </div>

            {/* 4. Blocked Users */}
            <div className="space-y-2 pt-2 border-t border-[rgba(134,150,160,0.12)]">
              <span className="text-xs font-bold text-[#e9edef] flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-red-400" />
                <span>Blocked Users ({blockedUsers.length})</span>
              </span>

              {blockedUsers.length === 0 ? (
                <p className="text-xs text-[#8696a0] italic">No blocked users.</p>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {blockedUsers.map((b) => (
                    <div
                      key={b.id}
                      className="p-2 rounded-lg bg-[#202c33] flex items-center justify-between text-xs text-[#e9edef]"
                    >
                      <span className="truncate max-w-[200px]">{b.blockedUserId}</span>
                      <button
                        type="button"
                        onClick={() => unblockUser(b.blockedUserId)}
                        className="text-red-400 hover:underline text-[11px]"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#202c33] text-[#8696a0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] shadow-md flex items-center justify-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
