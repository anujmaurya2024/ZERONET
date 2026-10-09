package com.zeronet.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zeronet.model.ConnectedPeer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(SignalingWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map of session ID (socketId) -> ConnectedPeer
    private final Map<String, ConnectedPeer> connectedPeers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String socketId = session.getId();
        logger.info("New WebSocket connection: {}", socketId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            if (!root.has("event")) {
                return;
            }

            String event = root.get("event").asText();
            JsonNode data = root.get("data");
            String socketId = session.getId();

            switch (event) {
                case "register" -> handleRegister(session, socketId, data);
                case "get-online-devices" -> handleGetOnlineDevices(session, socketId);
                case "request-connection" -> handleRequestConnection(session, socketId, data);
                case "connection-accepted" -> handleConnectionAccepted(session, socketId, data);
                case "connection-rejected" -> handleConnectionRejected(session, socketId, data);
                case "webrtc-offer" -> handleWebRtcOffer(session, socketId, data);
                case "webrtc-answer" -> handleWebRtcAnswer(session, socketId, data);
                case "webrtc-ice-candidate" -> handleWebRtcIceCandidate(session, socketId, data);
                case "peer-message" -> handlePeerMessage(session, socketId, data);
                default -> logger.warn("Unhandled event: {}", event);
            }
        } catch (Exception e) {
            logger.error("Error processing WebSocket message", e);
        }
    }

    private void handleRegister(WebSocketSession session, String socketId, JsonNode data) {
        String deviceId = data.has("deviceId") ? data.get("deviceId").asText() : socketId;
        String deviceName = data.has("deviceName") ? data.get("deviceName").asText() : "Unknown Device";

        ConnectedPeer peer = new ConnectedPeer(socketId, deviceId, deviceName, session);
        connectedPeers.put(socketId, peer);

        logger.info("Device registered: {} ({}) with socketId {}", deviceName, deviceId, socketId);

        // Broadcast device-online to everyone else
        ObjectNode broadcastData = objectMapper.createObjectNode();
        broadcastData.put("deviceId", deviceId);
        broadcastData.put("deviceName", deviceName);
        broadcastData.put("socketId", socketId);
        broadcast("device-online", broadcastData, socketId);
    }

    private void handleGetOnlineDevices(WebSocketSession session, String socketId) {
        ArrayNode devicesArray = objectMapper.createArrayNode();

        for (Map.Entry<String, ConnectedPeer> entry : connectedPeers.entrySet()) {
            if (!entry.getKey().equals(socketId)) {
                ConnectedPeer peer = entry.getValue();
                ObjectNode deviceObj = objectMapper.createObjectNode();
                deviceObj.put("socketId", peer.getSocketId());
                deviceObj.put("deviceId", peer.getDeviceId());
                deviceObj.put("deviceName", peer.getDeviceName());
                devicesArray.add(deviceObj);
            }
        }

        sendToSession(session, "online-devices", devicesArray);
    }

    private void handleRequestConnection(WebSocketSession session, String fromSocketId, JsonNode data) {
        String fromDeviceId = data.has("fromDeviceId") ? data.get("fromDeviceId").asText() : "";
        String fromDeviceName = data.has("fromDeviceName") ? data.get("fromDeviceName").asText() : "";
        String toDeviceId = data.has("toDeviceId") ? data.get("toDeviceId").asText() : "";

        ConnectedPeer target = null;
        for (ConnectedPeer p : connectedPeers.values()) {
            if (toDeviceId.equals(p.getDeviceId())) {
                target = p;
                break;
            }
        }

        if (target != null && target.getSession().isOpen()) {
            ObjectNode forward = objectMapper.createObjectNode();
            forward.put("fromDeviceId", fromDeviceId);
            forward.put("fromDeviceName", fromDeviceName);
            forward.put("fromSocketId", fromSocketId);
            sendToSession(target.getSession(), "connection-request", forward);
        } else {
            ObjectNode error = objectMapper.createObjectNode();
            error.put("message", "Device not found");
            sendToSession(session, "connection-error", error);
        }
    }

    private void handleConnectionAccepted(WebSocketSession session, String socketId, JsonNode data) {
        String fromSocketId = data.has("fromSocketId") ? data.get("fromSocketId").asText() : "";
        String toDeviceId = data.has("toDeviceId") ? data.get("toDeviceId").asText() : "";

        ConnectedPeer current = connectedPeers.get(socketId);
        String currentDeviceName = current != null ? current.getDeviceName() : "Unknown Device";
        if (toDeviceId.isEmpty() && current != null) {
            toDeviceId = current.getDeviceId();
        }

        ConnectedPeer target = connectedPeers.get(fromSocketId);
        if (target == null && data.has("targetDeviceId")) {
            String targetDeviceId = data.get("targetDeviceId").asText();
            for (ConnectedPeer p : connectedPeers.values()) {
                if (targetDeviceId.equals(p.getDeviceId())) {
                    target = p;
                    break;
                }
            }
        }

        if (target != null && target.getSession().isOpen()) {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("toSocketId", socketId);
            payload.put("toDeviceId", toDeviceId);
            payload.put("toDeviceName", currentDeviceName);
            sendToSession(target.getSession(), "connection-accepted", payload);
            logger.info("Connection accepted from {} ({}) sent to {} ({})",
                    socketId, toDeviceId, target.getSocketId(), target.getDeviceId());
        } else {
            logger.warn("Target not found for connection-accepted fromSocketId: {}", fromSocketId);
        }
    }

    private void handleConnectionRejected(WebSocketSession session, String socketId, JsonNode data) {
        String fromSocketId = data.has("fromSocketId") ? data.get("fromSocketId").asText() : "";
        ConnectedPeer target = connectedPeers.get(fromSocketId);
        if (target != null && target.getSession().isOpen()) {
            sendToSession(target.getSession(), "connection-rejected", null);
        }
    }

    private ConnectedPeer findTargetPeer(JsonNode data, String toSocketId) {
        ConnectedPeer target = connectedPeers.get(toSocketId);
        if (target == null && data != null && data.has("toDeviceId")) {
            String toDeviceId = data.get("toDeviceId").asText();
            for (ConnectedPeer p : connectedPeers.values()) {
                if (toDeviceId.equals(p.getDeviceId())) {
                    return p;
                }
            }
        }
        return target;
    }

    private void handleWebRtcOffer(WebSocketSession session, String socketId, JsonNode data) {
        String toSocketId = data.has("toSocketId") ? data.get("toSocketId").asText() : "";
        ConnectedPeer target = findTargetPeer(data, toSocketId);
        if (target != null && target.getSession().isOpen()) {
            ObjectNode forward = objectMapper.createObjectNode();
            forward.put("fromSocketId", socketId);
            if (data.has("toDeviceId")) {
                forward.put("toDeviceId", data.get("toDeviceId").asText());
            }
            forward.set("offer", data.get("offer"));
            sendToSession(target.getSession(), "webrtc-offer", forward);
            logger.info("webrtc-offer relayed from {} to {}", socketId, target.getSocketId());
        } else {
            logger.warn("Target not found for webrtc-offer (toSocketId: {})", toSocketId);
        }
    }

    private void handleWebRtcAnswer(WebSocketSession session, String socketId, JsonNode data) {
        String toSocketId = data.has("toSocketId") ? data.get("toSocketId").asText() : "";
        ConnectedPeer target = findTargetPeer(data, toSocketId);
        if (target != null && target.getSession().isOpen()) {
            ObjectNode forward = objectMapper.createObjectNode();
            forward.put("fromSocketId", socketId);
            if (data.has("toDeviceId")) {
                forward.put("toDeviceId", data.get("toDeviceId").asText());
            }
            forward.set("answer", data.get("answer"));
            sendToSession(target.getSession(), "webrtc-answer", forward);
            logger.info("webrtc-answer relayed from {} to {}", socketId, target.getSocketId());
        } else {
            logger.warn("Target not found for webrtc-answer (toSocketId: {})", toSocketId);
        }
    }

    private void handleWebRtcIceCandidate(WebSocketSession session, String socketId, JsonNode data) {
        String toSocketId = data.has("toSocketId") ? data.get("toSocketId").asText() : "";
        ConnectedPeer target = findTargetPeer(data, toSocketId);
        if (target != null && target.getSession().isOpen()) {
            ObjectNode forward = objectMapper.createObjectNode();
            forward.put("fromSocketId", socketId);
            if (data.has("toDeviceId")) {
                forward.put("toDeviceId", data.get("toDeviceId").asText());
            }
            forward.set("candidate", data.get("candidate"));
            sendToSession(target.getSession(), "webrtc-ice-candidate", forward);
        } else {
            logger.warn("Target not found for webrtc-ice-candidate (toSocketId: {})", toSocketId);
        }
    }

    private void handlePeerMessage(WebSocketSession session, String socketId, JsonNode data) {
        String toSocketId = data.has("toSocketId") ? data.get("toSocketId").asText() : "";
        ConnectedPeer target = findTargetPeer(data, toSocketId);
        if (target != null && target.getSession().isOpen()) {
            ObjectNode forward = objectMapper.createObjectNode();
            forward.put("fromSocketId", socketId);
            if (data.has("fromDeviceId")) {
                forward.put("fromDeviceId", data.get("fromDeviceId").asText());
            }
            if (data.has("data")) {
                forward.set("data", data.get("data"));
            }
            sendToSession(target.getSession(), "peer-message", forward);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String socketId = session.getId();
        ConnectedPeer peer = connectedPeers.remove(socketId);
        if (peer != null) {
            logger.info("Device disconnected: {} ({}) with socketId {}", peer.getDeviceName(), peer.getDeviceId(), socketId);
            ObjectNode offlineData = objectMapper.createObjectNode();
            offlineData.put("deviceId", peer.getDeviceId());
            offlineData.put("socketId", socketId);
            broadcast("device-offline", offlineData, socketId);
        }
    }

    private void broadcast(String event, JsonNode data, String excludeSocketId) {
        for (Map.Entry<String, ConnectedPeer> entry : connectedPeers.entrySet()) {
            if (!entry.getKey().equals(excludeSocketId)) {
                sendToSession(entry.getValue().getSession(), event, data);
            }
        }
    }

    private void sendToSession(WebSocketSession session, String event, JsonNode data) {
        if (session != null && session.isOpen()) {
            try {
                ObjectNode msg = objectMapper.createObjectNode();
                msg.put("event", event);
                if (data != null) {
                    msg.set("data", data);
                }
                String payload = objectMapper.writeValueAsString(msg);
                synchronized (session) {
                    session.sendMessage(new TextMessage(payload));
                }
            } catch (IOException e) {
                logger.error("Failed to send message to session {}", session.getId(), e);
            }
        }
    }
}
