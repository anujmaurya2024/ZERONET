import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Check, Languages, Sparkles, Sliders, Shield } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/TranslationContext';

export default function LanguageSettingsModal({ isOpen, onClose }) {
  const { settings, updateSettings } = useTranslation();

  const [formData, setFormData] = useState({
    preferredDisplayLanguage: settings.preferredDisplayLanguage || 'en',
    preferredIncomingLanguage: settings.preferredIncomingLanguage || 'en',
    defaultOutgoingLanguage: settings.defaultOutgoingLanguage || 'hi',
    autoTranslateIncoming: settings.autoTranslateIncoming ?? true,
    autoDetectLanguage: settings.autoDetectLanguage ?? true,
    explainTechnicalTerms: settings.explainTechnicalTerms ?? true,
    displayPreference: settings.displayPreference || 'BOTH',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
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
          className="w-full max-w-lg rounded-2xl bg-[#111b21] border border-[rgba(0,168,132,0.3)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] border-b border-[rgba(134,150,160,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#25d366] flex items-center justify-center">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#e9edef]">Language & AI Translation Settings</h2>
                <p className="text-[11px] text-[#8696a0]">Customize your real-time translation and multilingual preferences</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {/* Preferred Language for Incoming Messages */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#e9edef] text-xs uppercase tracking-wider">
                Preferred Language for Incoming Messages
              </label>
              <p className="text-xs text-[#8696a0]">
                Incoming messages from any language will be translated into this language.
              </p>
              <select
                value={formData.preferredIncomingLanguage}
                onChange={(e) => setFormData({ ...formData, preferredIncomingLanguage: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-[#202c33] text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Default Outgoing Translation Language */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#e9edef] text-xs uppercase tracking-wider">
                Default Outgoing Translation Language
              </label>
              <p className="text-xs text-[#8696a0]">
                Quick target language suggested in the message composer.
              </p>
              <select
                value={formData.defaultOutgoingLanguage}
                onChange={(e) => setFormData({ ...formData, defaultOutgoingLanguage: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-[#202c33] text-[#e9edef] border border-[rgba(134,150,160,0.2)] focus:border-[#00a884] focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Display Preferences */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#e9edef] text-xs uppercase tracking-wider">
                Message Display Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'BOTH', title: 'Show Both', desc: 'Original + Translation' },
                  { value: 'TRANSLATED_ONLY', title: 'Translated', desc: 'Toggle for Original' },
                  { value: 'ORIGINAL_ONLY', title: 'Original', desc: 'Toggle for Translation' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, displayPreference: opt.value })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.displayPreference === opt.value
                        ? 'bg-[#00a884]/20 border-[#00a884] text-[#25d366]'
                        : 'bg-[#202c33] border-[rgba(134,150,160,0.15)] text-[#8696a0] hover:text-[#e9edef]'
                    }`}
                  >
                    <p className="font-bold text-xs">{opt.title}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 space-y-3 border-t border-[rgba(134,150,160,0.12)]">
              {/* Auto-translate incoming messages */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#e9edef]">Automatically Translate Incoming Messages</p>
                  <p className="text-xs text-[#8696a0]">Translate messages instantly when received without tapping</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoTranslateIncoming}
                  onChange={(e) => setFormData({ ...formData, autoTranslateIncoming: e.target.checked })}
                  className="w-5 h-5 accent-[#00a884] rounded cursor-pointer"
                />
              </label>

              {/* Auto-detect language */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#e9edef]">Automatic Language Detection</p>
                  <p className="text-xs text-[#8696a0]">Automatically identify source scripts and regional dialects</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoDetectLanguage}
                  onChange={(e) => setFormData({ ...formData, autoDetectLanguage: e.target.checked })}
                  className="w-5 h-5 accent-[#00a884] rounded cursor-pointer"
                />
              </label>

              {/* Explain technical terms */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <p className="text-sm font-medium text-[#e9edef] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#25d366]" />
                    AI Technical Term Explanations
                  </p>
                  <p className="text-xs text-[#8696a0]">Enable one-click AI explanations for unfamiliar jargon and coding terms</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.explainTechnicalTerms}
                  onChange={(e) => setFormData({ ...formData, explainTechnicalTerms: e.target.checked })}
                  className="w-5 h-5 accent-[#00a884] rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#202c33]/60 border border-[rgba(134,150,160,0.1)] text-xs text-[#8696a0]">
              <Shield className="w-4 h-4 text-[#00a884] shrink-0" />
              <span>Translations are cached locally and privacy-preserved. Original text is never altered.</span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#202c33] text-[#8696a0] hover:text-[#e9edef] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
