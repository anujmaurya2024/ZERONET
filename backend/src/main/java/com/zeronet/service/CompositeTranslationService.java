package com.zeronet.service;

import com.zeronet.dto.TranslationPreviewResponse;
import com.zeronet.model.ChatMessageRecord;
import com.zeronet.model.MessageTranslation;
import com.zeronet.repository.ChatMessageRecordRepository;
import com.zeronet.repository.MessageTranslationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CompositeTranslationService {

    private static final Logger logger = LoggerFactory.getLogger(CompositeTranslationService.class);
    private static final String TRANSLATION_VERSION = "v1";

    private final MessageTranslationRepository translationRepository;
    private final ChatMessageRecordRepository messageRepository;
    private final LanguageDetectionService languageDetectionService;
    private final HttpTranslationProvider httpTranslationProvider;
    private final OfflineSmartTranslationProvider offlineSmartTranslationProvider;

    // In-memory cache for fast previews: key = sourceLang_targetLang_text
    private final ConcurrentHashMap<String, String> previewCache = new ConcurrentHashMap<>();
    // In-flight request lock map to deduplicate concurrent identical translation requests
    private final ConcurrentHashMap<String, Object> inFlightLocks = new ConcurrentHashMap<>();

    public CompositeTranslationService(
            MessageTranslationRepository translationRepository,
            ChatMessageRecordRepository messageRepository,
            LanguageDetectionService languageDetectionService,
            HttpTranslationProvider httpTranslationProvider,
            OfflineSmartTranslationProvider offlineSmartTranslationProvider) {
        this.translationRepository = translationRepository;
        this.messageRepository = messageRepository;
        this.languageDetectionService = languageDetectionService;
        this.httpTranslationProvider = httpTranslationProvider;
        this.offlineSmartTranslationProvider = offlineSmartTranslationProvider;
    }

    /**
     * Preview translation of arbitrary draft text without persisting a message.
     */
    public TranslationPreviewResponse previewTranslation(String text, String sourceLang, String targetLang) {
        if (text == null || text.isBlank()) {
            return new TranslationPreviewResponse("", "en", "en", "", "none", false);
        }

        String target = SupportedLanguages.normalize(targetLang);
        String source = (sourceLang == null || sourceLang.isBlank() || sourceLang.equalsIgnoreCase("auto"))
                ? languageDetectionService.detect(text).getDetectedLanguage()
                : SupportedLanguages.normalize(sourceLang);

        if (source.equalsIgnoreCase(target)) {
            return new TranslationPreviewResponse(text, source, target, text, "same-language", true);
        }

        String cacheKey = source + "_" + target + "_" + text.trim();
        String cached = previewCache.get(cacheKey);
        if (cached != null) {
            return new TranslationPreviewResponse(text, source, target, cached, "cache-memory", true);
        }

        // Execute translation with lock deduplication
        Object lock = inFlightLocks.computeIfAbsent(cacheKey, k -> new Object());
        synchronized (lock) {
            try {
                if (previewCache.containsKey(cacheKey)) {
                    return new TranslationPreviewResponse(text, source, target, previewCache.get(cacheKey), "cache-memory", true);
                }

                TranslationResult result = executeTranslation(text, source, target);
                String translated = result.getTranslatedText();
                previewCache.put(cacheKey, translated);

                return new TranslationPreviewResponse(text, source, target, translated, result.getProvider(), false);
            } finally {
                inFlightLocks.remove(cacheKey);
            }
        }
    }

    /**
     * Translates a persisted message or translates & persists if not yet stored.
     */
    @Transactional
    public MessageTranslation translateMessage(
            String messageId,
            String conversationId,
            String senderId,
            String originalContent,
            String sourceLanguage,
            String targetLanguage) {

        String target = SupportedLanguages.normalize(targetLanguage);
        String source = (sourceLanguage == null || sourceLanguage.isBlank() || sourceLanguage.equalsIgnoreCase("auto"))
                ? languageDetectionService.detect(originalContent).getDetectedLanguage()
                : SupportedLanguages.normalize(sourceLanguage);

        // 1. Ensure original message is preserved canonically
        if (messageId != null && !messageId.isBlank() && !messageRepository.existsById(messageId)) {
            ChatMessageRecord record = new ChatMessageRecord(
                    messageId,
                    conversationId != null ? conversationId : "default",
                    senderId != null ? senderId : "unknown",
                    originalContent,
                    source,
                    "text",
                    System.currentTimeMillis()
            );
            messageRepository.save(record);
        }

        // 2. Check if translation is already cached in database
        if (messageId != null && !messageId.isBlank()) {
            Optional<MessageTranslation> cachedOpt = translationRepository
                    .findByMessageIdAndTargetLanguageAndTranslationVersion(messageId, target, TRANSLATION_VERSION);
            if (cachedOpt.isPresent()) {
                return cachedOpt.get();
            }
        }

        // Same language check
        if (source.equalsIgnoreCase(target)) {
            MessageTranslation identity = new MessageTranslation(
                    UUID.randomUUID().toString(),
                    messageId != null ? messageId : UUID.randomUUID().toString(),
                    source,
                    target,
                    originalContent,
                    "identity",
                    TRANSLATION_VERSION
            );
            if (messageId != null && !messageId.isBlank()) {
                return translationRepository.save(identity);
            }
            return identity;
        }

        // 3. Execute translation
        TranslationResult result = executeTranslation(originalContent, source, target);

        MessageTranslation translation = new MessageTranslation(
                UUID.randomUUID().toString(),
                messageId != null ? messageId : UUID.randomUUID().toString(),
                source,
                target,
                result.getTranslatedText(),
                result.getProvider(),
                TRANSLATION_VERSION
        );

        if (messageId != null && !messageId.isBlank()) {
            return translationRepository.save(translation);
        }
        return translation;
    }

    public List<MessageTranslation> getTranslationsForMessage(String messageId) {
        return translationRepository.findByMessageId(messageId);
    }

    @Transactional
    public void invalidateTranslations(String messageId) {
        if (messageId != null && !messageId.isBlank()) {
            translationRepository.deleteByMessageId(messageId);
            logger.info("Invalidated translations for messageId: {}", messageId);
        }
    }

    private TranslationResult executeTranslation(String text, String source, String target) {
        // Try external HTTP translation first
        TranslationResult httpResult = httpTranslationProvider.translate(text, source, target);
        if (httpResult.isSuccess()) {
            return httpResult;
        }

        // Fallback to offline smart engine
        return offlineSmartTranslationProvider.translate(text, source, target);
    }
}
