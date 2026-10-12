package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "direct_conversations", uniqueConstraints = {
        @UniqueConstraint(name = "uq_direct_pair", columnNames = {"user_one_id", "user_two_id"})
})
public class DirectConversation {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_one_id", length = 64, nullable = false)
    private String userOneId;

    @Column(name = "user_two_id", length = 64, nullable = false)
    private String userTwoId;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    @Column(name = "updated_at", nullable = false)
    private long updatedAt;

    public DirectConversation() {
    }

    public DirectConversation(String id, String userOneId, String userTwoId, long createdAt, long updatedAt) {
        this.id = id;
        this.userOneId = userOneId;
        this.userTwoId = userTwoId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserOneId() {
        return userOneId;
    }

    public void setUserOneId(String userOneId) {
        this.userOneId = userOneId;
    }

    public String getUserTwoId() {
        return userTwoId;
    }

    public void setUserTwoId(String userTwoId) {
        this.userTwoId = userTwoId;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
