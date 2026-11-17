package lk.uniwork.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class HealthService {
    private final JdbcTemplate jdbcTemplate;

    public HealthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public HealthResponse check() {
        String databaseStatus;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            databaseStatus = "UP";
        } catch (Exception exception) {
            databaseStatus = "DOWN";
        }
        return new HealthResponse("UP".equals(databaseStatus) ? "UP" : "DOWN", "UniWork API", databaseStatus);
    }
}
