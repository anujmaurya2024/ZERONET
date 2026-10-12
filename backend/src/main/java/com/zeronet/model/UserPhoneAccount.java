package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_phone_accounts")
public class UserPhoneAccount {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false, unique = true)
    private String userId;

    @Column(name = "phone_number_e164", length = 30, nullable = false, unique = true)
    private String phoneNumberE164;

    @Column(name = "country_code", length = 10, nullable = false)
    private String countryCode = "+91";

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "verified_at")
    private Long verifiedAt;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    @Column(name = "updated_at", nullable = false)
    private long updatedAt;

    public UserPhoneAccount() {
    }

    public UserPhoneAccount(String id, String userId, String phoneNumberE164, String countryCode, String displayName, boolean isVerified, Long verifiedAt, long createdAt, long updatedAt) {
        this.id = id;
        this.userId = userId;
        this.phoneNumberE164 = phoneNumberE164;
        this.countryCode = countryCode;
        this.displayName = displayName;
        this.isVerified = isVerified;
        this.verifiedAt = verifiedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getPhoneNumberE164() {
        return phoneNumberE164;
    }

    public void setPhoneNumberE164(String phoneNumberE164) {
        this.phoneNumberE164 = phoneNumberE164;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public Long getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Long verifiedAt) {
        this.verifiedAt = verifiedAt;
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
