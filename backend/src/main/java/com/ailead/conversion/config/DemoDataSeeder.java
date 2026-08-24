package com.ailead.conversion.config;

import com.ailead.conversion.entity.*;
import com.ailead.conversion.repository.*;
import com.ailead.conversion.service.LeadActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Safe Demo & Development Data Seeder for ABC Coaching Institute.
 * Enabled conditionally via 'app.demo-data.enabled: true' in development/demo profiles.
 * Never overwrites existing production data.
 */
@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;
    private final LeadActivityService activityService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-data.enabled:false}")
    private boolean demoDataEnabled;

    public DemoDataSeeder(OrganizationRepository organizationRepository,
                          UserRepository userRepository,
                          CourseRepository courseRepository,
                          LeadRepository leadRepository,
                          FollowUpRepository followUpRepository,
                          LeadActivityService activityService,
                          PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.leadRepository = leadRepository;
        this.followUpRepository = followUpRepository;
        this.activityService = activityService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!demoDataEnabled) {
            log.info("DemoDataSeeder: Disabled (app.demo-data.enabled=false)");
            return;
        }

        if (organizationRepository.findBySlug("abc-coaching").isPresent()) {
            log.info("DemoDataSeeder: ABC Coaching Institute already initialized. Skipping seeding.");
            return;
        }

        log.info("DemoDataSeeder: Seeding demo data for ABC Coaching Institute...");

        // 1. Organization
        Organization org = organizationRepository.save(new Organization(
                UUID.randomUUID(),
                "ABC Coaching Institute",
                "abc-coaching",
                true
        ));

        // 2. Users (Admin + 3 Counselors)
        String defaultPasswordHash = passwordEncoder.encode("password123");

        User admin = userRepository.save(new User(
                UUID.randomUUID(), org, "Pranav Director", "director@abc.test", defaultPasswordHash, Role.ADMIN, true
        ));

        User counselor1 = userRepository.save(new User(
                UUID.randomUUID(), org, "Priya Sharma", "priya@abc.test", defaultPasswordHash, Role.COUNSELOR, true
        ));

        User counselor2 = userRepository.save(new User(
                UUID.randomUUID(), org, "Rahul Verma", "rahul@abc.test", defaultPasswordHash, Role.COUNSELOR, true
        ));

        User counselor3 = userRepository.save(new User(
                UUID.randomUUID(), org, "Sneha Reddy", "sneha@abc.test", defaultPasswordHash, Role.COUNSELOR, true
        ));

        // 3. Courses
        Course jeeCourse = courseRepository.save(new Course(
                UUID.randomUUID(), org, "IIT-JEE 2-Year Target Batch", "JEE-2027",
                "Complete PCM curriculum with weekly mock tests and doubt clearing sessions",
                "2 Years", BigDecimal.valueOf(140000.00), true
        ));

        Course neetCourse = courseRepository.save(new Course(
                UUID.randomUUID(), org, "NEET Repeater Fastrack Batch", "NEET-REP",
                "Intensive Biology, Chemistry & Physics daily test series for NEET droppers",
                "1 Year", BigDecimal.valueOf(110000.00), true
        ));

        Course upscCourse = courseRepository.save(new Course(
                UUID.randomUUID(), org, "UPSC Civil Services Foundation", "UPSC-FDN",
                "General Studies, Current Affairs, and Answer Writing Foundation",
                "1 Year", BigDecimal.valueOf(95000.00), true
        ));

        Course foundationCourse = courseRepository.save(new Course(
                UUID.randomUUID(), org, "Class 10th Board + Olympiad", "FND-10",
                "Science & Math excellence batch for high-school students",
                "1 Year", BigDecimal.valueOf(60000.00), true
        ));

        Course fswdCourse = courseRepository.save(new Course(
                UUID.randomUUID(), org, "Full Stack Web Development", "FSWD-PRO",
                "Java, Spring Boot, React, TypeScript & PostgreSQL Job Bootcamp",
                "6 Months", BigDecimal.valueOf(45000.00), true
        ));

        // 4. Sample Leads
        Lead lead1 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Aarav Patel", "+91 98765 01001", "aarav.p@gmail.com",
                jeeCourse, LeadSource.WEBSITE, LeadStatus.NEW, LeadPriority.HIGH, counselor1,
                "Parent inquired about hostel accommodation and batch timings"
        ));
        activityService.recordActivity(lead1, admin, ActivityType.CREATED, "Lead created via WEBSITE", lead1.getNotes(), null);

        Lead lead2 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Ananya Iyer", "9876501002", "ananya.i@gmail.com",
                neetCourse, LeadSource.INSTAGRAM, LeadStatus.CONTACTED, LeadPriority.URGENT, counselor1,
                "Attended online webinar; scored 520 in previous NEET attempt"
        ));
        activityService.recordActivity(lead2, counselor1, ActivityType.CREATED, "Lead created via INSTAGRAM", null, null);
        activityService.recordActivity(lead2, counselor1, ActivityType.CALL_LOGGED, "Counseling call completed with mother", "Discussed scholarship concession", null);

        Lead lead3 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Vikram Singh", "09876501003", "vikram.s@gmail.com",
                upscCourse, LeadSource.WALK_IN, LeadStatus.QUALIFIED, LeadPriority.HIGH, counselor2,
                "Visited campus with father; seeking Prelims + Mains comprehensive batch"
        ));
        activityService.recordActivity(lead3, counselor2, ActivityType.CREATED, "Lead created via WALK_IN", null, null);
        activityService.recordActivity(lead3, counselor2, ActivityType.STATUS_CHANGED, "Status changed to QUALIFIED", "Student eligible for batch", null);

        Lead lead4 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Meera Nair", "9876501004", "meera.n@gmail.com",
                fswdCourse, LeadSource.GOOGLE_ADS, LeadStatus.FOLLOW_UP, LeadPriority.MEDIUM, counselor3,
                "Final year B.Tech student looking for placement-oriented curriculum"
        ));
        activityService.recordActivity(lead4, counselor3, ActivityType.CREATED, "Lead created via GOOGLE_ADS", null, null);

        Lead lead5 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Rohan Gupta", "+91 98765 01005", "rohan.g@gmail.com",
                jeeCourse, LeadSource.REFERRAL, LeadStatus.CONVERTED, LeadPriority.HIGH, counselor1,
                "Brother was alumnus of 2024 batch. Admitted to Target Batch A."
        ));
        activityService.recordActivity(lead5, counselor1, ActivityType.CREATED, "Lead created via REFERRAL", null, null);
        activityService.recordActivity(lead5, counselor1, ActivityType.CONVERTED, "Student enrolled and paid 1st installment", "Token ₹40,000 paid via UPI", null);

        Lead lead6 = leadRepository.save(new Lead(
                UUID.randomUUID(), org, "Kavita Rao", "9876501006", "kavita.r@gmail.com",
                foundationCourse, LeadSource.FACEBOOK, LeadStatus.LOST, LeadPriority.LOW, counselor2,
                "Family relocated to another state"
        ));
        activityService.recordActivity(lead6, counselor2, ActivityType.LOST, "Lead marked LOST", "Family relocation", null);

        // 5. Follow-ups
        followUpRepository.save(new FollowUp(
                UUID.randomUUID(), org, lead4, counselor3,
                Instant.now().plus(2, ChronoUnit.HOURS),
                FollowUpStatus.PENDING, LeadPriority.URGENT,
                "Call regarding scholarship discount approval from Director"
        ));

        followUpRepository.save(new FollowUp(
                UUID.randomUUID(), org, lead2, counselor1,
                Instant.now().plus(1, ChronoUnit.DAYS),
                FollowUpStatus.PENDING, LeadPriority.HIGH,
                "Follow-up call on test series enrollment decision"
        ));

        FollowUp completedFollowUp = new FollowUp(
                UUID.randomUUID(), org, lead5, counselor1,
                Instant.now().minus(2, ChronoUnit.HOURS),
                FollowUpStatus.COMPLETED, LeadPriority.HIGH,
                "Confirm batch commencement date with student"
        );
        completedFollowUp.setCompletedAt(Instant.now().minus(1, ChronoUnit.HOURS));
        completedFollowUp.setOutcomeNotes("Confirmed Batch A starts Monday 9:00 AM.");
        followUpRepository.save(completedFollowUp);

        log.info("DemoDataSeeder: Successfully seeded ABC Coaching Institute with 4 users, 5 courses, 6 leads, and 3 follow-ups!");
    }
}
