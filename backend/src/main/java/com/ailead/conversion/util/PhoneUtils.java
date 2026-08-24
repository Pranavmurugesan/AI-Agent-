package com.ailead.conversion.util;

import java.util.Locale;

/**
 * Utility for Indian and international phone number normalization and validation.
 * Normalizes equivalent phone representations (e.g. "+91 9876543210", "09876543210", "9876543210")
 * to a canonical 10-digit Indian standard format for deduplication.
 */
public final class PhoneUtils {

    private PhoneUtils() {
    }

    /**
     * Normalizes a raw phone number into canonical format for duplicate detection.
     * For Indian mobile numbers (10 digits starting with 6, 7, 8, 9), strips country codes (+91, 91, 0)
     * and non-numeric characters, returning the standard 10-digit number.
     *
     * @param rawPhone The raw input phone string
     * @return Canonical normalized phone string
     */
    public static String normalize(String rawPhone) {
        if (rawPhone == null) {
            return "";
        }

        // Remove all whitespace, dashes, parentheses, dots
        String cleaned = rawPhone.replaceAll("[\\s\\-\\(\\)\\.]", "").trim();

        // Strip leading '+'
        if (cleaned.startsWith("+")) {
            cleaned = cleaned.substring(1);
        }

        // Handle Indian country codes: +91, 91 (length 12), or 0 (length 11)
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        } else if (cleaned.startsWith("0") && cleaned.length() == 11) {
            cleaned = cleaned.substring(1);
        }

        return cleaned;
    }

    /**
     * Validates whether a phone number matches reasonable mobile standards.
     *
     * @param rawPhone The input phone string
     * @return true if valid, false otherwise
     */
    public static boolean isValid(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return false;
        }
        String normalized = normalize(rawPhone);
        // Valid if 10-digit Indian mobile (starts with 6-9) or standard 7-15 digit international number
        if (normalized.length() == 10 && normalized.matches("^[6-9]\\d{9}$")) {
            return true;
        }
        return normalized.matches("^\\d{7,15}$");
    }
}
