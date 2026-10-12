import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Wifi, Edit2, Check, X, Shield, RefreshCw, Languages, Smartphone, Lock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/TranslationContext';
import { usePhoneAuth } from '../context/PhoneAuthContext';
import { getAvatarColor, getInitials } from '../utils/avatar';

export default function Navbar() {
  const { deviceName, updateDeviceName, connected } = useSocket();
  const { isScanning, discoverServers, serverUrl } = useDiscovery();
  const { settings, setIsSettingsOpen } = useTranslation();
  const { phoneStatus, setIsPhoneModalOpen, setIsPrivacyModalOpen } = usePhoneAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(deviceName);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateDeviceName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const avatarColor = getAvatarColor(deviceName);
  const initials = getInitials(deviceName);

  return (
    <>
      <header
        className="sticky top-0 z-40 shrink-0 w-full"
        style={{
          background: '#202c33',
          borderBottom: '1px solid rgba(134, 150, 160, 0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00a884, #25d366)',
              }}
            >
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-[#e9edef] tracking-tight">
                  ZeroNet
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#00a884]/20 text-[#25d366]">
                  Local
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0] -mt-0.5 hidden xs:block">
                Offline WhatsApp Chat
              </p>
            </div>
          </Link>

          {/* Right: User Profile & In-Range Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live in-range connection status */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{
                background: connected ? 'rgba(37, 211, 102, 0.1)' : 'rgba(134, 150, 160, 0.1)',
                border: `1px solid ${connected ? 'rgba(37, 211, 102, 0.25)' : 'rgba(134, 150, 160, 0.2)'}`,
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-[#25d366] shadow-[0_0_8px_#25d366]' : 'bg-[#8696a0]'
                }`}
              />
              <span className="font-medium text-xs hidden sm:inline" style={{ color: connected ? '#25d366' : '#8696a0' }}>
                {connected ? 'Within Range' : 'Connecting'}
              </span>
            </div>

            {/* Translation & Language Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#111b21] hover:bg-[#2a3942] border border-[rgba(0,168,132,0.3)] text-[#25d366] transition-colors cursor-pointer group"
              title="Translation & Multilingual Settings"
            >
              <Languages className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold text-[#e9edef] uppercase tracking-wider">
                {settings?.preferredIncomingLanguage || 'EN'}
              </span>
            </button>

            {/* Mobile Number Verification Button */}
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                phoneStatus.isVerified
                  ? 'bg-[#00a884]/15 border-[#25d366]/40 text-[#25d366]'
                  : 'bg-[#111b21] hover:bg-[#2a3942] border-[rgba(134,150,160,0.2)] text-[#8696a0] hover:text-[#e9edef]'
              }`}
              title={phoneStatus.isVerified ? `Verified: ${phoneStatus.phoneNumberE164}` : 'Link your mobile number for WhatsApp-style discovery'}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
                {phoneStatus.isVerified ? phoneStatus.phoneNumberE164 : 'Link Phone'}
              </span>
              {phoneStatus.isVerified && <Check className="w-3 h-3 text-[#25d366]" />}
            </button>

            {/* Privacy Settings Button */}
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="p-1.5 rounded-full bg-[#111b21] hover:bg-[#2a3942] border border-[rgba(134,150,160,0.15)] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
              title="Privacy & Discovery Settings"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* User Profile Chip (Click to Edit Name) */}
            <button
              type="button"
              onClick={() => {
                setNameInput(deviceName);
                setIsEditingName(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#111b21] hover:bg-[#2a3942] border border-[rgba(134,150,160,0.15)] transition-colors group cursor-pointer text-left"
              title="Click to edit your display name"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ background: avatarColor }}
              >
                {initials}
              </div>
              <span className="text-xs font-semibold text-[#e9edef] max-w-[100px] sm:max-w-[140px] truncate">
                {deviceName}
              </span>
              <Edit2 className="w-3 h-3 text-[#8696a0] group-hover:text-[#00a884] transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Edit Profile Name Modal */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl p-6 bg-[#111b21] border border-[rgba(0,168,132,0.3)] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#e9edef]">Edit Your Name</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="p-1 rounded-full text-[#8696a0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#8696a0] mb-4">
                This name will appear to all nearby devices within range on your local network.
              </p>

              <form onSubmit={handleSaveName}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={30}
                  autoFocus
                  placeholder="e.g., Anjali's Phone"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none mb-4 text-sm"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[#202c33] text-[#8696a0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-sm font-bold bg-[#00a884] text-white hover:bg-[#008069] shadow-md"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
