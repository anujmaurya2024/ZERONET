package com.zeronet.service;

import com.zeronet.dto.SendOtpResponse;
import com.zeronet.dto.UserPhoneStatusDto;
import com.zeronet.dto.VerifyOtpResponse;
import com.zeronet.model.PhoneOtpVerification;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.repository.PhoneOtpVerificationRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class PhoneAuthService {

    private static final Logger logger = LoggerFactory.getLogger(PhoneAuthService.class);
    private static final int OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
    private static final int RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
    private static final int MAX_ATTEMPTS = 5;

    private final UserPhoneAccountRepository phoneAccountRepo;
    private final PhoneOtpVerificationRepository otpRepo;
    private final PhoneNumberNormalizationService phoneNormalizer;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${zeronet.dev.return-otp:true}")
    private boolean devReturnOtp;

    public PhoneAuthService(UserPhoneAccountRepository phoneAccountRepo,
                            PhoneOtpVerificationRepository otpRepo,
                            PhoneNumberNormalizationService phoneNormalizer) {
        this.phoneAccountRepo = phoneAccountRepo;
        this.otpRepo = otpRepo;
        this.phoneNormalizer = phoneNormalizer;
    }

    /**
     * Generates and sends a secure OTP to the specified mobile number.
     */
    @Transactional
    public SendOtpResponse sendOtp(String userId, String rawPhoneNumber, String defaultCountryCode) {
        PhoneNumberNormalizationService.NormalizedPhone norm = phoneNormalizer.normalize(rawPhoneNumber, defaultCountryCode);
        if (!norm.isValid()) {
            return new SendOtpResponse(false, "Invalid phone number format. Please provide a valid international or Indian mobile number.", null, 0, null);
        }

        String e164 = norm.e164();
        long now = System.currentTimeMillis();

        // Check if number is already verified by ANOTHER user
        Optional<UserPhoneAccount> existingVerified = phoneAccountRepo.findByPhoneNumberE164AndIsVerifiedTrue(e164);
        if (existingVerified.isPresent() && !existingVerified.get().getUserId().equals(userId)) {
            return new SendOtpResponse(false, "This mobile number is already registered and verified with another account.", null, 0, null);
        }

        // Check cooldown
        Optional<PhoneOtpVerification> latestOtp = otpRepo.findTopByPhoneNumberE164OrderByCreatedAtDesc(e164);
        if (latestOtp.isPresent()) {
            long elapsed = now - latestOtp.get().getLastSentAt();
            if (elapsed < RESEND_COOLDOWN_MS) {
                int remainingSeconds = (int) Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000.0);
                return new SendOtpResponse(false, "Please wait " + remainingSeconds + " seconds before requesting another OTP.", e164, remainingSeconds, null);
            }
        }

        // Generate 6-digit cryptographic OTP
        int otpCode = 100000 + secureRandom.nextInt(900000);
        String otpString = String.valueOf(otpCode);

        // Generate Salt & SHA-256 Hash
        byte[] saltBytes = new byte[16];
        secureRandom.nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);
        String otpHash = hashOtp(otpString, salt);

        PhoneOtpVerification verification = new PhoneOtpVerification(
                UUID.randomUUID().toString(),
                userId,
                e164,
                otpHash,
                salt,
                0,
                now + OTP_EXPIRY_MS,
                now,
                now
        );
        otpRepo.save(verification);

        logger.info("Generated OTP for phone: {} (Masked: {}) - Expires in 5 minutes",
                phoneNormalizer.maskPhoneNumber(e164), "***" + otpString.substring(3));

        // Mock SMS provider log
        logger.info("[SMS-GATEWAY-MOCK] Sending SMS to {}: Your ZeroNet verification code is {}", e164, otpString);

        return new SendOtpResponse(
                true,
                "Verification code sent successfully to " + phoneNormalizer.maskPhoneNumber(e164),
                e164,
                30,
                devReturnOtp ? otpString : null
        );
    }

    /**
     * Verifies the submitted OTP code.
     */
    @Transactional
    public VerifyOtpResponse verifyOtp(String userId, String rawPhoneNumber, String submittedOtp, String displayName) {
        if (submittedOtp == null || submittedOtp.trim().length() != 6) {
            return new VerifyOtpResponse(false, "Please enter a valid 6-digit verification code.", null, false, userId);
        }

        PhoneNumberNormalizationService.NormalizedPhone norm = phoneNormalizer.normalize(rawPhoneNumber, "IN");
        if (!norm.isValid()) {
            return new VerifyOtpResponse(false, "Invalid phone number format.", null, false, userId);
        }

        String e164 = norm.e164();
        long now = System.currentTimeMillis();

        Optional<PhoneOtpVerification> optVerification = otpRepo.findTopByPhoneNumberE164OrderByCreatedAtDesc(e164);
        if (optVerification.isEmpty()) {
            return new VerifyOtpResponse(false, "No verification request found for this phone number. Please request a new OTP.", e164, false, userId);
        }

        PhoneOtpVerification verification = optVerification.get();

        if (now > verification.getExpiresAt()) {
            return new VerifyOtpResponse(false, "Verification code has expired. Please request a new code.", e164, false, userId);
        }

        if (verification.getAttempts() >= MAX_ATTEMPTS) {
            return new VerifyOtpResponse(false, "Too many failed attempts. Please request a new code.", e164, false, userId);
        }

        // Check hash
        String computedHash = hashOtp(submittedOtp.trim(), verification.getSalt());
        if (!computedHash.equals(verification.getOtpHash())) {
            verification.setAttempts(verification.getAttempts() + 1);
            otpRepo.save(verification);
            int remaining = MAX_ATTEMPTS - verification.getAttempts();
            return new VerifyOtpResponse(false, "Incorrect verification code. " + remaining + " attempt(s) remaining.", e164, false, userId);
        }

        // Verified successfully! Register / update UserPhoneAccount
        Optional<UserPhoneAccount> userAcc = phoneAccountRepo.findByUserId(userId);
        UserPhoneAccount account = userAcc.orElseGet(() -> {
            UserPhoneAccount acc = new UserPhoneAccount();
            acc.setId(UUID.randomUUID().toString());
            acc.setUserId(userId);
            acc.setCreatedAt(now);
            return acc;
        });

        account.setPhoneNumberE164(e164);
        account.setCountryCode(norm.countryCode());
        if (displayName != null && !displayName.isBlank()) {
            account.setDisplayName(displayName.trim());
        }
        account.setVerified(true);
        account.setVerifiedAt(now);
        account.setUpdatedAt(now);
        phoneAccountRepo.save(account);

        // Clean up OTP records
        otpRepo.deleteByPhoneNumberE164(e164);

        logger.info("Successfully verified phone ownership for user {} -> {}", userId, phoneNormalizer.maskPhoneNumber(e164));
        return new VerifyOtpResponse(true, "Mobile number successfully verified and linked!", e164, true, userId);
    }

    public Optional<UserPhoneStatusDto> getPhoneStatus(String userId) {
        return phoneAccountRepo.findByUserId(userId)
                .map(acc -> new UserPhoneStatusDto(
                        acc.getUserId(),
                        acc.getPhoneNumberE164(),
                        acc.getCountryCode(),
                        acc.getDisplayName(),
                        acc.isVerified(),
                        acc.getVerifiedAt()
                ));
    }

    @Transactional
    public boolean unlinkPhone(String userId) {
        Optional<UserPhoneAccount> acc = phoneAccountRepo.findByUserId(userId);
        if (acc.isPresent()) {
            phoneAccountRepo.delete(acc.get());
            logger.info("Unlinked phone for user {}", userId);
            return true;
        }
        return false;
    }

    private String hashOtp(String otp, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
