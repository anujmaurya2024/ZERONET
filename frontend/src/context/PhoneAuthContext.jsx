import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { getDefaultServerUrl } from '../utils/discovery';

const PhoneAuthContext = createContext(null);

export const COUNTRY_CODES = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
];

export function PhoneAuthProvider({ children }) {
  const { deviceId, deviceName } = useSocket();
  const serverUrl = getDefaultServerUrl();

  const [phoneStatus, setPhoneStatus] = useState({
    isVerified: false,
    phoneNumberE164: null,
    countryCode: '+91',
    displayName: null,
  });

  const [privacySettings, setPrivacySettings] = useState({
    discoveryVisibility: 'EVERYONE',
    phoneVisibility: 'CONTACTS',
    allowContactDiscovery: true,
    allowMessageRequests: true,
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Fetch current phone status
  const fetchPhoneStatus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`${serverUrl}/api/users/me/phone`, {
        headers: { 'X-Device-Id': deviceId },
      });
      if (res.ok) {
        const data = await res.json();
        setPhoneStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch phone status:', err);
    }
  }, [serverUrl, deviceId]);

  // Fetch privacy settings
  const fetchPrivacySettings = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`${serverUrl}/api/users/me/privacy-settings`, {
        headers: { 'X-Device-Id': deviceId },
      });
      if (res.ok) {
        const data = await res.json();
        setPrivacySettings(data);
      }
    } catch (err) {
      console.warn('Could not fetch privacy settings:', err);
    }
  }, [serverUrl, deviceId]);

  // Fetch blocked users
  const fetchBlockedUsers = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`${serverUrl}/api/users/blocks`, {
        headers: { 'X-Device-Id': deviceId },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data || []);
      }
    } catch (err) {
      console.warn('Could not fetch blocked users:', err);
    }
  }, [serverUrl, deviceId]);

  useEffect(() => {
    fetchPhoneStatus();
    fetchPrivacySettings();
    fetchBlockedUsers();
  }, [fetchPhoneStatus, fetchPrivacySettings, fetchBlockedUsers]);

  // Send OTP
  const sendOtp = async (phoneNumber, countryCode = 'IN') => {
    try {
      const res = await fetch(`${serverUrl}/api/users/me/phone/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ phoneNumber, defaultCountryCode: countryCode }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Network error connecting to phone server' };
    }
  };

  // Verify OTP
  const verifyOtp = async (phoneNumber, otp, name = deviceName) => {
    try {
      const res = await fetch(`${serverUrl}/api/users/me/phone/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ phoneNumber, otp, displayName: name }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPhoneStatus();
      }
      return data;
    } catch (err) {
      return { success: false, message: 'Network error verifying OTP' };
    }
  };

  // Unlink Phone
  const unlinkPhone = async () => {
    try {
      const res = await fetch(`${serverUrl}/api/users/me/phone`, {
        method: 'DELETE',
        headers: { 'X-Device-Id': deviceId },
      });
      const data = await res.json();
      if (data.success) {
        setPhoneStatus({ isVerified: false, phoneNumberE164: null, countryCode: '+91', displayName: null });
      }
      return data;
    } catch (err) {
      return { success: false };
    }
  };

  // Search users by phone number or name
  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(`${serverUrl}/api/users/search?query=${encodeURIComponent(query.trim())}`, {
        headers: { 'X-Device-Id': deviceId },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Search users failed:', err);
    }
    return [];
  };

  // Start or retrieve direct conversation
  const startDirectConversation = async (targetUserId) => {
    try {
      const res = await fetch(`${serverUrl}/api/conversations/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ targetUserId }),
      });
      return await res.json();
    } catch (err) {
      return { error: 'Failed to initiate direct conversation' };
    }
  };

  // Update Privacy Settings
  const updatePrivacy = async (newSettings) => {
    try {
      const res = await fetch(`${serverUrl}/api/users/me/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setPrivacySettings(data);
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Update privacy failed:', err);
    }
    return { success: false };
  };

  // Block user
  const blockUser = async (targetUserId, reason = '') => {
    try {
      const res = await fetch(`${serverUrl}/api/users/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ targetUserId, reason }),
      });
      if (res.ok) {
        fetchBlockedUsers();
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Unblock user
  const unblockUser = async (targetUserId) => {
    try {
      const res = await fetch(`${serverUrl}/api/users/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        fetchBlockedUsers();
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Sync Contacts
  const syncContacts = async (contactList) => {
    try {
      const res = await fetch(`${serverUrl}/api/contacts/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ contacts: contactList }),
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        return data;
      }
    } catch (err) {}
    return [];
  };

  const value = {
    phoneStatus,
    fetchPhoneStatus,
    sendOtp,
    verifyOtp,
    unlinkPhone,
    searchUsers,
    startDirectConversation,
    privacySettings,
    updatePrivacy,
    blockedUsers,
    blockUser,
    unblockUser,
    contacts,
    syncContacts,
    isPhoneModalOpen,
    setIsPhoneModalOpen,
    isNewChatModalOpen,
    setIsNewChatModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
  };

  return (
    <PhoneAuthContext.Provider value={value}>
      {children}
    </PhoneAuthContext.Provider>
  );
}

export function usePhoneAuth() {
  const ctx = useContext(PhoneAuthContext);
  if (!ctx) throw new Error('usePhoneAuth must be used within PhoneAuthProvider');
  return ctx;
}
