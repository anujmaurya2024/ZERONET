package com.zeronet.repository;

import com.zeronet.model.UserPhoneAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPhoneAccountRepository extends JpaRepository<UserPhoneAccount, String> {
    Optional<UserPhoneAccount> findByUserId(String userId);
    Optional<UserPhoneAccount> findByPhoneNumberE164(String phoneNumberE164);
    Optional<UserPhoneAccount> findByPhoneNumberE164AndIsVerifiedTrue(String phoneNumberE164);
    boolean existsByPhoneNumberE164AndIsVerifiedTrue(String phoneNumberE164);
}
