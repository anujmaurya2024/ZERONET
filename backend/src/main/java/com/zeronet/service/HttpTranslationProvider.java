package com.zeronet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
public class HttpTranslationProvider implements TranslationProvider {

    private static final Logger logger = LoggerFactory.getLogger(HttpTranslationProvider.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${zeronet.translation.google-api-key:}")
    private String googleApiKey;

    public HttpTranslationProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(2500))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public TranslationResult translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.isBlank()) {
            return TranslationResult.ok("", getProviderName());
        }

        try {
            // MyMemory Translation API (Free tier, no API key required, supports major Indian & international languages)
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String langPair = URLEncoder.encode(sourceLang + "|" + targetLang, StandardCharsets.UTF_8);
            String url = "https://api.mymemory.translated.net/get?q=" + encodedText + "&langpair=" + langPair;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMillis(3000))
                    .header("User-Agent", "ZeroNet-Chat-Translator/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode responseData = root.path("responseData");
                if (responseData.has("translatedText")) {
                    String translated = responseData.path("translatedText").asText();
                    if (translated != null && !translated.isBlank() && !translated.equalsIgnoreCase("NO QUERY SPECIFIED")) {
                        return TranslationResult.ok(translated, getProviderName());
                    }
                }
            } else {
                logger.warn("External translation API returned status: {}", response.statusCode());
            }
        } catch (Exception e) {
            logger.debug("External HTTP translation call skipped/timed out: {}", e.getMessage());
        }

        return TranslationResult.fail(text, getProviderName(), "Translation service unreachable or timed out");
    }

    @Override
    public String getProviderName() {
        return "mymemory-api";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
