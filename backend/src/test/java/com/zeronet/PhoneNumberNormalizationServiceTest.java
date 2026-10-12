package com.zeronet;

import com.zeronet.service.PhoneNumberNormalizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PhoneNumberNormalizationServiceTest {

    private PhoneNumberNormalizationService service;

    @BeforeEach
    void setUp() {
        service = new PhoneNumberNormalizationService();
    }

    @Test
    void testValidIndianNumberE164() {
        var result = service.normalize("+919876543210", "IN");
        assertTrue(result.isValid());
        assertEquals("+919876543210", result.e164());
        assertEquals("+91", result.countryCode());
        assertEquals("IN", result.regionCode());
    }

    @Test
    void test10DigitIndianNumberWithDefaultRegion() {
        var result = service.normalize("9876543210", "IN");
        assertTrue(result.isValid());
        assertEquals("+919876543210", result.e164());
        assertEquals("+91", result.countryCode());
    }

    @Test
    void testInternationalUSNumber() {
        var result = service.normalize("+12025550143", "US");
        assertTrue(result.isValid());
        assertEquals("+12025550143", result.e164());
        assertEquals("+1", result.countryCode());
        assertEquals("US", result.regionCode());
    }

    @Test
    void testInvalidNumber() {
        var result = service.normalize("12345", "IN");
        assertFalse(result.isValid());
        assertNull(result.e164());
    }

    @Test
    void testPhoneNumberMasking() {
        String masked = service.maskPhoneNumber("+919876543210");
        assertTrue(masked.contains("***"));
        assertTrue(masked.startsWith("+91987"));
        assertTrue(masked.endsWith("10"));
    }
}
