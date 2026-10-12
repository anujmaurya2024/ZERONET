package com.zeronet;

import com.zeronet.dto.LanguageDetectionResponse;
import com.zeronet.service.LanguageDetectionService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class LanguageDetectionServiceTest {

    private final LanguageDetectionService detectionService = new LanguageDetectionService();

    @Test
    public void testDetectDevanagariHindi() {
        LanguageDetectionResponse res = detectionService.detect("नमस्ते, आप कैसे हैं?");
        assertEquals("hi", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectBengali() {
        LanguageDetectionResponse res = detectionService.detect("আপনি কেমন আছেন?");
        assertEquals("bn", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectTamil() {
        LanguageDetectionResponse res = detectionService.detect("வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?");
        assertEquals("ta", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectTelugu() {
        LanguageDetectionResponse res = detectionService.detect("నమస్కారం, మీరు ఎలా ఉన్నారు?");
        assertEquals("te", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectSpanish() {
        LanguageDetectionResponse res = detectionService.detect("Hola amigo, como estas?");
        assertEquals("es", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectHinglish() {
        LanguageDetectionResponse res = detectionService.detect("bhai kal assignment submit kar dena");
        assertEquals("hi", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }

    @Test
    public void testDetectEnglish() {
        LanguageDetectionResponse res = detectionService.detect("Spring Boot uses dependency injection.");
        assertEquals("en", res.getDetectedLanguage());
        assertTrue(res.isSupported());
    }
}
