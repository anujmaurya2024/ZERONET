package com.zeronet.dto;

public class ExplanationRequest {
    private String targetLanguage;
    private String content;

    public ExplanationRequest() {
    }

    public ExplanationRequest(String targetLanguage, String content) {
        this.targetLanguage = targetLanguage;
        this.content = content;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
