package com.zeronet.dto;

public class SendOtpResponse {
    private boolean success;
    private String message;
    private String phoneNumberE164;
    private int cooldownSeconds;
    private String devOtp; // Provided for convenience in dev/test environment

    public SendOtpResponse() {}

    public SendOtpResponse(boolean success, String message, String phoneNumberE164, int cooldownSeconds, String devOtp) {
        this.success = success;
        this.message = message;
        this.phoneNumberE164 = phoneNumberE164;
        this.cooldownSeconds = cooldownSeconds;
        this.devOtp = devOtp;
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

    public int getCooldownSeconds() {
        return cooldownSeconds;
    }

    public void setCooldownSeconds(int cooldownSeconds) {
        this.cooldownSeconds = cooldownSeconds;
    }

    public String getDevOtp() {
        return devOtp;
    }

    public void setDevOtp(String devOtp) {
        this.devOtp = devOtp;
    }
}
