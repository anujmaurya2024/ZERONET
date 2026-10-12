package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_blocks", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_block", columnNames = {"user_id", "blocked_user_id"})
})
public class UserBlock {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "blocked_user_id", length = 64, nullable = false)
    private String blockedUserId;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    public UserBlock() {
    }

    public UserBlock(String id, String userId, String blockedUserId, String reason, long createdAt) {
        this.id = id;
        this.userId = userId;
        this.blockedUserId = blockedUserId;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBlockedUserId() {
        return blockedUserId;
    }

    public void setBlockedUserId(String blockedUserId) {
        this.blockedUserId = blockedUserId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
