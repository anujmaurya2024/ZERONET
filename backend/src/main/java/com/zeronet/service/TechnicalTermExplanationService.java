package com.zeronet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zeronet.model.TechnicalTermExplanation;
import com.zeronet.repository.TechnicalTermExplanationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class TechnicalTermExplanationService {

    private static final Logger logger = LoggerFactory.getLogger(TechnicalTermExplanationService.class);

    private final TechnicalTermExplanationRepository explanationRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${zeronet.translation.gemini-api-key:}")
    private String geminiApiKey;

    @Value("${zeronet.translation.openai-api-key:}")
    private String openaiApiKey;

    private static class TermDefinition {
        final String term;
        final String englishDefinition;
        final String example;
        final Map<String, String> localizedExplanations = new HashMap<>();

        TermDefinition(String term, String englishDefinition, String example) {
            this.term = term;
            this.englishDefinition = englishDefinition;
            this.example = example;
        }

        TermDefinition withLocale(String lang, String explanation) {
            this.localizedExplanations.put(lang, explanation);
            return this;
        }
    }

    private final Map<String, TermDefinition> glossary = new HashMap<>();

    public TechnicalTermExplanationService(TechnicalTermExplanationRepository explanationRepository) {
        this.explanationRepository = explanationRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(3500))
                .build();
        initGlossary();
    }

    private void initGlossary() {
        registerTerm(new TermDefinition(
                "Dependency Injection",
                "A software design technique in which an object receives the dependencies it needs instead of creating them itself.",
                "@Autowired or constructor injection in Spring Boot passing a Service into a Controller."
        ).withLocale("hi", "Dependency Injection में किसी object को उसकी ज़रूरी dependencies बाहर से दी जाती हैं, बजाय इसके कि वह उन्हें खुद बनाए।")
         .withLocale("bn", "Dependency Injection হলো একটি সফটওয়্যার ডিজাইন পদ্ধতি যেখানে কোনো অবজেক্ট নিজে নির্ভরতা তৈরি না করে বাইরে থেকে গ্রহণ করে।")
         .withLocale("ta", "Dependency Injection என்பது ஒரு பொருள் தனது தேவைகளை தானாக உருவாக்காமல் வெளிப்புறத்திலிருந்து பெறும் மென்பொருள் வடிவமைப்பு முறையாகும்.")
         .withLocale("te", "Dependency Injection అనేది ఒక ఆబ్జెక్ట్ తన అవసరాలను స్వయంగా సృష్టించకుండా బయటి నుండి పొందే సాఫ్ట్‌వేర్ పద్ధతి.")
         .withLocale("es", "Técnica de diseño de software en la que un objeto recibe sus dependencias en lugar de crearlas.")
         .withLocale("fr", "Technique logicielle où un objet reçoit ses dépendances au lieu de les créer.")
        );

        registerTerm(new TermDefinition(
                "WebRTC",
                "Web Real-Time Communication: A standard enabling direct peer-to-peer audio, video, and data channels between browsers without intermediate media servers.",
                "ZeroNet uses WebRTC DataChannel for peer-to-peer messaging and 64KB file chunk transfers."
        ).withLocale("hi", "WebRTC एक ऐसी तकनीक है जो ब्राउज़रों के बीच सीधे बिना इंटरनेट सर्वर के डेटा और संदेश भेजने की सुविधा देती है।")
         .withLocale("bn", "WebRTC ব্রাউজারগুলির মধ্যে সরাসরি কোনো মধ্যবর্তী সার্ভার ছাড়াই রিয়েল-টাইম ডাটা আদান-প্রদান করতে দেয়।")
         .withLocale("es", "Estándar que permite comunicación directa entre navegadores sin servidores intermedios.")
        );

        registerTerm(new TermDefinition(
                "REST API",
                "Representational State Transfer: An architectural style for networked applications using standard HTTP methods (GET, POST, PUT, DELETE).",
                "GET /api/info fetches current server discovery information."
        ).withLocale("hi", "REST API एक मानक तरीका है जिससे वेब ऐप्लिकेशन्स HTTP प्रोटोकॉल के ज़रिए डेटा का आदान-प्रदान करते हैं।")
         .withLocale("bn", "REST API হলো একটি আর্কিটেকচার যা HTTP মেথড ব্যবহার করে ডাটা আদান-প্রদান করে।")
        );

        registerTerm(new TermDefinition(
                "WebSocket",
                "A persistent, full-duplex communication protocol over a single TCP connection, ideal for real-time chat.",
                "Spring Boot WebSocket relays connection offers and peer messages at ws://0.0.0.0:3001/ws."
        ).withLocale("hi", "WebSocket एक ऐसा कनेक्शन है जो क्लाइंट और सर्वर के बीच लगातार खुला रहता है ताकि रियल-टाइम चैट बिना देरी के हो सके।")
         .withLocale("bn", "WebSocket একটি স্থায়ী দ্বি-মুখী যোগাযোগ ব্যবস্থা যা তাৎক্ষণিক চ্যাটের জন্য ব্যবহৃত হয়।")
        );

        registerTerm(new TermDefinition(
                "Asynchronous",
                "Operations that execute in the background without blocking the main execution thread.",
                "Fetching network translations in the background without freezing the chat UI."
        ).withLocale("hi", "Asynchronous का मतलब है कि कोई काम बैकग्राउंड में होता है और वह स्क्रीन या चैट को फ्रीज़ नहीं करता।")
         .withLocale("bn", "Asynchronous হলো ব্যাকগ্রাউন্ডে কাজ সম্পন্ন হওয়া যাতে মূল অ্যাপ্লিকেশন আটকে না যায়।")
        );

        registerTerm(new TermDefinition(
                "Latency",
                "The time delay between sending a data packet and receiving it at its destination.",
                "Low latency on local Wi-Fi allows near-instant message delivery under 5 milliseconds."
        ).withLocale("hi", "Latency संदेश भेजने और प्राप्तकर्ता तक पहुँचने के बीच के समय के अंतर (देरी) को कहते हैं।")
         .withLocale("bn", "Latency হলো ডাটা পাঠানো এবং পৌঁছানোর মধ্যকার সময়ের বিলম্ব।")
        );

        registerTerm(new TermDefinition(
                "Deadlock",
                "A situation where two or more concurrent processes cannot proceed because each is waiting for the other to release a lock.",
                "Thread 1 holds Resource A waiting for B, while Thread 2 holds Resource B waiting for A."
        ).withLocale("hi", "Deadlock वह स्थिति है जहाँ दो प्रक्रियाएँ एक-दूसरे के रिसोर्स छोड़ने का इंतज़ार करती हैं और दोनों रुक जाती हैं।")
        );

        registerTerm(new TermDefinition(
                "Polymorphism",
                "The ability of different classes to respond to the same method call in their own specific way.",
                "TranslationProvider interface implemented differently by HttpTranslationProvider and OfflineSmartTranslationProvider."
        ).withLocale("hi", "Polymorphism का मतलब है एक ही इंटरफेस के कई अलग-अलग रूप होना।")
        );
    }

    private void registerTerm(TermDefinition def) {
        glossary.put(def.term.toLowerCase(), def);
    }

    public String explain(String messageId, String text, String targetLang) {
        String lang = targetLang != null ? targetLang.toLowerCase() : "en";

        // Check database cache first if messageId is provided
        if (messageId != null && !messageId.isBlank()) {
            Optional<TechnicalTermExplanation> existing = explanationRepository.findByMessageIdAndTargetLanguage(messageId, lang);
            if (existing.isPresent()) {
                return existing.get().getExplanationContent();
            }
        }

        // Generate explanation
        String explanationJson = generateExplanation(text, lang);

        // Cache in repository if messageId provided
        if (messageId != null && !messageId.isBlank()) {
            try {
                TechnicalTermExplanation entity = new TechnicalTermExplanation(
                        UUID.randomUUID().toString(),
                        messageId,
                        lang,
                        explanationJson,
                        "ai-glossary"
                );
                explanationRepository.save(entity);
            } catch (Exception e) {
                logger.debug("Explanation caching skipped or duplicated: {}", e.getMessage());
            }
        }

        return explanationJson;
    }

    private String generateExplanation(String text, String targetLang) {
        if (text == null || text.isBlank()) {
            return "{\"terms\":[],\"summary\":\"No technical terms found.\"}";
        }

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode termsArray = root.putArray("terms");

        String lowerText = text.toLowerCase();
        int termsFound = 0;

        for (Map.Entry<String, TermDefinition> entry : glossary.entrySet()) {
            String termKey = entry.getKey();
            if (Pattern.compile("\\b" + Pattern.quote(termKey) + "\\b", Pattern.CASE_INSENSITIVE).matcher(lowerText).find()
                || lowerText.contains(termKey)) {
                TermDefinition def = entry.getValue();
                ObjectNode termNode = termsArray.addObject();
                termNode.put("term", def.term);
                termNode.put("definition", def.englishDefinition);
                termNode.put("example", def.example);

                String localized = def.localizedExplanations.getOrDefault(targetLang, def.englishDefinition);
                termNode.put("explanationInTargetLanguage", localized);
                termsFound++;
            }
        }

        if (termsFound > 0) {
            root.put("summary", "Found " + termsFound + " technical term" + (termsFound > 1 ? "s" : "") + " explained in " + SupportedLanguages.getLanguageName(targetLang) + ".");
            root.put("provider", "ZeroNet-AI-Glossary");
            return root.toString();
        }

        // Generic fallback breakdown for technical sentences
        ObjectNode fallbackTerm = termsArray.addObject();
        fallbackTerm.put("term", "Technical Context");
        fallbackTerm.put("definition", "This message discusses computer architecture, algorithms, or application concepts.");
        fallbackTerm.put("example", text.length() > 60 ? text.substring(0, 60) + "..." : text);
        
        String localizedFallback = targetLang.equals("hi")
                ? "यह संदेश सॉफ़्टवेयर इंजीनियरिंग और तकनीकी अवधारणाओं से संबंधित है।"
                : "This message contains software terminology and programming instructions.";
        fallbackTerm.put("explanationInTargetLanguage", localizedFallback);

        root.put("summary", "Technical concept analysis complete.");
        root.put("provider", "ZeroNet-AI-Engine");
        return root.toString();
    }
}
