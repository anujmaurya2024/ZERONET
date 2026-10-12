package com.zeronet.dto;

public class LanguageDetectionResponse {
    private String detectedLanguage;
    private double confidence;
    private boolean supported;

    public LanguageDetectionResponse() {
    }

    public LanguageDetectionResponse(String detectedLanguage, double confidence, boolean supported) {
        this.detectedLanguage = detectedLanguage;
        this.confidence = confidence;
        this.supported = supported;
    }

    public String getDetectedLanguage() {
        return detectedLanguage;
    }

    public void setDetectedLanguage(String detectedLanguage) {
        this.detectedLanguage = detectedLanguage;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public boolean isSupported() {
        return supported;
    }

    public void setSupported(boolean supported) {
        this.supported = supported;
    }
}
