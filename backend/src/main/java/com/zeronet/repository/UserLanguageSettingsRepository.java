package com.zeronet.repository;

import com.zeronet.model.UserLanguageSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLanguageSettingsRepository extends JpaRepository<UserLanguageSettings, String> {
}
