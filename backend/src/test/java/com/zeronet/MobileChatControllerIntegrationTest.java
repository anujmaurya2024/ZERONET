package com.zeronet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zeronet.dto.DirectConversationRequest;
import com.zeronet.dto.SendOtpRequest;
import com.zeronet.dto.VerifyOtpRequest;
import com.zeronet.model.UserPrivacySettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MobileChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSendOtpAndVerifyFlow() throws Exception {
        // 1. Send OTP
        SendOtpRequest sendReq = new SendOtpRequest("9876543210", "IN");
        String sendRespJson = mockMvc.perform(post("/api/users/me/phone/send-otp")
                        .header("X-User-Id", "test-user-mobile-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.phoneNumberE164", is("+919876543210")))
                .andReturn().getResponse().getContentAsString();

        // Extract devOtp from response
        var node = objectMapper.readTree(sendRespJson);
        String devOtp = node.get("devOtp").asText();
        assert devOtp != null && devOtp.length() == 6;

        // 2. Verify OTP
        VerifyOtpRequest verifyReq = new VerifyOtpRequest("9876543210", devOtp, "Anjali");
        mockMvc.perform(post("/api/users/me/phone/verify-otp")
                        .header("X-User-Id", "test-user-mobile-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.verified", is(true)));

        // 3. Check Phone Status
        mockMvc.perform(get("/api/users/me/phone")
                        .header("X-User-Id", "test-user-mobile-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified", is(true)))
                .andExpect(jsonPath("$.phoneNumberE164", is("+919876543210")));

        // 4. Search for User by Mobile Number
        mockMvc.perform(get("/api/users/search")
                        .header("X-User-Id", "test-user-mobile-2")
                        .param("query", "+919876543210"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].userId", is("test-user-mobile-1")))
                .andExpect(jsonPath("$[0].displayName", is("Anjali")));

        // 5. Start Direct Conversation
        DirectConversationRequest convReq = new DirectConversationRequest("test-user-mobile-1");
        mockMvc.perform(post("/api/conversations/direct")
                        .header("X-User-Id", "test-user-mobile-2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(convReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversationId", notNullValue()))
                .andExpect(jsonPath("$.peerId", is("test-user-mobile-1")));
    }

    @Test
    void testPrivacySettingsUpdate() throws Exception {
        UserPrivacySettings update = new UserPrivacySettings("test-user-privacy", "CONTACTS", "NOBODY", false, true, 0, 0);
        mockMvc.perform(put("/api/users/me/privacy-settings")
                        .header("X-User-Id", "test-user-privacy")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discoveryVisibility", is("CONTACTS")))
                .andExpect(jsonPath("$.phoneVisibility", is("NOBODY")));
    }
}
