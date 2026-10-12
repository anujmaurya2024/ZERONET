package com.zeronet.dto;

public class UserSearchResultDto {
    private String userId;
    private String displayName;
    private String phoneNumber; // May be masked (e.g. +91 98765 ***10) if privacy setting requires
    private boolean isOnline;
    private boolean isContact;
    private boolean canMessage;
    private String avatarColor;

    public UserSearchResultDto() {}

    public UserSearchResultDto(String userId, String displayName, String phoneNumber, boolean isOnline, boolean isContact, boolean canMessage, String avatarColor) {
        this.userId = userId;
        this.displayName = displayName;
        this.phoneNumber = phoneNumber;
        this.isOnline = isOnline;
        this.isContact = isContact;
        this.canMessage = canMessage;
        this.avatarColor = avatarColor;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public boolean isContact() {
        return isContact;
    }

    public void setContact(boolean contact) {
        isContact = contact;
    }

    public boolean isCanMessage() {
        return canMessage;
    }

    public void setCanMessage(boolean canMessage) {
        this.canMessage = canMessage;
    }

    public String getAvatarColor() {
        return avatarColor;
    }

    public void setAvatarColor(String avatarColor) {
        this.avatarColor = avatarColor;
    }
}
