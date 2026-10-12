package com.zeronet.dto;

public class LanguageDetectionRequest {
    private String text;

    public LanguageDetectionRequest() {
    }

    public LanguageDetectionRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
