package lk.uniwork.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductionConfigurationGuardTest {
    private static final String KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    private ProductionConfigurationGuard guard(String databaseUrl, String webOrigin, String parties, String piiKey) {
        return new ProductionConfigurationGuard(databaseUrl, "uniwork", "db-secret", "https://example.clerk.accounts.dev",
                webOrigin, parties, piiKey);
    }

    @Test
    void acceptsSecureProductionSettings() {
        var guard = guard("jdbc:postgresql://db.example/neondb?sslmode=require", "https://uniwork.example",
                "https://uniwork.example,uniwork://", KEY);
        assertDoesNotThrow(() -> guard.run(new DefaultApplicationArguments(new String[0])));
    }

    @Test
    void rejectsNonTlsDatabaseAndInvalidPiiKey() {
        var database = guard("jdbc:postgresql://db.example/neondb?sslmode=disable", "https://uniwork.example",
                "https://uniwork.example", KEY);
        assertThrows(IllegalStateException.class, () -> database.run(new DefaultApplicationArguments(new String[0])));
        var pii = guard("jdbc:postgresql://db.example/neondb?sslmode=require", "https://uniwork.example",
                "https://uniwork.example", "not-a-key");
        assertThrows(IllegalStateException.class, () -> pii.run(new DefaultApplicationArguments(new String[0])));
    }

    @Test
    void requiresHttpsWebOriginAndItsAuthorizedParty() {
        var guard = guard("jdbc:postgresql://db.example/neondb?sslmode=require", "http://uniwork.example",
                "https://other.example", KEY);
        assertThrows(IllegalStateException.class, () -> guard.run(new DefaultApplicationArguments(new String[0])));
    }
}
