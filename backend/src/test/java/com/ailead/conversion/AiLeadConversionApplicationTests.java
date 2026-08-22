package com.ailead.conversion;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AiLeadConversionApplicationTests {

    @Test
    @DisplayName("Verify Spring Boot application context loads successfully with DB connectivity")
    void contextLoads() {
        // Application context startup assertion
    }
}
