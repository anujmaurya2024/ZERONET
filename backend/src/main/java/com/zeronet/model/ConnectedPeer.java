package com.zeronet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.web.socket.WebSocketSession;

public class ConnectedPeer {
    private String socketId;
    private String deviceId;
    private String deviceName;

    @JsonIgnore
    private WebSocketSession session;

    public ConnectedPeer() {}

    public ConnectedPeer(String socketId, String deviceId, String deviceName, WebSocketSession session) {
        this.socketId = socketId;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.session = session;
    }

    public String getSocketId() {
        return socketId;
    }

    public void setSocketId(String socketId) {
        this.socketId = socketId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public void setSession(WebSocketSession session) {
        this.session = session;
    }
}
