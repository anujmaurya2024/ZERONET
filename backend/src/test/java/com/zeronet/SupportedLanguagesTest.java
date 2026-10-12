package com.zeronet;

import com.zeronet.service.SupportedLanguages;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SupportedLanguagesTest {

    @Test
    public void testMajorIndianLanguagesSupported() {
        assertTrue(SupportedLanguages.isSupported("hi"), "Hindi should be supported");
        assertTrue(SupportedLanguages.isSupported("bn"), "Bengali should be supported");
        assertTrue(SupportedLanguages.isSupported("ta"), "Tamil should be supported");
        assertTrue(SupportedLanguages.isSupported("te"), "Telugu should be supported");
        assertTrue(SupportedLanguages.isSupported("mr"), "Marathi should be supported");
        assertTrue(SupportedLanguages.isSupported("gu"), "Gujarati should be supported");
        assertTrue(SupportedLanguages.isSupported("kn"), "Kannada should be supported");
        assertTrue(SupportedLanguages.isSupported("ml"), "Malayalam should be supported");
        assertTrue(SupportedLanguages.isSupported("pa"), "Punjabi should be supported");
        assertTrue(SupportedLanguages.isSupported("ur"), "Urdu should be supported");
        assertTrue(SupportedLanguages.isSupported("or"), "Odia should be supported");
        assertTrue(SupportedLanguages.isSupported("as"), "Assamese should be supported");
    }

    @Test
    public void testInternationalLanguagesSupported() {
        assertTrue(SupportedLanguages.isSupported("en"), "English should be supported");
        assertTrue(SupportedLanguages.isSupported("es"), "Spanish should be supported");
        assertTrue(SupportedLanguages.isSupported("fr"), "French should be supported");
        assertTrue(SupportedLanguages.isSupported("de"), "German should be supported");
        assertTrue(SupportedLanguages.isSupported("ar"), "Arabic should be supported");
        assertTrue(SupportedLanguages.isSupported("pt"), "Portuguese should be supported");
        assertTrue(SupportedLanguages.isSupported("ja"), "Japanese should be supported");
        assertTrue(SupportedLanguages.isSupported("zh"), "Chinese should be supported");
    }

    @Test
    public void testNormalization() {
        assertEquals("hi", SupportedLanguages.normalize("HI"));
        assertEquals("en", SupportedLanguages.normalize("en-US"));
        assertEquals("zh", SupportedLanguages.normalize("zh-CN"));
        assertEquals("en", SupportedLanguages.normalize(null));
        assertEquals("en", SupportedLanguages.normalize("unknown-lang"));
    }
}
