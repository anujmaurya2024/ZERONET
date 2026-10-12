package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_contacts", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_contact", columnNames = {"user_id", "contact_phone_e164"})
})
public class UserContact {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "contact_phone_e164", length = 30, nullable = false)
    private String contactPhoneE164;

    @Column(name = "contact_name", length = 100, nullable = false)
    private String contactName;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    public UserContact() {
    }

    public UserContact(String id, String userId, String contactPhoneE164, String contactName, long createdAt) {
        this.id = id;
        this.userId = userId;
        this.contactPhoneE164 = contactPhoneE164;
        this.contactName = contactName;
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

    public String getContactPhoneE164() {
        return contactPhoneE164;
    }

    public void setContactPhoneE164(String contactPhoneE164) {
        this.contactPhoneE164 = contactPhoneE164;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
