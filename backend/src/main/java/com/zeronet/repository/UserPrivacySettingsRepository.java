package com.zeronet.repository;

import com.zeronet.model.UserPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPrivacySettingsRepository extends JpaRepository<UserPrivacySettings, String> {
    Optional<UserPrivacySettings> findByUserId(String userId);
}
