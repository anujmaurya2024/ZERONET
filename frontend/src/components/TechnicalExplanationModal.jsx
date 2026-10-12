import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Code2, BookOpen, Check } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../context/TranslationContext';

export default function TechnicalExplanationModal() {
  const { activeExplanation, setActiveExplanation } = useTranslation();

  if (!activeExplanation) return null;

  const { messageText, explanationData, targetLang } = activeExplanation;
  const terms = explanationData?.terms || [];
  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#25d366]/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] border-b border-[rgba(134,150,160,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#e9edef]">AI Technical Term Explanation</h3>
                <p className="text-[11px] text-[#8696a0]">
                  Explained in {targetLangObj?.name || 'your language'} ({targetLangObj?.nativeName || ''})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveExplanation(null)}
              className="p-1.5 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Snippet */}
          <div className="px-5 py-3 bg-[#182229] border-b border-[rgba(134,150,160,0.1)]">
            <p className="text-[11px] uppercase tracking-wider text-[#8696a0] font-semibold mb-1">
              Message Context:
            </p>
            <p className="text-xs text-[#e9edef] italic bg-[#111b21] p-2.5 rounded-lg border border-[rgba(134,150,160,0.1)]">
              &ldquo;{messageText}&rdquo;
            </p>
          </div>

          {/* Terms List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {terms.length === 0 ? (
              <p className="text-sm text-[#8696a0] text-center py-6">
                No specific programming jargon or difficult terms detected in this message.
              </p>
            ) : (
              terms.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4 bg-[#202c33] border border-[rgba(134,150,160,0.15)] space-y-2.5"
                >
                  {/* Term Title */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#25d366] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {item.term}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111b21] text-[#8696a0] font-mono">
                      Technical Concept
                    </span>
                  </div>

                  {/* Standard Definition in English */}
                  <div>
                    <p className="text-xs text-[#e9edef] leading-relaxed">
                      {item.definition}
                    </p>
                  </div>

                  {/* Localized Explanation in Recipient's Language */}
                  {item.explanationInTargetLanguage && (
                    <div className="p-3 rounded-lg bg-[#111b21] border-l-2 border-[#00a884]">
                      <p className="text-[11px] font-semibold text-[#00a884] mb-1">
                        {targetLangObj?.name || 'Localized'} Explanation:
                      </p>
                      <p className="text-xs text-[#e9edef] leading-relaxed font-sans">
                        {item.explanationInTargetLanguage}
                      </p>
                    </div>
                  )}

                  {/* Code or practical example */}
                  {item.example && (
                    <div className="flex items-start gap-2 pt-1 text-[11px] text-[#8696a0]">
                      <Code2 className="w-3.5 h-3.5 mt-0.5 text-[#53bdeb] shrink-0" />
                      <span>
                        <strong className="text-[#aebac1]">Example:</strong> {item.example}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#202c33] border-t border-[rgba(134,150,160,0.15)] flex justify-end">
            <button
              type="button"
              onClick={() => setActiveExplanation(null)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00a884] text-white hover:bg-[#008069] transition-all shadow-md active:scale-95"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
