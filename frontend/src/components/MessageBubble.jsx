import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Check,
  CheckCheck,
  Smile,
  Globe,
  Sparkles,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/TranslationContext';

const POPULAR_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageBubble({ message, isOwn, onReact }) {
  const { settings, translations, translateMessage, explainTerms } = useTranslation();

  const [showReactions, setShowReactions] = useState(false);
  const [showOriginalOverride, setShowOriginalOverride] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'hh:mm a')
    : '';

  const targetLang = settings.preferredIncomingLanguage || 'en';
  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  const cacheKey = `${message.id}_${targetLang}`;
  const translationInfo = translations[cacheKey];

  // Auto-translate incoming message if enabled
  useEffect(() => {
    if (!isOwn && settings.autoTranslateIncoming && message.text) {
      if (!translationInfo) {
        translateMessage(message.id, message.text, message.sourceLanguage, targetLang);
      }
    }
  }, [isOwn, settings.autoTranslateIncoming, message.id, message.text, message.sourceLanguage, targetLang, translationInfo, translateMessage]);

  const handleManualTranslate = (e) => {
    e.stopPropagation();
    translateMessage(message.id, message.text, message.sourceLanguage, targetLang);
  };

  const handleExplain = (e) => {
    e.stopPropagation();
    explainTerms(message.id, message.text, targetLang);
  };

  const handleCopy = (textToCopy) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isTranslatedAvailable = translationInfo?.status === 'success' && translationInfo.translatedText;
  const isTranslating = translationInfo?.status === 'loading';
  const isTranslationError = translationInfo?.status === 'error';

  // Determine what to display based on user preferences
  const displayPreference = settings.displayPreference || 'BOTH';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex ${isOwn ? 'justify-end' : 'justify-start'} my-1.5`}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Quick Emoji Reaction Picker */}
      <AnimatePresence>
        {showReactions && onReact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: -34 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={`absolute z-30 flex items-center gap-1 px-2 py-1 rounded-full shadow-xl ${
              isOwn ? 'right-2' : 'left-2'
            }`}
            style={{
              background: '#202c33',
              border: '1px solid rgba(134, 150, 160, 0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {POPULAR_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowReactions(false);
                }}
                className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform duration-100 text-base"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative max-w-[88%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 transition-shadow"
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
        {/* React trigger icon on hover */}
        {onReact && (
          <button
            type="button"
            onClick={() => setShowReactions((v) => !v)}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-gray-400 hover:text-white ${
              isOwn ? '-left-7' : '-right-7'
            }`}
            title="React"
          >
            <Smile className="w-4 h-4" />
          </button>
        )}

        {/* --- MAIN MESSAGE TEXT CONTENT --- */}
        {displayPreference === 'TRANSLATED_ONLY' && isTranslatedAvailable && !showOriginalOverride ? (
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#25d366] mb-1 font-medium select-none">
              <Globe className="w-3 h-3" />
              <span>Translated to {targetLangObj?.name || targetLang}</span>
            </div>
            <p className="text-[14.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words pr-2 text-[#e9edef] select-text">
              {translationInfo.translatedText}
            </p>
          </div>
        ) : (
          <div>
            {/* Original Text */}
            <p className="text-[14.5px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words pr-2 text-[#e9edef] select-text">
              {message.text}
            </p>

            {/* Translated block beneath if BOTH mode or if user expanded */}
            {isTranslatedAvailable && (
              <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.12)]">
                <div className="flex items-center justify-between gap-1 text-[11px] text-[#25d366] mb-1 font-medium select-none">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Translated to {targetLangObj?.name || targetLang}
                  </span>
                  <span className="text-[10px] text-[#8696a0] font-normal">
                    {translationInfo.provider || 'AI'}
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-[#d1d7db] select-text font-sans">
                  {translationInfo.translatedText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Translation Loading indicator */}
        {isTranslating && (
          <div className="mt-2 pt-1.5 border-t border-[rgba(255,255,255,0.1)] flex items-center gap-2 text-xs text-[#8696a0]">
            <RefreshCw className="w-3 h-3 animate-spin text-[#25d366]" />
            <span>Translating to {targetLangObj?.name || targetLang}...</span>
          </div>
        )}

        {/* Translation Error & Retry indicator */}
        {isTranslationError && (
          <div className="mt-2 pt-1.5 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between text-xs text-amber-400/90">
            <span>Translation unavailable</span>
            <button
              type="button"
              onClick={handleManualTranslate}
              className="underline text-xs hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Footer Bar: Actions, Timestamp & Delivery Checkmarks */}
        <div className="flex items-center justify-between gap-3 mt-1.5 -mb-0.5 pt-1 border-t border-transparent select-none">
          {/* Action pills: Show Original / Translate / Explain / Copy */}
          <div className="flex items-center gap-1 text-[11px] text-[#8696a0]">
            {/* Show Original / Translation toggle */}
            {isTranslatedAvailable && displayPreference === 'TRANSLATED_ONLY' && (
              <button
                type="button"
                onClick={() => setShowOriginalOverride((v) => !v)}
                className="hover:text-white underline transition-colors"
              >
                {showOriginalOverride ? 'Show Translated' : 'Show Original'}
              </button>
            )}

            {/* Translate button if not yet translated */}
            {!isTranslatedAvailable && !isTranslating && (
              <button
                type="button"
                onClick={handleManualTranslate}
                className="flex items-center gap-1 hover:text-[#25d366] transition-colors"
                title={`Translate into ${targetLangObj?.name || targetLang}`}
              >
                <Globe className="w-3 h-3" />
                <span>Translate</span>
              </button>
            )}

            {/* AI Explain Technical Terms Button */}
            {settings.explainTechnicalTerms && (
              <button
                type="button"
                onClick={handleExplain}
                className="flex items-center gap-1 hover:text-[#53bdeb] transition-colors ml-1.5"
                title="Explain technical terms with AI"
              >
                <Sparkles className="w-3 h-3 text-[#53bdeb]" />
                <span>Explain</span>
              </button>
            )}

            {/* Copy Text Button */}
            <button
              type="button"
              onClick={() => handleCopy(isTranslatedAvailable ? translationInfo.translatedText : message.text)}
              className="hover:text-white transition-colors ml-1"
              title="Copy text"
            >
              <Copy className="w-3 h-3" />
            </button>
            {copied && <span className="text-[10px] text-[#25d366]">Copied!</span>}
          </div>

          {/* Timestamp & Status Checkmarks */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
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

        {/* Reactions pills underneath */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 ${isOwn ? 'right-2' : 'left-2'} flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs shadow-md z-10`}
            style={{
              background: '#182229',
              border: '1px solid rgba(134, 150, 160, 0.2)',
            }}
          >
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-xs">
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
