package lk.uniwork.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Transactional(readOnly = true)
@EnabledIfSystemProperty(named = "uniwork.neon.integration", matches = "true")
class MarketplaceRepositoryIntegrationTest {
    @Autowired private TaskRepository tasks;

    @Test
    void executesCombinedPostgisDiscoveryAndCountQueries() {
        var page = tasks.browseDiscover("photography", BigDecimal.ZERO, new BigDecimal("5000"),
                Instant.parse("2026-11-19T18:30:00Z"), Instant.parse("2026-11-20T18:30:00Z"),
                true, 6.9271, 79.8612, PageRequest.of(0, 10));
        assertNotNull(page.getContent());
        assertNotNull(page.getTotalElements());
    }
}
