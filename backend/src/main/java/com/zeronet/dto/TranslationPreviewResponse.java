package com.zeronet.dto;

public class TranslationPreviewResponse {
    private String originalText;
    private String sourceLanguage;
    private String targetLanguage;
    private String translatedText;
    private String provider;
    private boolean cached;

    public TranslationPreviewResponse() {
    }

    public TranslationPreviewResponse(String originalText, String sourceLanguage, String targetLanguage, String translatedText, String provider, boolean cached) {
        this.originalText = originalText;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.translatedText = translatedText;
        this.provider = provider;
        this.cached = cached;
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
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

    public String getTranslatedText() {
        return translatedText;
    }

    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isCached() {
        return cached;
    }

    public void setCached(boolean cached) {
        this.cached = cached;
    }
}
