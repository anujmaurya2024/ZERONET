package com.zeronet.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_messages_conversation", columnList = "conversation_id"),
    @Index(name = "idx_messages_sender", columnList = "sender_id"),
    @Index(name = "idx_messages_created", columnList = "created_at")
})
public class ChatMessageRecord {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "conversation_id", length = 64, nullable = false)
    private String conversationId;

    @Column(name = "sender_id", length = 64, nullable = false)
    private String senderId;

    @Column(name = "original_content", columnDefinition = "TEXT", nullable = false)
    private String originalContent;

    @Column(name = "original_language", length = 10, nullable = false)
    private String originalLanguage = "en";

    @Column(name = "message_type", length = 20, nullable = false)
    private String messageType = "text";

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    @Column(name = "edited_at")
    private Long editedAt;

    @Column(name = "deleted_at")
    private Long deletedAt;

    public ChatMessageRecord() {
    }

    public ChatMessageRecord(String id, String conversationId, String senderId, String originalContent, String originalLanguage, String messageType, long createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.originalContent = originalContent;
        this.originalLanguage = originalLanguage != null ? originalLanguage : "en";
        this.messageType = messageType != null ? messageType : "text";
        this.createdAt = createdAt > 0 ? createdAt : System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getEditedAt() {
        return editedAt;
    }

    public void setEditedAt(Long editedAt) {
        this.editedAt = editedAt;
    }

    public Long getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Long deletedAt) {
        this.deletedAt = deletedAt;
    }
}
