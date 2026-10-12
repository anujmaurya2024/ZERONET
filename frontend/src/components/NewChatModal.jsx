import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, UserPlus, Phone, Shield, Check, X, RefreshCw, UserCheck } from 'lucide-react';
import { usePhoneAuth } from '../context/PhoneAuthContext';
import { usePeer } from '../context/PeerContext';
import { useChatContext } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarColor, getInitials } from '../utils/avatar';

export default function NewChatModal({ isOpen, onClose, onSelectPeer }) {
  const { searchUsers, startDirectConversation, syncContacts, contacts } = usePhoneAuth();
  const { initiateConnection } = usePeer();
  const { setActivePeerId } = useChatContext();
  const { onlineDevices } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'contacts'

  // Contact sync manual add state
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(searchQuery.trim());
      setResults(res);
      setIsSearching(false);
      setHasSearched(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleStartChatWithUser = async (targetUser) => {
    const res = await startDirectConversation(targetUser.userId);
    if (res && res.conversationId) {
      // Check if user is currently online on WebSocket / local network
      const onlinePeer = onlineDevices.find((d) => d.deviceId === targetUser.userId);
      if (onlinePeer) {
        initiateConnection(targetUser.userId, targetUser.displayName, onlinePeer.socketId);
      }
      setActivePeerId(targetUser.userId);
      if (onSelectPeer) {
        onSelectPeer(targetUser.userId, targetUser.displayName);
      }
      onClose();
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactPhone.trim()) return;
    await syncContacts([{ name: newContactName.trim(), phoneNumber: newContactPhone.trim() }]);
    setNewContactName('');
    setNewContactPhone('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#00a884]/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] border-b border-[rgba(134,150,160,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#25d366] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#e9edef]">New Chat</h3>
                <p className="text-[11px] text-[#8696a0]">Find users by name or registered mobile number</p>
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

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[rgba(134,150,160,0.12)] bg-[#111b21] px-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'border-[#00a884] text-[#00a884]'
                  : 'border-transparent text-[#8696a0] hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search by Phone / Name</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'contacts'
                  ? 'border-[#00a884] text-[#00a884]'
                  : 'border-transparent text-[#8696a0] hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contacts ({contacts.length})</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {activeTab === 'search' && (
              <>
                {/* Search Bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#202c33] border border-[rgba(134,150,160,0.2)] focus-within:border-[#00a884] transition-colors">
                  <Search className="w-4 h-4 text-[#8696a0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or mobile number (e.g. +91 98765 43210)"
                    className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                    autoFocus
                  />
                  {isSearching && <RefreshCw className="w-4 h-4 text-[#00a884] animate-spin" />}
                </div>

                {/* Results List */}
                <div className="space-y-2">
                  {results.map((user) => (
                    <div
                      key={user.userId}
                      className="p-3 rounded-xl bg-[#202c33]/70 hover:bg-[#202c33] border border-[rgba(134,150,160,0.1)] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: getAvatarColor(user.displayName) }}
                        >
                          {getInitials(user.displayName)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#e9edef] truncate">{user.displayName}</h4>
                          <div className="flex items-center gap-2 text-xs text-[#8696a0]">
                            <span>{user.phoneNumber}</span>
                            {user.isContact && (
                              <span className="px-1.5 py-0.2 rounded bg-[#00a884]/20 text-[#25d366] text-[10px] font-semibold">
                                Contact
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartChatWithUser(user)}
                        className="py-1.5 px-3.5 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-colors shrink-0 shadow-md flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Start Chat</span>
                      </button>
                    </div>
                  ))}

                  {hasSearched && results.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-[#8696a0]">
                      <p className="text-sm">No matching user found.</p>
                      <p className="text-xs mt-1 text-[#8696a0]/70">
                        Make sure the user has registered and their privacy settings permit discovery.
                      </p>
                    </div>
                  )}

                  {!hasSearched && (
                    <div className="p-4 rounded-xl bg-[#202c33]/30 border border-[rgba(134,150,160,0.1)] text-xs text-[#8696a0] space-y-2">
                      <div className="flex items-center gap-1.5 text-[#e9edef] font-semibold">
                        <Shield className="w-3.5 h-3.5 text-[#00a884]" />
                        <span>Privacy-Preserving Search</span>
                      </div>
                      <p>
                        Type a full mobile number (e.g. <code>+91 98765 43210</code>) to directly discover registered users who have made themselves discoverable.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {/* Add Contact Form */}
                <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-[#202c33]/50 border border-[rgba(134,150,160,0.15)] space-y-2.5">
                  <span className="text-xs font-bold text-[#e9edef]">Add Contact to Check ZeroNet Registration</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name (e.g. Rahul)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#111b21] text-xs text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile (+919876543210)"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#111b21] text-xs text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newContactPhone.trim()}
                      className="py-2 px-4 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>

                {/* Contacts List */}
                <div className="space-y-2">
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#202c33]/70 border border-[rgba(134,150,160,0.1)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-[#e9edef]">{c.name}</h4>
                        <p className="text-xs text-[#8696a0]">{c.phoneNumber}</p>
                      </div>

                      {c.isRegistered ? (
                        <button
                          type="button"
                          onClick={() => handleStartChatWithUser({ userId: c.userId, displayName: c.name })}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#8696a0] italic">Not on ZeroNet</span>
                      )}
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <p className="text-center py-6 text-xs text-[#8696a0]">
                      No contacts added yet. Add a phone number above to discover if they are registered on ZeroNet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
