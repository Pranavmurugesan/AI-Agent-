package com.ailead.conversion.dto;

public class FollowUpCompleteRequest {

    private String outcomeNotes;

    public FollowUpCompleteRequest() {
    }

    public FollowUpCompleteRequest(String outcomeNotes) {
        this.outcomeNotes = outcomeNotes;
    }

    public String getOutcomeNotes() {
        return outcomeNotes;
    }

    public void setOutcomeNotes(String outcomeNotes) {
        this.outcomeNotes = outcomeNotes;
    }
}
