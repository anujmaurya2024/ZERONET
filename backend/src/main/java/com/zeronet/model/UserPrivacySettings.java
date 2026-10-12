package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_privacy_settings")
public class UserPrivacySettings {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "discovery_visibility", length = 20, nullable = false)
    private String discoveryVisibility = "EVERYONE"; // EVERYONE, CONTACTS, NOBODY

    @Column(name = "phone_visibility", length = 20, nullable = false)
    private String phoneVisibility = "CONTACTS"; // EVERYONE, CONTACTS, NOBODY

    @Column(name = "allow_contact_discovery", nullable = false)
    private boolean allowContactDiscovery = true;

    @Column(name = "allow_message_requests", nullable = false)
    private boolean allowMessageRequests = true;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    @Column(name = "updated_at", nullable = false)
    private long updatedAt;

    public UserPrivacySettings() {
    }

    public UserPrivacySettings(String userId, String discoveryVisibility, String phoneVisibility, boolean allowContactDiscovery, boolean allowMessageRequests, long createdAt, long updatedAt) {
        this.userId = userId;
        this.discoveryVisibility = discoveryVisibility;
        this.phoneVisibility = phoneVisibility;
        this.allowContactDiscovery = allowContactDiscovery;
        this.allowMessageRequests = allowMessageRequests;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDiscoveryVisibility() {
        return discoveryVisibility;
    }

    public void setDiscoveryVisibility(String discoveryVisibility) {
        this.discoveryVisibility = discoveryVisibility;
    }

    public String getPhoneVisibility() {
        return phoneVisibility;
    }

    public void setPhoneVisibility(String phoneVisibility) {
        this.phoneVisibility = phoneVisibility;
    }

    public boolean isAllowContactDiscovery() {
        return allowContactDiscovery;
    }

    public void setAllowContactDiscovery(boolean allowContactDiscovery) {
        this.allowContactDiscovery = allowContactDiscovery;
    }

    public boolean isAllowMessageRequests() {
        return allowMessageRequests;
    }

    public void setAllowMessageRequests(boolean allowMessageRequests) {
        this.allowMessageRequests = allowMessageRequests;
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
