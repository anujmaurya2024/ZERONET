import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';
import { getDefaultServerUrl } from '../utils/discovery';

const TranslationContext = createContext(null);

const STORAGE_SETTINGS_KEY = 'zeronet_language_settings_v1';
const STORAGE_TRANSLATIONS_KEY = 'zeronet_cached_translations_v1';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

function loadLocalSettings() {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

const defaultSettings = {
  preferredDisplayLanguage: 'en',
  preferredIncomingLanguage: 'en',
  defaultOutgoingLanguage: 'hi',
  autoTranslateIncoming: true,
  autoDetectLanguage: true,
  explainTechnicalTerms: true,
  displayPreference: 'BOTH', // 'BOTH', 'TRANSLATED_ONLY', 'ORIGINAL_ONLY'
};

export function TranslationProvider({ children }) {
  const { deviceId } = useSocket();
  const [settings, setSettings] = useState(loadLocalSettings);
  const [translations, setTranslations] = useState({}); // key: `${msgId}_${targetLang}` -> { translatedText, provider, status }
  const [explanations, setExplanations] = useState({}); // key: `${msgId}_${targetLang}` -> { terms: [], summary: "" }
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState(null); // { messageText, explanationData, targetLang }
  
  const serverUrl = getDefaultServerUrl();

  // Load user settings from backend on mount
  useEffect(() => {
    if (!deviceId) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/users/me/language-settings`, {
          headers: {
            'X-Device-Id': deviceId,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
          localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify({ ...settings, ...data }));
        }
      } catch (err) {
        console.debug('Failed to sync language settings with backend, using local:', err);
      }
    };
    fetchSettings();
  }, [deviceId, serverUrl]);

  // Update language settings
  const updateSettings = useCallback(
    async (newValues) => {
      const updated = { ...settings, ...newValues };
      setSettings(updated);
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
        await fetch(`${serverUrl}/api/users/me/language-settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId || 'default-user',
          },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.debug('Error persisting language settings to backend:', err);
      }
    },
    [settings, serverUrl, deviceId]
  );

  // Preview translation for outgoing message draft
  const previewTranslation = useCallback(
    async (text, sourceLang, targetLang) => {
      if (!text || !text.trim()) return null;
      try {
        const res = await fetch(`${serverUrl}/api/translations/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            sourceLanguage: sourceLang || 'auto',
            targetLanguage: targetLang || settings.defaultOutgoingLanguage,
          }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error('Translation preview error:', err);
      }
      return null;
    },
    [serverUrl, settings.defaultOutgoingLanguage]
  );

  // Translate a specific message
  const translateMessage = useCallback(
    async (messageId, originalText, sourceLang, targetLang) => {
      const target = targetLang || settings.preferredIncomingLanguage;
      const cacheKey = `${messageId}_${target}`;

      if (translations[cacheKey]?.status === 'success') {
        return translations[cacheKey];
      }

      // Mark loading
      setTranslations((prev) => ({
        ...prev,
        [cacheKey]: { status: 'loading', translatedText: null },
      }));

      try {
        const res = await fetch(`${serverUrl}/api/messages/${messageId}/translations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLanguage: target,
            originalContent: originalText,
            originalLanguage: sourceLang || 'auto',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const result = {
            status: 'success',
            translatedText: data.translatedContent,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage,
            provider: data.translationProvider,
          };
          setTranslations((prev) => ({ ...prev, [cacheKey]: result }));
          return result;
        } else {
          setTranslations((prev) => ({
            ...prev,
            [cacheKey]: { status: 'error', error: 'Translation unavailable' },
          }));
        }
      } catch (err) {
        console.warn('Translation call failed, using fallback:', err);
        setTranslations((prev) => ({
          ...prev,
          [cacheKey]: { status: 'error', error: 'Network error during translation' },
        }));
      }
      return null;
    },
    [serverUrl, settings.preferredIncomingLanguage, translations]
  );

  // AI Technical term explanation
  const explainTerms = useCallback(
    async (messageId, content, targetLang) => {
      const target = targetLang || settings.preferredIncomingLanguage;
      const cacheKey = `${messageId}_${target}`;

      if (explanations[cacheKey]) {
        setActiveExplanation({
          messageText: content,
          explanationData: explanations[cacheKey],
          targetLang: target,
        });
        return explanations[cacheKey];
      }

      try {
        const res = await fetch(`${serverUrl}/api/messages/${messageId}/explanations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            targetLanguage: target,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setExplanations((prev) => ({ ...prev, [cacheKey]: data }));
          setActiveExplanation({
            messageText: content,
            explanationData: data,
            targetLang: target,
          });
          return data;
        }
      } catch (err) {
        console.error('Explanation request failed:', err);
      }
      return null;
    },
    [serverUrl, settings.preferredIncomingLanguage, explanations]
  );

  const value = {
    settings,
    updateSettings,
    translations,
    translateMessage,
    previewTranslation,
    explainTerms,
    activeExplanation,
    setActiveExplanation,
    isSettingsOpen,
    setIsSettingsOpen,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used within TranslationProvider');
  return ctx;
}
