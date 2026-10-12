package com.zeronet.repository;

import com.zeronet.model.PhoneOtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhoneOtpVerificationRepository extends JpaRepository<PhoneOtpVerification, String> {
    Optional<PhoneOtpVerification> findTopByPhoneNumberE164OrderByCreatedAtDesc(String phoneNumberE164);
    Optional<PhoneOtpVerification> findTopByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByPhoneNumberE164(String phoneNumberE164);
}
