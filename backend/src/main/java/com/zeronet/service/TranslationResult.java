package com.zeronet.service;

public class TranslationResult {
    private final String translatedText;
    private final String provider;
    private final boolean success;
    private final String errorMessage;

    public TranslationResult(String translatedText, String provider, boolean success, String errorMessage) {
        this.translatedText = translatedText;
        this.provider = provider;
        this.success = success;
        this.errorMessage = errorMessage;
    }

    public static TranslationResult ok(String translatedText, String provider) {
        return new TranslationResult(translatedText, provider, true, null);
    }

    public static TranslationResult fail(String originalFallback, String provider, String errorMessage) {
        return new TranslationResult(originalFallback, provider, false, errorMessage);
    }

    public String getTranslatedText() {
        return translatedText;
    }

    public String getProvider() {
        return provider;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
