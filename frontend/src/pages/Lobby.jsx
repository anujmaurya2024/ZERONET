import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Wifi,
  Radio,
  Lock,
  Smartphone,
  Laptop,
  CheckCheck,
  Check,
  RefreshCw,
  Plus,
} from 'lucide-react';
import DeviceList from '../components/DeviceList';
import ChatWindow from '../components/ChatWindow';
import { useSocket } from '../context/SocketContext';
import { useDiscovery } from '../context/DiscoveryContext';
import { usePeer } from '../context/PeerContext';
import { useChatContext } from '../context/ChatContext';
import { getAvatarColor, getInitials } from '../utils/avatar';
import { format } from 'date-fns';

export default function Lobby() {
  const navigate = useNavigate();
  const { onlineDevices, connected } = useSocket();
  const { discoverServers, isScanning, serverUrl, setServerUrl, discoveredServers } = useDiscovery();
  const { peers, initiateConnection } = usePeer();
  const {
    chats,
    activePeerId,
    setActivePeerId,
    unreadCounts,
    getLastMessage,
    typingByPeer,
  } = useChatContext();

  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'range'
  const [searchQuery, setSearchQuery] = useState('');

  // Initial network discovery on mount
  useEffect(() => {
    discoverServers();
  }, [discoverServers]);

  // Listen for connection accepted event so initiator opens chat automatically
  useEffect(() => {
    const handleAccepted = (e) => {
      const peerId = e.detail?.peerId;
      if (peerId) {
        setActivePeerId(peerId);
        setActiveTab('chats');
        if (window.innerWidth < 768) {
          navigate(`/chat/${peerId}`);
        }
      }
    };
    window.addEventListener('zeronet:connection-accepted', handleAccepted);
    return () => {
      window.removeEventListener('zeronet:connection-accepted', handleAccepted);
    };
  }, [setActivePeerId, navigate]);

  // Devices in range (excluding self, matching search)
  const filteredDevices = useMemo(() => {
    return onlineDevices.filter((d) =>
      d.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deviceId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [onlineDevices, searchQuery]);

  // Recent chats list
  const recentChats = useMemo(() => {
    const allKnownPeerIds = new Set([
      ...Object.keys(chats),
      ...Object.keys(peers),
      ...onlineDevices.map((d) => d.deviceId),
    ]);

    const list = Array.from(allKnownPeerIds).map((peerId) => {
      const device = onlineDevices.find((d) => d.deviceId === peerId);
      const peer = peers[peerId];
      const name = peer?.name || device?.deviceName || peerId;
      const lastMsg = getLastMessage(peerId);
      const unread = unreadCounts[peerId] || 0;
      const isOnline = onlineDevices.some((d) => d.deviceId === peerId);
      const isTyping = !!typingByPeer[peerId];

      return {
        peerId,
        name,
        lastMsg,
        unread,
        isOnline,
        isTyping,
        timestamp: lastMsg?.timestamp || 0,
      };
    });

    // Filter only those that have messages, are currently online, or connected
    return list
      .filter((item) => item.lastMsg || item.isOnline || peers[item.peerId])
      .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [chats, peers, onlineDevices, getLastMessage, unreadCounts, typingByPeer, searchQuery]);

  const handleSelectChat = (peerId, peerName) => {
    setActivePeerId(peerId);
    if (!peers[peerId] || peers[peerId].status !== 'connected') {
      const dev = onlineDevices.find((d) => d.deviceId === peerId);
      if (dev) {
        initiateConnection(peerId, dev.deviceName, dev.socketId);
      }
    }
    if (window.innerWidth < 768) {
      navigate(`/chat/${peerId}`);
    }
  };

  const selectedPeer = activePeerId
    ? peers[activePeerId] || onlineDevices.find((d) => d.deviceId === activePeerId)
    : null;
  const selectedPeerName =
    selectedPeer?.name || selectedPeer?.deviceName || activePeerId;

  return (
    <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0b141a]">
      {/* LEFT SIDEBAR: Chats & Within-Range Radar */}
      <div
        className={`w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col h-full bg-[#111b21] border-r border-[rgba(134,150,160,0.15)] ${
          activePeerId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Navigation Tabs: Chats vs Within Range */}
        <div className="flex items-center px-3 pt-3 pb-2 gap-2 border-b border-[rgba(134,150,160,0.12)] bg-[#111b21]">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chats'
                ? 'bg-[#202c33] text-[#00a884] shadow-sm'
                : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chats</span>
            {recentChats.reduce((acc, c) => acc + c.unread, 0) > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#25d366] text-[#111b21] text-[11px] font-bold flex items-center justify-center">
                {recentChats.reduce((acc, c) => acc + c.unread, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('range')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'range'
                ? 'bg-[#202c33] text-[#00a884] shadow-sm'
                : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]/50'
            }`}
          >
            <Wifi className="w-4 h-4 text-[#25d366]" />
            <span>Within Range</span>
            {onlineDevices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#25d366]/20 text-[#25d366] text-[10px] font-bold">
                {onlineDevices.length}
              </span>
            )}
          </button>
        </div>

        {/* WhatsApp Search Bar */}
        <div className="p-3 bg-[#111b21]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#202c33] border border-transparent focus-within:border-[#00a884]/40 transition-colors">
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />
          </div>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {activeTab === 'range' ? (
            <div className="p-2">
              <DeviceList
                devices={filteredDevices}
                isScanning={isScanning}
                onScan={discoverServers}
                onSelectPeer={(peerId) => {
                  const dev = onlineDevices.find((d) => d.deviceId === peerId);
                  handleSelectChat(peerId, dev?.deviceName);
                }}
              />
            </div>
          ) : (
            <div>
              {recentChats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#202c33] flex items-center justify-center text-[#8696a0]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#e9edef] mb-1">
                    No conversations yet
                  </h3>
                  <p className="text-xs text-[#8696a0] max-w-xs mx-auto mb-4">
                    Switch to &ldquo;Within Range&rdquo; to discover nearby devices on your Wi-Fi network and start chatting.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('range')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-md active:scale-95"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    Find Devices in Range
                  </button>
                </div>
              ) : (
                recentChats.map((chat) => {
                  const avatarBg = getAvatarColor(chat.name);
                  const initials = getInitials(chat.name);
                  const isSelected = activePeerId === chat.peerId;
                  const timeStr = chat.lastMsg?.timestamp
                    ? format(new Date(chat.lastMsg.timestamp), 'hh:mm a')
                    : '';

                  return (
                    <div
                      key={chat.peerId}
                      onClick={() => handleSelectChat(chat.peerId, chat.name)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#2a3942]'
                          : 'hover:bg-[#202c33]'
                      }`}
                    >
                      {/* Avatar with online badge */}
                      <div className="relative shrink-0">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                          style={{ background: avatarBg }}
                        >
                          {initials}
                        </div>
                        {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#111b21]" />
                        )}
                      </div>

                      {/* Chat text snippet */}
                      <div className="flex-1 min-w-0 border-b border-[rgba(134,150,160,0.08)] pb-2.5">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-[15px] font-semibold text-[#e9edef] truncate">
                            {chat.name}
                          </h4>
                          {timeStr && (
                            <span
                              className={`text-[11px] shrink-0 ${
                                chat.unread > 0 ? 'text-[#25d366] font-semibold' : 'text-[#8696a0]'
                              }`}
                            >
                              {timeStr}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs text-[#8696a0] truncate">
                            {chat.isTyping ? (
                              <span className="text-[#25d366] font-medium animate-pulse">
                                typing...
                              </span>
                            ) : chat.lastMsg ? (
                              <>
                                {chat.lastMsg.isOwn && (
                                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                                )}
                                <span className="truncate">
                                  {chat.lastMsg.type === 'image'
                                    ? '📷 Photo'
                                    : chat.lastMsg.type === 'audio'
                                    ? '🎤 Voice note'
                                    : chat.lastMsg.type === 'file'
                                    ? `📁 ${chat.lastMsg.fileName || 'File'}`
                                    : chat.lastMsg.text}
                                </span>
                              </>
                            ) : (
                              <span className="text-[#8696a0]">Tap to start chat</span>
                            )}
                          </div>

                          {chat.unread > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#25d366] text-[#111b21] text-[11px] font-bold flex items-center justify-center shrink-0">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Active WhatsApp Conversation or Empty Welcome Screen */}
      <div className="flex-1 h-full min-h-0 flex flex-col bg-[#0b141a]">
        {activePeerId ? (
          <ChatWindow
            peerId={activePeerId}
            peerName={selectedPeerName}
            onBack={() => setActivePeerId(null)}
          />
        ) : (
          /* WhatsApp Web Default Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-[#111b21] border-b-[6px] border-[#00a884]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto flex flex-col items-center"
            >
              {/* WhatsApp Illustrated Icon */}
              <div className="w-24 h-24 mb-6 rounded-full bg-[#202c33] flex items-center justify-center text-[#00a884] shadow-xl relative">
                <div className="absolute inset-0 rounded-full border border-[#00a884]/20 wa-radar-pulse" />
                <MessageSquare className="w-12 h-12" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#e9edef] mb-3">
                ZeroNet WhatsApp
              </h1>

              <p className="text-sm text-[#8696a0] leading-relaxed mb-6">
                Send and receive messages, photos, voice notes, and documents across devices within local Wi-Fi range without internet connection.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('range')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-lg active:scale-95"
              >
                <Wifi className="w-4 h-4" />
                Scan Nearby Devices in Range
              </button>

              <div className="flex items-center gap-2 mt-12 text-xs text-[#8696a0]">
                <Lock className="w-3.5 h-3.5 text-[#00a884]" />
                <span>End-to-end local network communication. No cloud storage.</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
