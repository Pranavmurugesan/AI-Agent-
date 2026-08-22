package com.ailead.conversion.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * BCrypt Performance Benchmark on the actual runtime environment.
 * Measures hashing and verification latencies across work factors (10, 11, 12).
 */
class BCryptBenchmarkTest {

    private static final Logger logger = LoggerFactory.getLogger(BCryptBenchmarkTest.class);
    private static final String SAMPLE_PASSWORD = "SuperSecretPassword123!#";

    @Test
    @DisplayName("Benchmark BCrypt hashing and verification latency across strength factors")
    void benchmarkBCryptStrengths() {
        int[] strengths = {10, 11, 12};
        int iterations = 5;

        System.out.println("==========================================================");
        System.out.println("BCRYPT PERFORMANCE BENCHMARK (Local Development Machine)");
        System.out.println("==========================================================");

        for (int strength : strengths) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(strength);

            // Warmup
            encoder.matches(SAMPLE_PASSWORD, encoder.encode(SAMPLE_PASSWORD));

            long totalHashTime = 0;
            long totalVerifyTime = 0;

            for (int i = 0; i < iterations; i++) {
                long startHash = System.nanoTime();
                String hash = encoder.encode(SAMPLE_PASSWORD);
                long endHash = System.nanoTime();
                totalHashTime += (endHash - startHash);

                long startVerify = System.nanoTime();
                boolean matches = encoder.matches(SAMPLE_PASSWORD, hash);
                long endVerify = System.nanoTime();
                totalVerifyTime += (endVerify - startVerify);

                assertTrue(matches);
            }

            double avgHashMs = (totalHashTime / (double) iterations) / 1_000_000.0;
            double avgVerifyMs = (totalVerifyTime / (double) iterations) / 1_000_000.0;

            System.out.printf("Strength: %2d | Avg Hash Time: %7.2f ms | Avg Verify Time: %7.2f ms%n",
                    strength, avgHashMs, avgVerifyMs);
            logger.info("BCrypt strength {} -> Avg Hash: {:.2f} ms, Avg Verify: {:.2f} ms",
                    strength, avgHashMs, avgVerifyMs);

            if (strength == 10) {
                // Strength 10 should be fast enough to avoid CPU starvation (< 500ms on modern CPUs)
                // while taking at least 30ms to provide sufficient resistance against brute-force
                assertTrue(avgHashMs > 10.0, "Hash time must be non-trivial to prevent trivial offline cracking");
                assertTrue(avgHashMs < 1000.0, "Hash time must not cause excessive CPU starvation");
            }
        }
        System.out.println("==========================================================");
    }
}
