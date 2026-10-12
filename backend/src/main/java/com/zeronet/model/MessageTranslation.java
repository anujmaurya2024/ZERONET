package com.zeronet.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "message_translations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_msg_target_version", columnNames = {"message_id", "target_language", "translation_version"})
    },
    indexes = {
        @Index(name = "idx_translations_msg", columnList = "message_id"),
        @Index(name = "idx_translations_target", columnList = "target_language")
    }
)
public class MessageTranslation {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "message_id", length = 64, nullable = false)
    private String messageId;

    @Column(name = "source_language", length = 10, nullable = false)
    private String sourceLanguage;

    @Column(name = "target_language", length = 10, nullable = false)
    private String targetLanguage;

    @Column(name = "translated_content", columnDefinition = "TEXT", nullable = false)
    private String translatedContent;

    @Column(name = "translation_provider", length = 50, nullable = false)
    private String translationProvider = "composite";

    @Column(name = "translation_version", length = 20, nullable = false)
    private String translationVersion = "v1";

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    @Column(name = "updated_at", nullable = false)
    private long updatedAt;

    public MessageTranslation() {
    }

    public MessageTranslation(String id, String messageId, String sourceLanguage, String targetLanguage, String translatedContent, String translationProvider, String translationVersion) {
        this.id = id;
        this.messageId = messageId;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.translatedContent = translatedContent;
        this.translationProvider = translationProvider != null ? translationProvider : "composite";
        this.translationVersion = translationVersion != null ? translationVersion : "v1";
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = this.createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public void setSourceLanguage(String sourceLanguage) {
        this.sourceLanguage = sourceLanguage;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getTranslatedContent() {
        return translatedContent;
    }

    public void setTranslatedContent(String translatedContent) {
        this.translatedContent = translatedContent;
    }

    public String getTranslationProvider() {
        return translationProvider;
    }

    public void setTranslationProvider(String translationProvider) {
        this.translationProvider = translationProvider;
    }

    public String getTranslationVersion() {
        return translationVersion;
    }

    public void setTranslationVersion(String translationVersion) {
        this.translationVersion = translationVersion;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
