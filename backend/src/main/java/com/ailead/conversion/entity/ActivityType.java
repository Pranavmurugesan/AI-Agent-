package com.ailead.conversion.entity;

/**
 * Type classification of lead activities in the chronological audit timeline.
 */
public enum ActivityType {
    CREATED,
    STATUS_CHANGED,
    ASSIGNED,
    REOPENED,
    NOTE_ADDED,
    CALL_LOGGED,
    MESSAGE_LOGGED,
    EMAIL_LOGGED,
    FOLLOW_UP_SCHEDULED,
    FOLLOW_UP_COMPLETED,
    FOLLOW_UP_CANCELLED,
    COURSE_CHANGED,
    CONVERTED,
    LOST
}
