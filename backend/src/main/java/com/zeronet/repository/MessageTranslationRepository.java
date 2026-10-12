package com.zeronet.repository;

import com.zeronet.model.MessageTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageTranslationRepository extends JpaRepository<MessageTranslation, String> {
    Optional<MessageTranslation> findByMessageIdAndTargetLanguageAndTranslationVersion(String messageId, String targetLanguage, String translationVersion);

    List<MessageTranslation> findByMessageId(String messageId);

    void deleteByMessageId(String messageId);
}
