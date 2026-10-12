package com.zeronet;

import com.zeronet.dto.TranslationPreviewResponse;
import com.zeronet.model.ChatMessageRecord;
import com.zeronet.model.MessageTranslation;
import com.zeronet.model.UserLanguageSettings;
import com.zeronet.repository.ChatMessageRecordRepository;
import com.zeronet.repository.MessageTranslationRepository;
import com.zeronet.repository.TechnicalTermExplanationRepository;
import com.zeronet.repository.UserLanguageSettingsRepository;
import com.zeronet.service.CompositeTranslationService;
import com.zeronet.service.TechnicalTermExplanationService;
import com.zeronet.service.UserLanguageSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TranslationServiceTest {

    @Autowired
    private CompositeTranslationService translationService;

    @Autowired
    private TechnicalTermExplanationService explanationService;

    @Autowired
    private UserLanguageSettingsService settingsService;

    @Autowired
    private ChatMessageRecordRepository messageRepository;

    @Autowired
    private MessageTranslationRepository translationRepository;

    @Test
    public void testPreviewTranslationPreservesOriginal() {
        String original = "Kal assignment submit kar dena";
        TranslationPreviewResponse preview = translationService.previewTranslation(original, "hi", "en");

        assertEquals(original, preview.getOriginalText());
        assertNotNull(preview.getTranslatedText());
        assertFalse(preview.getTranslatedText().isBlank());
        assertTrue(preview.getTranslatedText().toLowerCase().contains("assignment") ||
                   preview.getTranslatedText().toLowerCase().contains("submit"));
    }

    @Test
    public void testTranslateMessagePersistsAndCaches() {
        String msgId = "test-msg-" + UUID.randomUUID();
        String original = "Your project submission deadline is tomorrow.";

        MessageTranslation t1 = translationService.translateMessage(
                msgId, "conv-1", "user-1", original, "en", "hi"
        );

        assertNotNull(t1);
        assertEquals(msgId, t1.getMessageId());
        assertEquals("hi", t1.getTargetLanguage());
        assertNotNull(t1.getTranslatedContent());

        // Verify original message is preserved canonically in message repository
        ChatMessageRecord originalRecord = messageRepository.findById(msgId).orElse(null);
        assertNotNull(originalRecord);
        assertEquals(original, originalRecord.getOriginalContent());

        // Second translation call must reuse cached entry
        MessageTranslation t2 = translationService.translateMessage(
                msgId, "conv-1", "user-1", original, "en", "hi"
        );
        assertEquals(t1.getId(), t2.getId(), "Should reuse cached translation record");

        // Translations list
        List<MessageTranslation> list = translationService.getTranslationsForMessage(msgId);
        assertFalse(list.isEmpty());

        // Invalidation
        translationService.invalidateTranslations(msgId);
        List<MessageTranslation> afterInvalidation = translationService.getTranslationsForMessage(msgId);
        assertTrue(afterInvalidation.isEmpty(), "Translations should be removed on invalidation");
    }

    @Test
    public void testExplainTechnicalTerms() {
        String text = "Spring Boot uses dependency injection to manage application components.";
        String explanationJson = explanationService.explain("msg-explain-1", text, "hi");

        assertNotNull(explanationJson);
        assertTrue(explanationJson.contains("Dependency Injection"));
        assertTrue(explanationJson.contains("explanationInTargetLanguage"));
    }

    @Test
    public void testUserLanguageSettingsPersistence() {
        String userId = "user-settings-test-" + UUID.randomUUID();
        UserLanguageSettings initial = settingsService.getOrCreateSettings(userId);
        assertNotNull(initial);
        assertEquals("en", initial.getPreferredDisplayLanguage());

        UserLanguageSettings update = new UserLanguageSettings(userId);
        update.setPreferredDisplayLanguage("hi");
        update.setPreferredIncomingLanguage("hi");
        update.setDefaultOutgoingLanguage("en");
        update.setDisplayPreference("BOTH");
        update.setAutoTranslateIncoming(true);

        UserLanguageSettings saved = settingsService.updateSettings(userId, update);
        assertEquals("hi", saved.getPreferredDisplayLanguage());
        assertEquals("hi", saved.getPreferredIncomingLanguage());
        assertEquals("en", saved.getDefaultOutgoingLanguage());
    }
}
