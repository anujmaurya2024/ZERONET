package com.zeronet.dto;

public class VerifyOtpRequest {
    private String phoneNumber;
    private String otp;
    private String displayName;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String phoneNumber, String otp, String displayName) {
        this.phoneNumber = phoneNumber;
        this.otp = otp;
        this.displayName = displayName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
