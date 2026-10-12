package com.zeronet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "phone_otp_verifications")
public class PhoneOtpVerification {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "phone_number_e164", length = 30, nullable = false)
    private String phoneNumberE164;

    @Column(name = "otp_hash", length = 128, nullable = false)
    private String otpHash;

    @Column(name = "salt", length = 64, nullable = false)
    private String salt;

    @Column(name = "attempts", nullable = false)
    private int attempts = 0;

    @Column(name = "expires_at", nullable = false)
    private long expiresAt;

    @Column(name = "last_sent_at", nullable = false)
    private long lastSentAt;

    @Column(name = "created_at", nullable = false)
    private long createdAt;

    public PhoneOtpVerification() {
    }

    public PhoneOtpVerification(String id, String userId, String phoneNumberE164, String otpHash, String salt, int attempts, long expiresAt, long lastSentAt, long createdAt) {
        this.id = id;
        this.userId = userId;
        this.phoneNumberE164 = phoneNumberE164;
        this.otpHash = otpHash;
        this.salt = salt;
        this.attempts = attempts;
        this.expiresAt = expiresAt;
        this.lastSentAt = lastSentAt;
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

    public String getPhoneNumberE164() {
        return phoneNumberE164;
    }

    public void setPhoneNumberE164(String phoneNumberE164) {
        this.phoneNumberE164 = phoneNumberE164;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }

    public long getLastSentAt() {
        return lastSentAt;
    }

    public void setLastSentAt(long lastSentAt) {
        this.lastSentAt = lastSentAt;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
