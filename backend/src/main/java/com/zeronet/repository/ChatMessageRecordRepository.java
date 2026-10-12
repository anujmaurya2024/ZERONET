package com.zeronet.repository;

import com.zeronet.model.ChatMessageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRecordRepository extends JpaRepository<ChatMessageRecord, String> {
    List<ChatMessageRecord> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
