package com.zeronet.service;

import com.zeronet.model.UserLanguageSettings;
import com.zeronet.repository.UserLanguageSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserLanguageSettingsService {

    private final UserLanguageSettingsRepository repository;

    public UserLanguageSettingsService(UserLanguageSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public UserLanguageSettings getOrCreateSettings(String userId) {
        String uid = (userId != null && !userId.isBlank()) ? userId.trim() : "default-user";
        return repository.findById(uid).orElseGet(() -> {
            UserLanguageSettings settings = new UserLanguageSettings(uid);
            return repository.save(settings);
        });
    }

    @Transactional
    public UserLanguageSettings updateSettings(String userId, UserLanguageSettings incoming) {
        String uid = (userId != null && !userId.isBlank()) ? userId.trim() : "default-user";
        UserLanguageSettings current = getOrCreateSettings(uid);

        if (incoming.getPreferredDisplayLanguage() != null) {
            current.setPreferredDisplayLanguage(SupportedLanguages.normalize(incoming.getPreferredDisplayLanguage()));
        }
        if (incoming.getPreferredIncomingLanguage() != null) {
            current.setPreferredIncomingLanguage(SupportedLanguages.normalize(incoming.getPreferredIncomingLanguage()));
        }
        if (incoming.getDefaultOutgoingLanguage() != null) {
            current.setDefaultOutgoingLanguage(SupportedLanguages.normalize(incoming.getDefaultOutgoingLanguage()));
        }
        current.setAutoTranslateIncoming(incoming.isAutoTranslateIncoming());
        current.setAutoDetectLanguage(incoming.isAutoDetectLanguage());
        current.setExplainTechnicalTerms(incoming.isExplainTechnicalTerms());
        if (incoming.getDisplayPreference() != null) {
            current.setDisplayPreference(incoming.getDisplayPreference());
        }
        current.setUpdatedAt(System.currentTimeMillis());

        return repository.save(current);
    }
}
