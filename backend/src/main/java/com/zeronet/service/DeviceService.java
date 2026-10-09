package com.zeronet.service;

import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.UUID;

@Service
public class DeviceService {

    private final String deviceId;
    private final String deviceName;

    public DeviceService() {
        this.deviceId = UUID.randomUUID().toString();
        this.deviceName = resolveDeviceName();
    }

    private String resolveDeviceName() {
        try {
            String host = InetAddress.getLocalHost().getHostName();
            if (host != null && !host.trim().isEmpty()) {
                return host;
            }
        } catch (Exception ignored) {
        }
        return "Zeronet Device";
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }
}
