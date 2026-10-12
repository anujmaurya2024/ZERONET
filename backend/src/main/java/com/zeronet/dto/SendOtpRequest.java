package com.zeronet.dto;

public class SendOtpRequest {
    private String phoneNumber;
    private String defaultCountryCode = "IN";

    public SendOtpRequest() {}

    public SendOtpRequest(String phoneNumber, String defaultCountryCode) {
        this.phoneNumber = phoneNumber;
        this.defaultCountryCode = defaultCountryCode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDefaultCountryCode() {
        return defaultCountryCode;
    }

    public void setDefaultCountryCode(String defaultCountryCode) {
        this.defaultCountryCode = defaultCountryCode;
    }
}
