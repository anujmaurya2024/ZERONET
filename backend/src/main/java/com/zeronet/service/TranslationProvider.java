package com.zeronet.service;

public interface TranslationProvider {
    TranslationResult translate(String text, String sourceLang, String targetLang);
    String getProviderName();
    boolean isAvailable();
}
