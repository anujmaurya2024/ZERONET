package com.zeronet.service;

import com.zeronet.dto.LanguageDetectionResponse;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class LanguageDetectionService {

    private static final Set<String> HINGLISH_KEYWORDS = new HashSet<>(Arrays.asList(
        "kya", "kaise", "hai", "nahi", "nahin", "hain", "karna", "bhai", "dena", "hoga", "mera", "meri",
        "tum", "aap", "achha", "theek", "shukriya", "dhanyawad", "yaar", "kal", "aaj", "kuch", "baat"
    ));

    private static final Set<String> SPANISH_KEYWORDS = new HashSet<>(Arrays.asList(
        "hola", "gracias", "amigo", "como", "estas", "bien", "buenos", "dias", "por", "favor", "mucho",
        "gusto", "tiempo", "todos", "donde", "cuando", "pero"
    ));

    private static final Set<String> FRENCH_KEYWORDS = new HashSet<>(Arrays.asList(
        "bonjour", "merci", "salut", "comment", "allez", "vous", "bien", "oui", "non", "avec",
        "pourquoi", "maintenant", "aujourd", "faire"
    ));

    private static final Set<String> GERMAN_KEYWORDS = new HashSet<>(Arrays.asList(
        "hallo", "danke", "bitte", "guten", "morgen", "tag", "abend", "wie", "geht", "nicht",
        "alles", "klar", "tschuss", "schon"
    ));

    private static final Set<String> PORTUGUESE_KEYWORDS = new HashSet<>(Arrays.asList(
        "ola", "obrigado", "obrigada", "voce", "como", "vai", "tudo", "bom", "boa", "tarde",
        "noite", "amigo", "fazer"
    ));

    public LanguageDetectionResponse detect(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new LanguageDetectionResponse("en", 0.0, true);
        }

        String trimmed = text.trim();

        // 1. Script checks via Unicode block counting
        int devanagariCount = 0;
        int bengaliCount = 0;
        int gurmukhiCount = 0;
        int gujaratiCount = 0;
        int odiaCount = 0;
        int tamilCount = 0;
        int teluguCount = 0;
        int kannadaCount = 0;
        int malayalamCount = 0;
        int arabicUrduCount = 0;
        int japaneseKanaCount = 0;
        int cjkHanCount = 0;

        for (int i = 0; i < trimmed.length(); i++) {
            char ch = trimmed.charAt(i);
            Character.UnicodeBlock block = Character.UnicodeBlock.of(ch);
            if (block == null) continue;

            if (block == Character.UnicodeBlock.DEVANAGARI) devanagariCount++;
            else if (block == Character.UnicodeBlock.BENGALI) bengaliCount++;
            else if (block == Character.UnicodeBlock.GURMUKHI) gurmukhiCount++;
            else if (block == Character.UnicodeBlock.GUJARATI) gujaratiCount++;
            else if (block == Character.UnicodeBlock.ORIYA) odiaCount++;
            else if (block == Character.UnicodeBlock.TAMIL) tamilCount++;
            else if (block == Character.UnicodeBlock.TELUGU) teluguCount++;
            else if (block == Character.UnicodeBlock.KANNADA) kannadaCount++;
            else if (block == Character.UnicodeBlock.MALAYALAM) malayalamCount++;
            else if (block == Character.UnicodeBlock.ARABIC || block == Character.UnicodeBlock.ARABIC_SUPPLEMENT) arabicUrduCount++;
            else if (block == Character.UnicodeBlock.HIRAGANA || block == Character.UnicodeBlock.KATAKANA) japaneseKanaCount++;
            else if (block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS) cjkHanCount++;
        }

        int totalLetters = Math.max(1, trimmed.codePointCount(0, trimmed.length()));

        if (devanagariCount > 2) {
            return new LanguageDetectionResponse("hi", Math.min(1.0, (double) devanagariCount / totalLetters + 0.3), true);
        }
        if (bengaliCount > 2) {
            return new LanguageDetectionResponse("bn", Math.min(1.0, (double) bengaliCount / totalLetters + 0.3), true);
        }
        if (tamilCount > 2) {
            return new LanguageDetectionResponse("ta", Math.min(1.0, (double) tamilCount / totalLetters + 0.3), true);
        }
        if (teluguCount > 2) {
            return new LanguageDetectionResponse("te", Math.min(1.0, (double) teluguCount / totalLetters + 0.3), true);
        }
        if (gujaratiCount > 2) {
            return new LanguageDetectionResponse("gu", Math.min(1.0, (double) gujaratiCount / totalLetters + 0.3), true);
        }
        if (kannadaCount > 2) {
            return new LanguageDetectionResponse("kn", Math.min(1.0, (double) kannadaCount / totalLetters + 0.3), true);
        }
        if (malayalamCount > 2) {
            return new LanguageDetectionResponse("ml", Math.min(1.0, (double) malayalamCount / totalLetters + 0.3), true);
        }
        if (gurmukhiCount > 2) {
            return new LanguageDetectionResponse("pa", Math.min(1.0, (double) gurmukhiCount / totalLetters + 0.3), true);
        }
        if (odiaCount > 2) {
            return new LanguageDetectionResponse("or", Math.min(1.0, (double) odiaCount / totalLetters + 0.3), true);
        }
        if (arabicUrduCount > 2) {
            return new LanguageDetectionResponse("ar", Math.min(1.0, (double) arabicUrduCount / totalLetters + 0.3), true);
        }
        if (japaneseKanaCount > 1 || (cjkHanCount > 1 && japaneseKanaCount > 0)) {
            return new LanguageDetectionResponse("ja", 0.95, true);
        }
        if (cjkHanCount > 2) {
            return new LanguageDetectionResponse("zh", 0.95, true);
        }

        // 2. Latin word check for European languages & Hinglish (Romanized Hindi)
        String[] words = trimmed.toLowerCase().split("[^a-z]+");
        int spanishHits = 0, frenchHits = 0, germanHits = 0, portHits = 0, hinglishHits = 0;

        for (String w : words) {
            if (w.isEmpty()) continue;
            if (SPANISH_KEYWORDS.contains(w)) spanishHits++;
            if (FRENCH_KEYWORDS.contains(w)) frenchHits++;
            if (GERMAN_KEYWORDS.contains(w)) germanHits++;
            if (PORTUGUESE_KEYWORDS.contains(w)) portHits++;
            if (HINGLISH_KEYWORDS.contains(w)) hinglishHits++;
        }

        if (hinglishHits >= 2 || (hinglishHits >= 1 && words.length <= 4)) {
            return new LanguageDetectionResponse("hi", 0.85, true);
        }
        if (spanishHits >= 2 || (spanishHits >= 1 && words.length <= 3)) {
            return new LanguageDetectionResponse("es", 0.9, true);
        }
        if (frenchHits >= 2 || (frenchHits >= 1 && words.length <= 3)) {
            return new LanguageDetectionResponse("fr", 0.9, true);
        }
        if (germanHits >= 2 || (germanHits >= 1 && words.length <= 3)) {
            return new LanguageDetectionResponse("de", 0.9, true);
        }
        if (portHits >= 2 || (portHits >= 1 && words.length <= 3)) {
            return new LanguageDetectionResponse("pt", 0.9, true);
        }

        return new LanguageDetectionResponse("en", 0.75, true);
    }
}
