package com.zeronet.service;

import com.zeronet.dto.LanguageDto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class SupportedLanguages {

    private static final Map<String, LanguageDto> LANGUAGES = new LinkedHashMap<>();

    static {
        register("en", "English", "English", "Latin");
        register("hi", "Hindi", "हिन्दी", "Devanagari");
        register("bn", "Bengali", "বাংলা", "Bengali");
        register("ta", "Tamil", "தமிழ்", "Tamil");
        register("te", "Telugu", "తెలుగు", "Telugu");
        register("mr", "Marathi", "मराठी", "Devanagari");
        register("gu", "Gujarati", "ગુજરાતી", "Gujarati");
        register("kn", "Kannada", "ಕನ್ನಡ", "Kannada");
        register("ml", "Malayalam", "മലയാളം", "Malayalam");
        register("pa", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi");
        register("ur", "Urdu", "اردو", "Arabic");
        register("or", "Odia", "ଓଡ଼ିଆ", "Odia");
        register("as", "Assamese", "অসমীয়া", "Bengali-Assamese");
        register("es", "Spanish", "Español", "Latin");
        register("fr", "French", "Français", "Latin");
        register("de", "German", "Deutsch", "Latin");
        register("ar", "Arabic", "العربية", "Arabic");
        register("pt", "Portuguese", "Português", "Latin");
        register("ja", "Japanese", "日本語", "Kanji/Kana");
        register("zh", "Chinese", "中文", "Han");
    }

    private static void register(String code, String name, String nativeName, String script) {
        LANGUAGES.put(code.toLowerCase(), new LanguageDto(code.toLowerCase(), name, nativeName, script));
    }

    public static boolean isSupported(String code) {
        if (code == null) return false;
        return LANGUAGES.containsKey(code.trim().toLowerCase());
    }

    public static LanguageDto getLanguage(String code) {
        if (code == null) return LANGUAGES.get("en");
        return LANGUAGES.getOrDefault(code.trim().toLowerCase(), LANGUAGES.get("en"));
    }

    public static String getLanguageName(String code) {
        LanguageDto lang = getLanguage(code);
        return lang != null ? lang.getName() : "English";
    }

    public static List<LanguageDto> getAllLanguages() {
        return Collections.unmodifiableList(new ArrayList<>(LANGUAGES.values()));
    }

    public static String normalize(String code) {
        if (code == null || code.isBlank()) return "en";
        String lower = code.trim().toLowerCase();
        if (lower.startsWith("zh")) return "zh";
        if (lower.startsWith("en")) return "en";
        if (lower.startsWith("hi")) return "hi";
        if (lower.startsWith("bn")) return "bn";
        if (lower.startsWith("ta")) return "ta";
        if (lower.startsWith("te")) return "te";
        if (lower.startsWith("mr")) return "mr";
        if (lower.startsWith("gu")) return "gu";
        if (lower.startsWith("kn")) return "kn";
        if (lower.startsWith("ml")) return "ml";
        if (lower.startsWith("pa")) return "pa";
        if (lower.startsWith("ur")) return "ur";
        if (lower.startsWith("or") || lower.startsWith("od")) return "or";
        if (lower.startsWith("as")) return "as";
        if (lower.startsWith("es")) return "es";
        if (lower.startsWith("fr")) return "fr";
        if (lower.startsWith("de")) return "de";
        if (lower.startsWith("ar")) return "ar";
        if (lower.startsWith("pt")) return "pt";
        if (lower.startsWith("ja")) return "ja";
        return isSupported(lower) ? lower : "en";
    }

    private SupportedLanguages() {
    }
}
