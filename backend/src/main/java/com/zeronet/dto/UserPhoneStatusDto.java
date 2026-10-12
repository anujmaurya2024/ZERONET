package com.zeronet.dto;

public class UserPhoneStatusDto {
    private String userId;
    private String phoneNumberE164;
    private String countryCode;
    private String displayName;
    private boolean isVerified;
    private Long verifiedAt;

    public UserPhoneStatusDto() {}

    public UserPhoneStatusDto(String userId, String phoneNumberE164, String countryCode, String displayName, boolean isVerified, Long verifiedAt) {
        this.userId = userId;
        this.phoneNumberE164 = phoneNumberE164;
        this.countryCode = countryCode;
        this.displayName = displayName;
        this.isVerified = isVerified;
        this.verifiedAt = verifiedAt;
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
}
