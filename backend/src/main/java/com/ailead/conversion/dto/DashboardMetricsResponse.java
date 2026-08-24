package com.ailead.conversion.dto;

import java.util.List;

public class DashboardMetricsResponse {

    private long totalLeads;
    private PipelineBreakdown pipeline;
    private FollowUpsSummary followUps;
    private double conversionRatePercent;
    private List<SourceCount> sources;

    public DashboardMetricsResponse() {
    }

    public DashboardMetricsResponse(long totalLeads, PipelineBreakdown pipeline, FollowUpsSummary followUps, double conversionRatePercent, List<SourceCount> sources) {
        this.totalLeads = totalLeads;
        this.pipeline = pipeline;
        this.followUps = followUps;
        this.conversionRatePercent = conversionRatePercent;
        this.sources = sources;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public PipelineBreakdown getPipeline() {
        return pipeline;
    }

    public void setPipeline(PipelineBreakdown pipeline) {
        this.pipeline = pipeline;
    }

    public FollowUpsSummary getFollowUps() {
        return followUps;
    }

    public void setFollowUps(FollowUpsSummary followUps) {
        this.followUps = followUps;
    }

    public double getConversionRatePercent() {
        return conversionRatePercent;
    }

    public void setConversionRatePercent(double conversionRatePercent) {
        this.conversionRatePercent = conversionRatePercent;
    }

    public List<SourceCount> getSources() {
        return sources;
    }

    public void setSources(List<SourceCount> sources) {
        this.sources = sources;
    }

    public static class PipelineBreakdown {
        private long newCount;
        private long contactedCount;
        private long qualifiedCount;
        private long followUpCount;
        private long convertedCount;
        private long lostCount;

        public PipelineBreakdown() {}

        public PipelineBreakdown(long newCount, long contactedCount, long qualifiedCount, long followUpCount, long convertedCount, long lostCount) {
            this.newCount = newCount;
            this.contactedCount = contactedCount;
            this.qualifiedCount = qualifiedCount;
            this.followUpCount = followUpCount;
            this.convertedCount = convertedCount;
            this.lostCount = lostCount;
        }

        public long getNewCount() { return newCount; }
        public void setNewCount(long newCount) { this.newCount = newCount; }
        public long getContactedCount() { return contactedCount; }
        public void setContactedCount(long contactedCount) { this.contactedCount = contactedCount; }
        public long getQualifiedCount() { return qualifiedCount; }
        public void setQualifiedCount(long qualifiedCount) { this.qualifiedCount = qualifiedCount; }
        public long getFollowUpCount() { return followUpCount; }
        public void setFollowUpCount(long followUpCount) { this.followUpCount = followUpCount; }
        public long getConvertedCount() { return convertedCount; }
        public void setConvertedCount(long convertedCount) { this.convertedCount = convertedCount; }
        public long getLostCount() { return lostCount; }
        public void setLostCount(long lostCount) { this.lostCount = lostCount; }
    }

    public static class FollowUpsSummary {
        private long todayPending;
        private long overdue;
        private long completedToday;

        public FollowUpsSummary() {}

        public FollowUpsSummary(long todayPending, long overdue, long completedToday) {
            this.todayPending = todayPending;
            this.overdue = overdue;
            this.completedToday = completedToday;
        }

        public long getTodayPending() { return todayPending; }
        public void setTodayPending(long todayPending) { this.todayPending = todayPending; }
        public long getOverdue() { return overdue; }
        public void setOverdue(long overdue) { this.overdue = overdue; }
        public long getCompletedToday() { return completedToday; }
        public void setCompletedToday(long completedToday) { this.completedToday = completedToday; }
    }

    public static class SourceCount {
        private String source;
        private long count;

        public SourceCount() {}

        public SourceCount(String source, long count) {
            this.source = source;
            this.count = count;
        }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
