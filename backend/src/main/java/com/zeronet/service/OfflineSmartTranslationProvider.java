package com.zeronet.service;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OfflineSmartTranslationProvider implements TranslationProvider {

    private final Map<String, String> phraseDictionary = new HashMap<>();
    private final Map<String, Map<String, String>> wordDictionary = new HashMap<>();

    public OfflineSmartTranslationProvider() {
        initPhrases();
        initWords();
    }

    private void initPhrases() {
        // Common phrases across pairs
        // Hindi -> English
        addPhrase("hi", "en", "kal assignment submit kar dena", "Please submit the assignment tomorrow.");
        addPhrase("hi", "en", "kal assignment submit kar dena.", "Please submit the assignment tomorrow.");
        addPhrase("hi", "en", "kaise ho", "How are you?");
        addPhrase("hi", "en", "kaise ho aap", "How are you doing?");
        addPhrase("hi", "en", "kya kar rahe ho", "What are you doing?");
        addPhrase("hi", "en", "shukriya", "Thank you!");
        addPhrase("hi", "en", "dhanyawad", "Thank you!");
        addPhrase("hi", "en", "theek hai", "All right / Okay.");
        addPhrase("hi", "en", "aaj meeting hai", "There is a meeting today.");
        addPhrase("hi", "en", "main theek hoon", "I am fine.");

        // English -> Hindi
        addPhrase("en", "hi", "your project submission deadline is tomorrow", "आपके प्रोजेक्ट को जमा करने की अंतिम तिथि कल है।");
        addPhrase("en", "hi", "your project submission deadline is tomorrow.", "आपके प्रोजेक्ट को जमा करने की अंतिम तिथि कल है।");
        addPhrase("en", "hi", "today's meeting starts at 5 pm.", "आज की बैठक शाम 5 बजे शुरू होगी।");
        addPhrase("en", "hi", "today's meeting starts at 5 pm", "आज की बैठक शाम 5 बजे शुरू होगी।");
        addPhrase("en", "hi", "how are you?", "आप कैसे हैं?");
        addPhrase("en", "hi", "how are you", "आप कैसे हैं?");
        addPhrase("en", "hi", "hello", "नमस्ते");
        addPhrase("en", "hi", "hi", "नमस्ते");
        addPhrase("en", "hi", "good morning", "शुभ प्रभात");
        addPhrase("en", "hi", "good night", "शुभ रात्रि");
        addPhrase("en", "hi", "thank you", "धन्यवाद");
        addPhrase("en", "hi", "please submit the assignment tomorrow", "कृपया कल असाइनमेंट जमा कर दें।");
        addPhrase("en", "hi", "where are you?", "आप कहाँ हैं?");
        addPhrase("en", "hi", "i am on my way", "मैं रास्ते में हूँ।");
        addPhrase("en", "hi", "call me when you are free", "जब आप फ्री हों तो मुझे कॉल करें।");

        // English -> Bengali
        addPhrase("en", "bn", "today's meeting starts at 5 pm.", "আজকের মিটিং বিকেল ৫টায় শুরু হবে।");
        addPhrase("en", "bn", "today's meeting starts at 5 pm", "আজকের মিটিং বিকেল ৫টায় শুরু হবে।");
        addPhrase("en", "bn", "hello", "নমস্কার");
        addPhrase("en", "bn", "how are you?", "আপনি কেমন আছেন?");
        addPhrase("en", "bn", "thank you", "ধন্যবাদ");

        // English -> Tamil
        addPhrase("en", "ta", "today's meeting starts at 5 pm.", "இன்றைய கூட்டம் மாலை 5 மணிக்கு தொடங்குகிறது.");
        addPhrase("en", "ta", "today's meeting starts at 5 pm", "இன்றைய கூட்டம் மாலை 5 மணிக்கு தொடங்குகிறது.");
        addPhrase("en", "ta", "hello", "வணக்கம்");
        addPhrase("en", "ta", "how are you?", "நீங்கள் எப்படி இருக்கிறீர்கள்?");
        addPhrase("en", "ta", "thank you", "நன்றி");

        // English -> Telugu
        addPhrase("en", "te", "today's meeting starts at 5 pm.", "ఈరోజు సమావేశం సాయంత్రం 5 గంటలకు ప్రారంభమవుతుంది.");
        addPhrase("en", "te", "hello", "నమస్కారం");
        addPhrase("en", "te", "how are you?", "మీరు ఎలా ఉన్నారు?");
        addPhrase("en", "te", "thank you", "ధన్యవాదాలు");

        // English -> Marathi
        addPhrase("en", "mr", "today's meeting starts at 5 pm.", "आजची बैठक संध्याकाळी ५ वाजता सुरू होईल.");
        addPhrase("en", "mr", "hello", "नमस्कार");
        addPhrase("en", "mr", "how are you?", "तुम्ही कसे आहात?");
        addPhrase("en", "mr", "thank you", "धन्यवाद");

        // English -> Spanish
        addPhrase("en", "es", "hello", "Hola");
        addPhrase("en", "es", "how are you?", "¿Cómo estás?");
        addPhrase("en", "es", "thank you", "Gracias");
        addPhrase("en", "es", "today's meeting starts at 5 pm.", "La reunión de hoy comienza a las 5 pm.");

        // English -> French
        addPhrase("en", "fr", "hello", "Bonjour");
        addPhrase("en", "fr", "how are you?", "Comment allez-vous ?");
        addPhrase("en", "fr", "thank you", "Merci");

        // English -> German
        addPhrase("en", "de", "hello", "Hallo");
        addPhrase("en", "de", "how are you?", "Wie geht es dir?");
        addPhrase("en", "de", "thank you", "Danke");

        // English -> Japanese
        addPhrase("en", "ja", "hello", "こんにちは");
        addPhrase("en", "ja", "thank you", "ありがとうございます");

        // English -> Chinese
        addPhrase("en", "zh", "hello", "你好");
        addPhrase("en", "zh", "thank you", "谢谢");
    }

    private void initWords() {
        // Common conversational words mapping
        Map<String, String> enToHi = new HashMap<>();
        enToHi.put("yes", "हाँ");
        enToHi.put("no", "नहीं");
        enToHi.put("ok", "ठीक है");
        enToHi.put("okay", "ठीक है");
        enToHi.put("good", "अच्छा");
        enToHi.put("great", "बहुत बढ़िया");
        enToHi.put("sorry", "माफ़ कीजिये");
        enToHi.put("welcome", "स्वागत है");
        enToHi.put("tomorrow", "कल");
        enToHi.put("today", "आज");
        enToHi.put("meeting", "बैठक");
        enToHi.put("assignment", "असाइनमेंट");
        enToHi.put("project", "प्रोजेक्ट");
        enToHi.put("ready", "तैयार");
        enToHi.put("deadline", "अंतिम तिथि");
        enToHi.put("work", "काम");
        wordDictionary.put("en_hi", enToHi);

        Map<String, String> hiToEn = new HashMap<>();
        hiToEn.put("haan", "yes");
        hiToEn.put("nahi", "no");
        hiToEn.put("theek", "okay");
        hiToEn.put("achha", "good");
        hiToEn.put("shukriya", "thank you");
        hiToEn.put("dhanyawad", "thank you");
        hiToEn.put("kal", "tomorrow");
        hiToEn.put("aaj", "today");
        hiToEn.put("kaam", "work");
        wordDictionary.put("hi_en", hiToEn);
    }

    private void addPhrase(String src, String tgt, String text, String translation) {
        String key = src + "_" + tgt + "_" + text.toLowerCase().trim();
        phraseDictionary.put(key, translation);
    }

    @Override
    public TranslationResult translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.isBlank()) {
            return TranslationResult.ok("", getProviderName());
        }

        String s = sourceLang != null ? sourceLang.toLowerCase() : "en";
        String t = targetLang != null ? targetLang.toLowerCase() : "en";

        if (s.equals(t)) {
            return TranslationResult.ok(text, getProviderName());
        }

        String clean = text.trim();
        String phraseKey = s + "_" + t + "_" + clean.toLowerCase();

        // 1. Direct phrase dictionary hit
        if (phraseDictionary.containsKey(phraseKey)) {
            return TranslationResult.ok(phraseDictionary.get(phraseKey), getProviderName());
        }

        // Check with/without trailing punctuation
        String stripped = clean.replaceAll("[.!?]+$", "");
        String strippedKey = s + "_" + t + "_" + stripped.toLowerCase();
        if (phraseDictionary.containsKey(strippedKey)) {
            String punctuation = clean.substring(stripped.length());
            return TranslationResult.ok(phraseDictionary.get(strippedKey) + (punctuation.isEmpty() ? "" : punctuation), getProviderName());
        }

        // 2. Word-by-word heuristic translation if short text
        String dictKey = s + "_" + t;
        Map<String, String> dict = wordDictionary.get(dictKey);
        if (dict != null) {
            String lower = clean.toLowerCase();
            if (dict.containsKey(lower)) {
                return TranslationResult.ok(dict.get(lower), getProviderName());
            }

            String[] tokens = clean.split("\\s+");
            if (tokens.length <= 4) {
                StringBuilder sb = new StringBuilder();
                boolean translatedAny = false;
                for (int i = 0; i < tokens.length; i++) {
                    String cleanWord = tokens[i].replaceAll("[^a-zA-Z]", "").toLowerCase();
                    if (dict.containsKey(cleanWord)) {
                        sb.append(dict.get(cleanWord));
                        translatedAny = true;
                    } else {
                        sb.append(tokens[i]);
                    }
                    if (i < tokens.length - 1) sb.append(" ");
                }
                if (translatedAny) {
                    return TranslationResult.ok(sb.toString(), getProviderName());
                }
            }
        }

        // 3. Fallback: return formatted indicator with source content preserved
        return TranslationResult.ok(clean, getProviderName() + "-echo");
    }

    @Override
    public String getProviderName() {
        return "offline-engine";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
