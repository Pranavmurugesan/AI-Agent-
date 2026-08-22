package com.ailead.conversion.dto;

public class AuthResponse {
    private String message;
    private long expiresInMs;
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String message, long expiresInMs, UserResponse user) {
        this.message = message;
        this.expiresInMs = expiresInMs;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getExpiresInMs() {
        return expiresInMs;
    }

    public void setExpiresInMs(long expiresInMs) {
        this.expiresInMs = expiresInMs;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
