package com.zeronet.dto;

public class VerifyOtpResponse {
    private boolean success;
    private String message;
    private String phoneNumberE164;
    private boolean isVerified;
    private String userId;

    public VerifyOtpResponse() {}

    public VerifyOtpResponse(boolean success, String message, String phoneNumberE164, boolean isVerified, String userId) {
        this.success = success;
        this.message = message;
        this.phoneNumberE164 = phoneNumberE164;
        this.isVerified = isVerified;
        this.userId = userId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPhoneNumberE164() {
        return phoneNumberE164;
    }

    public void setPhoneNumberE164(String phoneNumberE164) {
        this.phoneNumberE164 = phoneNumberE164;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
