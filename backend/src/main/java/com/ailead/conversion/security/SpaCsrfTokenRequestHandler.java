package com.ailead.conversion.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

/**
 * Spring Security 6 CSRF Token Request Handler tailored for Single Page Applications (SPAs).
 * Combines XorCsrfTokenRequestAttributeHandler for BREACH protection on cookies with
 * header resolution supporting both X-XSRF-TOKEN and X-CSRF-TOKEN.
 */
public final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

    private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
        /*
         * Always use XorCsrfTokenRequestAttributeHandler to provide BREACH protection
         * for the token stored in the request attribute / cookie.
         */
        this.delegate.handle(request, response, csrfToken);
    }

    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        /*
         * Check request headers (X-XSRF-TOKEN or X-CSRF-TOKEN).
         * If present from SPA, return the raw unmasked token from the header.
         * Otherwise, delegate to XOR handler for parameter resolution.
         */
        String headerValue = request.getHeader(csrfToken.getHeaderName());
        if (!StringUtils.hasText(headerValue)) {
            headerValue = request.getHeader("X-XSRF-TOKEN");
        }
        if (!StringUtils.hasText(headerValue)) {
            headerValue = request.getHeader("X-CSRF-TOKEN");
        }
        if (StringUtils.hasText(headerValue)) {
            return headerValue;
        }
        return this.delegate.resolveCsrfTokenValue(request, csrfToken);
    }
}
