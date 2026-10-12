package com.zeronet.dto;

public class MessageTranslationRequest {
    private String targetLanguage;
    private String conversationId;
    private String senderId;
    private String originalContent;
    private String originalLanguage;

    public MessageTranslationRequest() {
    }

    public MessageTranslationRequest(String targetLanguage, String conversationId, String senderId, String originalContent, String originalLanguage) {
        this.targetLanguage = targetLanguage;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.originalContent = originalContent;
        this.originalLanguage = originalLanguage;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }
}
