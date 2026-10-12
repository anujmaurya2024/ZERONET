package com.zeronet.repository;

import com.zeronet.model.TechnicalTermExplanation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnicalTermExplanationRepository extends JpaRepository<TechnicalTermExplanation, String> {
    Optional<TechnicalTermExplanation> findByMessageIdAndTargetLanguage(String messageId, String targetLanguage);
}
