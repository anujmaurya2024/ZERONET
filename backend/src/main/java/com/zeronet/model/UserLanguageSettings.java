package com.zeronet.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_language_settings")
public class UserLanguageSettings {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "preferred_display_language", length = 10, nullable = false)
    private String preferredDisplayLanguage = "en";

    @Column(name = "preferred_incoming_language", length = 10, nullable = false)
    private String preferredIncomingLanguage = "en";

    @Column(name = "default_outgoing_language", length = 10, nullable = false)
    private String defaultOutgoingLanguage = "en";

    @Column(name = "auto_translate_incoming", nullable = false)
    private boolean autoTranslateIncoming = true;

    @Column(name = "auto_detect_language", nullable = false)
    private boolean autoDetectLanguage = true;

    @Column(name = "explain_technical_terms", nullable = false)
    private boolean explainTechnicalTerms = true;

    @Column(name = "display_preference", length = 20, nullable = false)
    private String displayPreference = "BOTH"; // "BOTH", "TRANSLATED_ONLY", "ORIGINAL_ONLY"

    @Column(name = "updated_at", nullable = false)
    private long updatedAt = System.currentTimeMillis();

    public UserLanguageSettings() {
    }

    public UserLanguageSettings(String userId) {
        this.userId = userId;
        this.updatedAt = System.currentTimeMillis();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPreferredDisplayLanguage() {
        return preferredDisplayLanguage;
    }

    public void setPreferredDisplayLanguage(String preferredDisplayLanguage) {
        this.preferredDisplayLanguage = preferredDisplayLanguage;
    }

    public String getPreferredIncomingLanguage() {
        return preferredIncomingLanguage;
    }

    public void setPreferredIncomingLanguage(String preferredIncomingLanguage) {
        this.preferredIncomingLanguage = preferredIncomingLanguage;
    }

    public String getDefaultOutgoingLanguage() {
        return defaultOutgoingLanguage;
    }

    public void setDefaultOutgoingLanguage(String defaultOutgoingLanguage) {
        this.defaultOutgoingLanguage = defaultOutgoingLanguage;
    }

    public boolean isAutoTranslateIncoming() {
        return autoTranslateIncoming;
    }

    public void setAutoTranslateIncoming(boolean autoTranslateIncoming) {
        this.autoTranslateIncoming = autoTranslateIncoming;
    }

    public boolean isAutoDetectLanguage() {
        return autoDetectLanguage;
    }

    public void setAutoDetectLanguage(boolean autoDetectLanguage) {
        this.autoDetectLanguage = autoDetectLanguage;
    }

    public boolean isExplainTechnicalTerms() {
        return explainTechnicalTerms;
    }

    public void setExplainTechnicalTerms(boolean explainTechnicalTerms) {
        this.explainTechnicalTerms = explainTechnicalTerms;
    }

    public String getDisplayPreference() {
        return displayPreference;
    }

    public void setDisplayPreference(String displayPreference) {
        this.displayPreference = displayPreference;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
