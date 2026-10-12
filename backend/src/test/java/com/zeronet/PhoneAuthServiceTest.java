package com.zeronet;

import com.zeronet.dto.SendOtpResponse;
import com.zeronet.dto.VerifyOtpResponse;
import com.zeronet.model.PhoneOtpVerification;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.repository.PhoneOtpVerificationRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import com.zeronet.service.PhoneAuthService;
import com.zeronet.service.PhoneNumberNormalizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PhoneAuthServiceTest {

    private UserPhoneAccountRepository phoneAccountRepo;
    private PhoneOtpVerificationRepository otpRepo;
    private PhoneNumberNormalizationService phoneNormalizer;
    private PhoneAuthService authService;

    @BeforeEach
    void setUp() {
        phoneAccountRepo = mock(UserPhoneAccountRepository.class);
        otpRepo = mock(PhoneOtpVerificationRepository.class);
        phoneNormalizer = new PhoneNumberNormalizationService();
        authService = new PhoneAuthService(phoneAccountRepo, otpRepo, phoneNormalizer);
    }

    @Test
    void testSendOtpSuccess() {
        when(phoneAccountRepo.findByPhoneNumberE164AndIsVerifiedTrue("+919876543210")).thenReturn(Optional.empty());
        when(otpRepo.findTopByPhoneNumberE164OrderByCreatedAtDesc("+919876543210")).thenReturn(Optional.empty());

        SendOtpResponse response = authService.sendOtp("user-1", "9876543210", "IN");
        assertTrue(response.isSuccess());
        assertEquals("+919876543210", response.getPhoneNumberE164());

        ArgumentCaptor<PhoneOtpVerification> captor = ArgumentCaptor.forClass(PhoneOtpVerification.class);
        verify(otpRepo).save(captor.capture());
        assertNotNull(captor.getValue().getOtpHash());
        assertNotNull(captor.getValue().getSalt());
        assertEquals(0, captor.getValue().getAttempts());
    }

    @Test
    void testSendOtpCooldownRejected() {
        PhoneOtpVerification recent = new PhoneOtpVerification();
        recent.setLastSentAt(System.currentTimeMillis() - 5000); // 5 seconds ago (< 30s)
        when(otpRepo.findTopByPhoneNumberE164OrderByCreatedAtDesc("+919876543210")).thenReturn(Optional.of(recent));

        SendOtpResponse response = authService.sendOtp("user-1", "9876543210", "IN");
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Please wait"));
    }

    @Test
    void testSendOtpAlreadyClaimedByAnotherUser() {
        UserPhoneAccount existing = new UserPhoneAccount();
        existing.setUserId("user-other");
        existing.setPhoneNumberE164("+919876543210");
        existing.setVerified(true);
        when(phoneAccountRepo.findByPhoneNumberE164AndIsVerifiedTrue("+919876543210")).thenReturn(Optional.of(existing));

        SendOtpResponse response = authService.sendOtp("user-1", "9876543210", "IN");
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("already registered"));
    }
}
