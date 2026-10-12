package com.zeronet.controller;

import com.zeronet.dto.*;
import com.zeronet.model.UserBlock;
import com.zeronet.model.UserPrivacySettings;
import com.zeronet.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MobileChatController {

    private final PhoneAuthService phoneAuthService;
    private final UserDiscoveryService discoveryService;
    private final UserPrivacyService privacyService;
    private final DirectConversationService directConversationService;
    private final ContactService contactService;

    public MobileChatController(PhoneAuthService phoneAuthService,
                                UserDiscoveryService discoveryService,
                                UserPrivacyService privacyService,
                                DirectConversationService directConversationService,
                                ContactService contactService) {
        this.phoneAuthService = phoneAuthService;
        this.discoveryService = discoveryService;
        this.privacyService = privacyService;
        this.directConversationService = directConversationService;
        this.contactService = contactService;
    }

    private String resolveUserId(String headerUserId, String headerDeviceId) {
        if (headerUserId != null && !headerUserId.isBlank()) return headerUserId.trim();
        if (headerDeviceId != null && !headerDeviceId.isBlank()) return headerDeviceId.trim();
        return "default-user";
    }

    // 1. Phone Registration & OTP
    @PostMapping("/users/me/phone/send-otp")
    public ResponseEntity<SendOtpResponse> sendOtp(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody SendOtpRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        if (request == null || request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().body(new SendOtpResponse(false, "Phone number is required", null, 0, null));
        }

        SendOtpResponse response = phoneAuthService.sendOtp(effectiveId, request.getPhoneNumber(), request.getDefaultCountryCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/me/phone/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody VerifyOtpRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        if (request == null || request.getPhoneNumber() == null || request.getOtp() == null) {
            return ResponseEntity.badRequest().body(new VerifyOtpResponse(false, "Phone number and OTP are required", null, false, effectiveId));
        }

        VerifyOtpResponse response = phoneAuthService.verifyOtp(effectiveId, request.getPhoneNumber(), request.getOtp(), request.getDisplayName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/me/phone")
    public ResponseEntity<?> getPhoneStatus(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = resolveUserId(userId, deviceId);
        return phoneAuthService.getPhoneStatus(effectiveId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new UserPhoneStatusDto(effectiveId, null, "+91", null, false, null)));
    }

    @DeleteMapping("/users/me/phone")
    public ResponseEntity<?> unlinkPhone(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = resolveUserId(userId, deviceId);
        boolean success = phoneAuthService.unlinkPhone(effectiveId);
        return ResponseEntity.ok(Map.of("success", success));
    }

    // 2. Discover Users by Phone / Name
    @GetMapping("/users/search")
    public ResponseEntity<List<UserSearchResultDto>> searchUsers(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestParam("query") String query) {
        String effectiveId = resolveUserId(userId, deviceId);
        List<UserSearchResultDto> results = discoveryService.searchUsers(effectiveId, query);
        return ResponseEntity.ok(results);
    }

    // 3. Start or Retrieve Direct Conversation
    @PostMapping("/conversations/direct")
    public ResponseEntity<?> startDirectConversation(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody DirectConversationRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        if (request == null || request.getTargetUserId() == null || request.getTargetUserId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "targetUserId is required"));
        }

        try {
            DirectConversationResponse response = directConversationService.getOrCreateDirectConversation(
                    effectiveId, request.getTargetUserId()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // 4. Privacy Settings
    @GetMapping("/users/me/privacy-settings")
    public ResponseEntity<UserPrivacySettings> getPrivacySettings(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = resolveUserId(userId, deviceId);
        return ResponseEntity.ok(privacyService.getPrivacySettings(effectiveId));
    }

    @PutMapping("/users/me/privacy-settings")
    public ResponseEntity<UserPrivacySettings> updatePrivacySettings(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody UserPrivacySettings settings) {
        String effectiveId = resolveUserId(userId, deviceId);
        return ResponseEntity.ok(privacyService.updatePrivacySettings(effectiveId, settings));
    }

    // 5. Contacts
    @PostMapping("/contacts/sync")
    public ResponseEntity<List<ContactItemDto>> syncContacts(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody SyncContactsRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        List<ContactItemDto> list = (request != null && request.getContacts() != null) ? request.getContacts() : List.of();
        return ResponseEntity.ok(contactService.syncContacts(effectiveId, list));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactItemDto>> getContacts(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = resolveUserId(userId, deviceId);
        return ResponseEntity.ok(contactService.getContacts(effectiveId));
    }

    // 6. User Moderation / Blocks
    @PostMapping("/users/block")
    public ResponseEntity<?> blockUser(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody BlockUserRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        if (request == null || request.getTargetUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "targetUserId is required"));
        }
        boolean blocked = privacyService.blockUser(effectiveId, request.getTargetUserId(), request.getReason());
        return ResponseEntity.ok(Map.of("success", blocked));
    }

    @PostMapping("/users/unblock")
    public ResponseEntity<?> unblockUser(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody BlockUserRequest request) {
        String effectiveId = resolveUserId(userId, deviceId);
        if (request == null || request.getTargetUserId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "targetUserId is required"));
        }
        boolean unblocked = privacyService.unblockUser(effectiveId, request.getTargetUserId());
        return ResponseEntity.ok(Map.of("success", unblocked));
    }

    @GetMapping("/users/blocks")
    public ResponseEntity<List<UserBlock>> getBlockedUsers(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
        String effectiveId = resolveUserId(userId, deviceId);
        return ResponseEntity.ok(privacyService.getBlockedUsers(effectiveId));
    }
}
