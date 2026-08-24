package com.ailead.conversion.service;

import com.ailead.conversion.dto.DashboardMetricsResponse;
import com.ailead.conversion.entity.FollowUpStatus;
import com.ailead.conversion.entity.LeadStatus;
import com.ailead.conversion.entity.Role;
import com.ailead.conversion.repository.FollowUpRepository;
import com.ailead.conversion.repository.LeadRepository;
import com.ailead.conversion.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;

    public DashboardService(LeadRepository leadRepository, FollowUpRepository followUpRepository) {
        this.leadRepository = leadRepository;
        this.followUpRepository = followUpRepository;
    }

    public DashboardMetricsResponse getMetrics(UUID organizationId, UserPrincipal principal) {
        boolean isCounselor = principal.getRole() == Role.COUNSELOR;
        UUID counselorId = principal.getId();

        long totalLeads = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndDeletedFalse(organizationId, counselorId)
                : leadRepository.countByOrganizationIdAndDeletedFalse(organizationId);

        long newCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.NEW)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.NEW);

        long contactedCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.CONTACTED)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.CONTACTED);

        long qualifiedCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.QUALIFIED)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.QUALIFIED);

        long followUpCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.FOLLOW_UP)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.FOLLOW_UP);

        long convertedCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.CONVERTED)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.CONVERTED);

        long lostCount = isCounselor
                ? leadRepository.countByOrganizationIdAndAssignedToIdAndStatusAndDeletedFalse(organizationId, counselorId, LeadStatus.LOST)
                : leadRepository.countByOrganizationIdAndStatusAndDeletedFalse(organizationId, LeadStatus.LOST);

        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);
        Instant now = Instant.now();

        long todayPending = isCounselor
                ? followUpRepository.countByOrganizationIdAndAssignedToIdAndStatusAndScheduledAtBetween(organizationId, counselorId, FollowUpStatus.PENDING, startOfDay, endOfDay)
                : followUpRepository.countByOrganizationIdAndStatusAndScheduledAtBetween(organizationId, FollowUpStatus.PENDING, startOfDay, endOfDay);

        long overdue = isCounselor
                ? followUpRepository.countByOrganizationIdAndAssignedToIdAndStatusAndScheduledAtBefore(organizationId, counselorId, FollowUpStatus.PENDING, now)
                : followUpRepository.countByOrganizationIdAndStatusAndScheduledAtBefore(organizationId, FollowUpStatus.PENDING, now);

        long completedToday = isCounselor
                ? followUpRepository.countByOrganizationIdAndAssignedToIdAndStatusAndCompletedAtBetween(organizationId, counselorId, FollowUpStatus.COMPLETED, startOfDay, endOfDay)
                : followUpRepository.countByOrganizationIdAndStatusAndCompletedAtBetween(organizationId, FollowUpStatus.COMPLETED, startOfDay, endOfDay);

        double conversionRate = totalLeads > 0 ? ((double) convertedCount / totalLeads) * 100.0 : 0.0;
        conversionRate = Math.round(conversionRate * 100.0) / 100.0; // 2 decimal places

        List<DashboardMetricsResponse.SourceCount> sourceCounts = new ArrayList<>();
        List<Object[]> sourceResults = leadRepository.countBySourceGroupByOrganizationId(organizationId);
        for (Object[] row : sourceResults) {
            String sourceName = row[0] != null ? row[0].toString() : "OTHER";
            long count = ((Number) row[1]).longValue();
            sourceCounts.add(new DashboardMetricsResponse.SourceCount(sourceName, count));
        }

        return new DashboardMetricsResponse(
                totalLeads,
                new DashboardMetricsResponse.PipelineBreakdown(newCount, contactedCount, qualifiedCount, followUpCount, convertedCount, lostCount),
                new DashboardMetricsResponse.FollowUpsSummary(todayPending, overdue, completedToday),
                conversionRate,
                sourceCounts
        );
    }
}
