package com.zeronet.controller;

import com.zeronet.model.DeviceInfo;
import com.zeronet.service.DeviceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final DeviceService deviceService;

    public ApiController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping("/info")
    public DeviceInfo getInfo() {
        return new DeviceInfo(deviceService.getDeviceId(), deviceService.getDeviceName());
    }

    @GetMapping("/discover")
    public DeviceInfo getDiscover() {
        return getInfo();
    }
}
