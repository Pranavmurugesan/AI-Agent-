package com.ailead.conversion.util;

import jakarta.servlet.http.Cookie;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.UUID;

/**
 * Utility for MockMvc tests to attach valid Cookie + Header CSRF tokens
 * compatible with CookieCsrfTokenRepository.
 */
public class CsrfTestUtils {

    public static RequestPostProcessor csrfToken() {
        return request -> {
            String token = UUID.randomUUID().toString();
            Cookie[] existing = request.getCookies();
            Cookie csrfCookie = new Cookie("XSRF-TOKEN", token);
            csrfCookie.setPath("/");

            if (existing == null || existing.length == 0) {
                request.setCookies(csrfCookie);
            } else {
                Cookie[] updated = new Cookie[existing.length + 1];
                System.arraycopy(existing, 0, updated, 0, existing.length);
                updated[existing.length] = csrfCookie;
                request.setCookies(updated);
            }
            request.addHeader("X-XSRF-TOKEN", token);
            return request;
        };
    }
}
