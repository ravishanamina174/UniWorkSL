package lk.uniwork.health;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HealthServiceTest {
    private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);

    @Test
    void reportsDatabaseUpOnlyAfterSuccessfulQuery() {
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);
        HealthResponse response = new HealthService(jdbcTemplate).check();
        assertEquals("UP", response.status());
        assertEquals("UP", response.database());
    }

    @Test
    void reportsDatabaseDownWhenQueryFails() {
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenThrow(new IllegalStateException("database unavailable"));
        HealthResponse response = new HealthService(jdbcTemplate).check();
        assertEquals("DOWN", response.status());
        assertEquals("DOWN", response.database());
    }
}
