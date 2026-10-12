package com.zeronet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zeronet.dto.ExplanationRequest;
import com.zeronet.dto.LanguageDetectionRequest;
import com.zeronet.dto.MessageTranslationRequest;
import com.zeronet.dto.TranslationPreviewRequest;
import com.zeronet.model.UserLanguageSettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TranslationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetLanguages() throws Exception {
        mockMvc.perform(get("/api/languages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").exists())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testPreviewTranslationEndpoint() throws Exception {
        TranslationPreviewRequest req = new TranslationPreviewRequest("Kal assignment submit kar dena", "hi", "en");

        mockMvc.perform(post("/api/translations/preview")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalText").value("Kal assignment submit kar dena"))
                .andExpect(jsonPath("$.targetLanguage").value("en"))
                .andExpect(jsonPath("$.translatedText").exists());
    }

    @Test
    public void testOversizedRequestRejected() throws Exception {
        String longText = "a".repeat(2500);
        TranslationPreviewRequest req = new TranslationPreviewRequest(longText, "en", "hi");

        mockMvc.perform(post("/api/translations/preview")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    public void testDetectLanguageEndpoint() throws Exception {
        LanguageDetectionRequest req = new LanguageDetectionRequest("आज की बैठक शाम 5 बजे शुरू होगी");

        mockMvc.perform(post("/api/translations/detect-language")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detectedLanguage").value("hi"))
                .andExpect(jsonPath("$.supported").value(true));
    }

    @Test
    public void testTranslateMessageEndpoint() throws Exception {
        String msgId = "api-msg-" + UUID.randomUUID();
        MessageTranslationRequest req = new MessageTranslationRequest(
                "hi", "conv-1", "user-1", "Hello friend, how are you?", "en"
        );

        mockMvc.perform(post("/api/messages/" + msgId + "/translations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messageId").value(msgId))
                .andExpect(jsonPath("$.targetLanguage").value("hi"))
                .andExpect(jsonPath("$.translatedContent").exists());

        // Fetch translations
        mockMvc.perform(get("/api/messages/" + msgId + "/translations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].messageId").value(msgId));
    }

    @Test
    public void testExplainTechnicalTermsEndpoint() throws Exception {
        String msgId = "api-exp-" + UUID.randomUUID();
        ExplanationRequest req = new ExplanationRequest(
                "hi", "Spring Boot uses dependency injection to manage application components."
        );

        mockMvc.perform(post("/api/messages/" + msgId + "/explanations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.terms").isArray())
                .andExpect(jsonPath("$.terms[0].term").value("Dependency Injection"));
    }

    @Test
    public void testUserLanguageSettingsEndpoints() throws Exception {
        String userId = "device-" + UUID.randomUUID();

        // Get initial
        mockMvc.perform(get("/api/users/me/language-settings")
                .header("X-Device-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredDisplayLanguage").value("en"));

        // Update
        UserLanguageSettings update = new UserLanguageSettings(userId);
        update.setPreferredDisplayLanguage("hi");
        update.setPreferredIncomingLanguage("bn");
        update.setAutoTranslateIncoming(true);

        mockMvc.perform(put("/api/users/me/language-settings")
                .header("X-Device-Id", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredDisplayLanguage").value("hi"))
                .andExpect(jsonPath("$.preferredIncomingLanguage").value("bn"));
    }
}
