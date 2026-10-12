package com.zeronet.controller;

import com.zeronet.dto.ExplanationRequest;
import com.zeronet.dto.LanguageDetectionRequest;
import com.zeronet.dto.LanguageDetectionResponse;
import com.zeronet.dto.LanguageDto;
import com.zeronet.dto.MessageTranslationRequest;
import com.zeronet.dto.TranslationPreviewRequest;
import com.zeronet.dto.TranslationPreviewResponse;
import com.zeronet.model.MessageTranslation;
import com.zeronet.model.UserLanguageSettings;
import com.zeronet.service.CompositeTranslationService;
import com.zeronet.service.LanguageDetectionService;
import com.zeronet.service.SupportedLanguages;
import com.zeronet.service.TechnicalTermExplanationService;
import com.zeronet.service.UserLanguageSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TranslationController {

    private final CompositeTranslationService translationService;
    private final LanguageDetectionService languageDetectionService;
    private final TechnicalTermExplanationService explanationService;
    private final UserLanguageSettingsService languageSettingsService;

    public TranslationController(
            CompositeTranslationService translationService,
            LanguageDetectionService languageDetectionService,
            TechnicalTermExplanationService explanationService,
            UserLanguageSettingsService languageSettingsService) {
        this.translationService = translationService;
        this.languageDetectionService = languageDetectionService;
        this.explanationService = explanationService;
        this.languageSettingsService = languageSettingsService;
    }

    @GetMapping("/languages")
    public List<LanguageDto> getSupportedLanguages() {
        return SupportedLanguages.getAllLanguages();
    }

    @GetMapping("/users/me/language-settings")
    public UserLanguageSettings getMyLanguageSettings(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = userId != null ? userId : (deviceId != null ? deviceId : "default-user");
        return languageSettingsService.getOrCreateSettings(effectiveId);
    }

    @PutMapping("/users/me/language-settings")
    public UserLanguageSettings updateMyLanguageSettings(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody UserLanguageSettings settings) {
        String effectiveId = userId != null ? userId : (deviceId != null ? deviceId : "default-user");
        return languageSettingsService.updateSettings(effectiveId, settings);
    }

    @PostMapping("/translations/preview")
    public ResponseEntity<?> previewTranslation(@RequestBody TranslationPreviewRequest request) {
        if (request == null || request.getText() == null || request.getText().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text to translate cannot be empty"));
        }
        if (request.getText().length() > 2000) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of("error", "Text exceeds maximum allowed length of 2000 characters"));
        }

        TranslationPreviewResponse response = translationService.previewTranslation(
                request.getText(),
                request.getSourceLanguage(),
                request.getTargetLanguage()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/translations/detect-language")
    public ResponseEntity<?> detectLanguage(@RequestBody LanguageDetectionRequest request) {
        if (request == null || request.getText() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text for language detection cannot be null"));
        }
        LanguageDetectionResponse response = languageDetectionService.detect(request.getText());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/messages/{messageId}/translations")
    public ResponseEntity<List<MessageTranslation>> getMessageTranslations(@PathVariable("messageId") String messageId) {
        if (messageId == null || messageId.isBlank()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(translationService.getTranslationsForMessage(messageId));
    }

    @PostMapping("/messages/{messageId}/translations")
    public ResponseEntity<?> translateMessage(
            @PathVariable("messageId") String messageId,
            @RequestBody MessageTranslationRequest request) {
        if (request == null || request.getOriginalContent() == null || request.getOriginalContent().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Original message content is required"));
        }
        if (request.getTargetLanguage() == null || !SupportedLanguages.isSupported(request.getTargetLanguage())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported target language code"));
        }

        MessageTranslation translation = translationService.translateMessage(
                messageId,
                request.getConversationId(),
                request.getSenderId(),
                request.getOriginalContent(),
                request.getOriginalLanguage(),
                request.getTargetLanguage()
        );
        return ResponseEntity.ok(translation);
    }

    @PostMapping("/messages/{messageId}/explanations")
    public ResponseEntity<?> explainTechnicalTerms(
            @PathVariable("messageId") String messageId,
            @RequestBody ExplanationRequest request) {
        String content = request != null ? request.getContent() : null;
        String targetLang = request != null && request.getTargetLanguage() != null ? request.getTargetLanguage() : "en";

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message content is required to explain terms"));
        }

        String explanationJson = explanationService.explain(messageId, content, targetLang);
        return ResponseEntity.ok().header("Content-Type", "application/json").body(explanationJson);
    }

    @DeleteMapping("/messages/{messageId}/translations")
    public ResponseEntity<?> invalidateTranslations(@PathVariable("messageId") String messageId) {
        translationService.invalidateTranslations(messageId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Translations invalidated"));
    }
}
