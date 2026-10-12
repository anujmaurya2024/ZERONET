package com.zeronet;

import com.zeronet.dto.UserSearchResultDto;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.model.UserPrivacySettings;
import com.zeronet.repository.UserBlockRepository;
import com.zeronet.repository.UserContactRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import com.zeronet.repository.UserPrivacySettingsRepository;
import com.zeronet.service.PhoneNumberNormalizationService;
import com.zeronet.service.UserDiscoveryService;
import com.zeronet.service.UserPrivacyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserPrivacyAndDiscoveryTest {

    private UserPhoneAccountRepository phoneRepo;
    private UserPrivacySettingsRepository privacyRepo;
    private UserBlockRepository blockRepo;
    private UserContactRepository contactRepo;
    private PhoneNumberNormalizationService phoneNormalizer;
    private UserPrivacyService privacyService;
    private UserDiscoveryService discoveryService;

    @BeforeEach
    void setUp() {
        phoneRepo = mock(UserPhoneAccountRepository.class);
        privacyRepo = mock(UserPrivacySettingsRepository.class);
        blockRepo = mock(UserBlockRepository.class);
        contactRepo = mock(UserContactRepository.class);
        phoneNormalizer = new PhoneNumberNormalizationService();
        privacyService = new UserPrivacyService(privacyRepo, blockRepo, contactRepo);
        discoveryService = new UserDiscoveryService(phoneRepo, phoneNormalizer, privacyService, contactRepo);
    }

    @Test
    void testDiscoveryPermittedForEveryone() {
        UserPhoneAccount target = new UserPhoneAccount();
        target.setUserId("user-target");
        target.setPhoneNumberE164("+919876543210");
        target.setDisplayName("Alice");
        target.setVerified(true);

        when(phoneRepo.findByPhoneNumberE164AndIsVerifiedTrue("+919876543210")).thenReturn(Optional.of(target));
        when(blockRepo.existsByUserIdAndBlockedUserId(anyString(), anyString())).thenReturn(false);

        UserPrivacySettings settings = new UserPrivacySettings("user-target", "EVERYONE", "EVERYONE", true, true, 0, 0);
        when(privacyRepo.findByUserId("user-target")).thenReturn(Optional.of(settings));

        List<UserSearchResultDto> results = discoveryService.searchUsers("user-searcher", "+919876543210");
        assertEquals(1, results.size());
        assertEquals("Alice", results.get(0).getDisplayName());
        assertEquals("+919876543210", results.get(0).getPhoneNumber());
    }

    @Test
    void testDiscoveryBlockedWhenNobodyCanDiscover() {
        UserPhoneAccount target = new UserPhoneAccount();
        target.setUserId("user-target");
        target.setPhoneNumberE164("+919876543210");
        target.setVerified(true);

        when(phoneRepo.findByPhoneNumberE164AndIsVerifiedTrue("+919876543210")).thenReturn(Optional.of(target));
        when(blockRepo.existsByUserIdAndBlockedUserId(anyString(), anyString())).thenReturn(false);

        UserPrivacySettings settings = new UserPrivacySettings("user-target", "NOBODY", "NOBODY", true, true, 0, 0);
        when(privacyRepo.findByUserId("user-target")).thenReturn(Optional.of(settings));

        List<UserSearchResultDto> results = discoveryService.searchUsers("user-searcher", "+919876543210");
        assertTrue(results.isEmpty()); // Prevents phone enumeration
    }

    @Test
    void testBlockedUserCannotDiscover() {
        UserPhoneAccount target = new UserPhoneAccount();
        target.setUserId("user-target");
        target.setPhoneNumberE164("+919876543210");
        target.setVerified(true);

        when(phoneRepo.findByPhoneNumberE164AndIsVerifiedTrue("+919876543210")).thenReturn(Optional.of(target));
        // Target blocked searcher
        when(blockRepo.existsByUserIdAndBlockedUserId("user-target", "user-searcher")).thenReturn(true);

        List<UserSearchResultDto> results = discoveryService.searchUsers("user-searcher", "+919876543210");
        assertTrue(results.isEmpty());
    }
}
