package com.zeronet.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Service;

@Service
public class PhoneNumberNormalizationService {

    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    public record NormalizedPhone(String e164, String countryCode, String regionCode, boolean isValid) {}

    /**
     * Parses and normalizes a phone number to standard E.164 format (+919876543210).
     */
    public NormalizedPhone normalize(String rawNumber, String defaultRegion) {
        if (rawNumber == null || rawNumber.trim().isEmpty()) {
            return new NormalizedPhone(null, null, null, false);
        }

        String cleaned = rawNumber.trim();
        String region = (defaultRegion != null && !defaultRegion.isBlank()) ? defaultRegion.toUpperCase() : "IN";

        // If the number starts with "+", phoneUtil handles the country code directly
        try {
            Phonenumber.PhoneNumber parsedNumber = phoneUtil.parse(cleaned, region);
            boolean isValid = phoneUtil.isValidNumber(parsedNumber);

            if (isValid) {
                String e164 = phoneUtil.format(parsedNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
                String countryCode = "+" + parsedNumber.getCountryCode();
                String resolvedRegion = phoneUtil.getRegionCodeForNumber(parsedNumber);
                return new NormalizedPhone(e164, countryCode, resolvedRegion, true);
            }
        } catch (NumberParseException ignored) {
        }

        // Fallback cleanup if user provided only 10 digits for Indian number e.g. 9876543210
        String digitsOnly = cleaned.replaceAll("[^0-9+]", "");
        if (digitsOnly.length() == 10 && !digitsOnly.startsWith("+")) {
            try {
                Phonenumber.PhoneNumber parsedNumber = phoneUtil.parse("+91" + digitsOnly, "IN");
                if (phoneUtil.isValidNumber(parsedNumber)) {
                    String e164 = phoneUtil.format(parsedNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
                    return new NormalizedPhone(e164, "+91", "IN", true);
                }
            } catch (NumberParseException ignored) {
            }
        }

        return new NormalizedPhone(null, null, null, false);
    }

    /**
     * Safely masks a phone number for privacy (e.g. +91 98765 ***10).
     */
    public String maskPhoneNumber(String e164) {
        if (e164 == null || e164.length() < 7) {
            return "***";
        }
        int len = e164.length();
        String prefix = e164.substring(0, Math.min(6, len - 4));
        String suffix = e164.substring(len - 2);
        return prefix + " ***" + suffix;
    }
}
