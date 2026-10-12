package com.zeronet.dto;

public class DirectConversationRequest {
    private String targetUserId;

    public DirectConversationRequest() {}

    public DirectConversationRequest(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }
}
