package com.ailead.conversion.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class PhoneNormalizationTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "9876543210",
            "+91 9876543210",
            "+91-98765-43210",
            "+919876543210",
            "09876543210",
            "919876543210",
            "+91 (987) 654-3210"
    })
    @DisplayName("Indian mobile phone formats should all normalize to canonical 10-digit format '9876543210'")
    void normalize_IndianMobileFormats_ShouldAllNormalizeTo10Digits(String rawPhone) {
        String normalized = PhoneUtils.normalize(rawPhone);
        assertEquals("9876543210", normalized, "Failed to normalize " + rawPhone);
        assertTrue(PhoneUtils.isValid(rawPhone), "Failed validation for " + rawPhone);
    }

    @Test
    @DisplayName("International numbers should normalize cleanly")
    void normalize_InternationalNumbers_ShouldNormalizeDigits() {
        String raw = "+1 (555) 123-4567";
        String normalized = PhoneUtils.normalize(raw);
        assertEquals("15551234567", normalized);
        assertTrue(PhoneUtils.isValid(raw));
    }

    @Test
    @DisplayName("Null, blank, or invalid phone numbers should be handled safely")
    void isValid_InvalidInputs_ShouldReturnFalse() {
        assertFalse(PhoneUtils.isValid(null));
        assertFalse(PhoneUtils.isValid(""));
        assertFalse(PhoneUtils.isValid("   "));
        assertFalse(PhoneUtils.isValid("12345")); // too short
        assertFalse(PhoneUtils.isValid("abc1234567"));
        assertEquals("", PhoneUtils.normalize(null));
    }
}
