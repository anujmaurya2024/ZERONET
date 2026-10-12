package com.zeronet.dto;

public class DirectConversationResponse {
    private String conversationId;
    private String userOneId;
    private String userTwoId;
    private String peerId;
    private String peerName;
    private boolean isExisting;

    public DirectConversationResponse() {}

    public DirectConversationResponse(String conversationId, String userOneId, String userTwoId, String peerId, String peerName, boolean isExisting) {
        this.conversationId = conversationId;
        this.userOneId = userOneId;
        this.userTwoId = userTwoId;
        this.peerId = peerId;
        this.peerName = peerName;
        this.isExisting = isExisting;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getUserOneId() {
        return userOneId;
    }

    public void setUserOneId(String userOneId) {
        this.userOneId = userOneId;
    }

    public String getUserTwoId() {
        return userTwoId;
    }

    public void setUserTwoId(String userTwoId) {
        this.userTwoId = userTwoId;
    }

    public String getPeerId() {
        return peerId;
    }

    public void setPeerId(String peerId) {
        this.peerId = peerId;
    }

    public String getPeerName() {
        return peerName;
    }

    public void setPeerName(String peerName) {
        this.peerName = peerName;
    }

    public boolean isExisting() {
        return isExisting;
    }

    public void setExisting(boolean existing) {
        isExisting = existing;
    }
}
