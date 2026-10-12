package com.zeronet.dto;

public class BlockUserRequest {
    private String targetUserId;
    private String reason;

    public BlockUserRequest() {}

    public BlockUserRequest(String targetUserId, String reason) {
        this.targetUserId = targetUserId;
        this.reason = reason;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
