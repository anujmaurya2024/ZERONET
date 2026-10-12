package com.zeronet.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "technical_term_explanations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_exp_msg_target", columnNames = {"message_id", "target_language"})
    },
    indexes = {
        @Index(name = "idx_explanations_msg", columnList = "message_id")
    }
)
public class TechnicalTermExplanation {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "message_id", length = 64, nullable = false)
    private String messageId;

    @Column(name = "target_language", length = 10, nullable = false)
    private String targetLanguage;

    @Column(name = "explanation_content", columnDefinition = "TEXT", nullable = false)
    private String explanationContent;

    @Column(name = "provider", length = 50, nullable = false)
    private String provider = "ai-glossary";

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    public TechnicalTermExplanation() {
    }

    public TechnicalTermExplanation(String id, String messageId, String targetLanguage, String explanationContent, String provider) {
        this.id = id;
        this.messageId = messageId;
        this.targetLanguage = targetLanguage;
        this.explanationContent = explanationContent;
        this.provider = provider != null ? provider : "ai-glossary";
        this.createdAt = System.currentTimeMillis();
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

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getExplanationContent() {
        return explanationContent;
    }

    public void setExplanationContent(String explanationContent) {
        this.explanationContent = explanationContent;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
