package com.zeronet.dto;

public class ContactItemDto {
    private String name;
    private String phoneNumber;
    private boolean isRegistered;
    private String userId;

    public ContactItemDto() {}

    public ContactItemDto(String name, String phoneNumber, boolean isRegistered, String userId) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.isRegistered = isRegistered;
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isRegistered() {
        return isRegistered;
    }

    public void setRegistered(boolean registered) {
        isRegistered = registered;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
