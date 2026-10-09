package com.zeronet.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

@Service
public class MdnsService {

    private static final Logger logger = LoggerFactory.getLogger(MdnsService.class);

    @Value("${server.port:3001}")
    private int port;

    private JmDNS jmDNS;
    private ServiceInfo serviceInfo;

    @PostConstruct
    public void start() {
        try {
            InetAddress localHost = InetAddress.getLocalHost();
            jmDNS = JmDNS.create(localHost);

            Map<String, String> props = new HashMap<>();
            props.put("path", "/");
            props.put("protocol", "http");

            serviceInfo = ServiceInfo.create(
                    "_zeronet._tcp.local.",
                    "Zeronet",
                    port,
                    0,
                    0,
                    props
            );

            jmDNS.registerService(serviceInfo);
            logger.info("mDNS/Bonjour: Zeronet service advertised on port {} at {}", port, localHost.getHostAddress());
        } catch (IOException e) {
            logger.warn("mDNS/Bonjour registration failed (continuing without mDNS): {}", e.getMessage());
        }
    }

    @PreDestroy
    public void stop() {
        if (jmDNS != null) {
            try {
                if (serviceInfo != null) {
                    jmDNS.unregisterService(serviceInfo);
                }
                jmDNS.close();
                logger.info("mDNS/Bonjour service stopped.");
            } catch (Exception e) {
                logger.warn("Error stopping JmDNS: {}", e.getMessage());
            }
        }
    }
}
