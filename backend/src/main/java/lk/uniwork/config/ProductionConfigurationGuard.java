package lk.uniwork.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

/** Prevents the production profile from starting with unsafe or incomplete secrets and origins. */
@Component
@Profile("prod")
public final class ProductionConfigurationGuard implements ApplicationRunner {
    private final String databaseUrl;
    private final String databaseUsername;
    private final String databasePassword;
    private final String issuer;
    private final String webOrigin;
    private final String authorizedParties;
    private final String piiKey;

    public ProductionConfigurationGuard(
            @Value("${spring.datasource.url:}") String databaseUrl,
            @Value("${spring.datasource.username:}") String databaseUsername,
            @Value("${spring.datasource.password:}") String databasePassword,
            @Value("${uniwork.security.clerk-issuer-uri:}") String issuer,
            @Value("${uniwork.web-origin:}") String webOrigin,
            @Value("${uniwork.security.authorized-parties:}") String authorizedParties,
            @Value("${uniwork.pii.encryption-key:}") String piiKey) {
        this.databaseUrl = databaseUrl;
        this.databaseUsername = databaseUsername;
        this.databasePassword = databasePassword;
        this.issuer = issuer;
        this.webOrigin = webOrigin;
        this.authorizedParties = authorizedParties;
        this.piiKey = piiKey;
    }

    @Override
    public void run(ApplicationArguments args) {
        require(!blank(databaseUsername) && !blank(databasePassword), "Database credentials are required.");
        require(databaseUrl.startsWith("jdbc:postgresql://") && databaseUrl.matches("(?i).*([?&])sslmode=require([&].*)?$"),
                "DB_URL must be a direct PostgreSQL JDBC URL with sslmode=require.");
        require(isHttpsOrigin(issuer), "CLERK_ISSUER_URI must be an HTTPS origin.");
        require(isHttpsOrigin(webOrigin), "WEB_ORIGIN must be one HTTPS origin without a path.");
        List<String> parties = Arrays.stream(authorizedParties.split(",")).map(String::trim).filter(value -> !value.isEmpty()).toList();
        require(!parties.isEmpty() && parties.contains(webOrigin), "CLERK_AUTHORIZED_PARTIES must include the exact WEB_ORIGIN.");
        try {
            byte[] decoded = Base64.getDecoder().decode(piiKey);
            boolean valid = decoded.length == 32;
            java.util.Arrays.fill(decoded, (byte) 0);
            require(valid, "UNIWORK_PII_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("UNIWORK_PII_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
        }
    }

    private static boolean isHttpsOrigin(String value) {
        if (blank(value)) return false;
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null
                    && uri.getRawUserInfo() == null && (uri.getRawPath() == null || uri.getRawPath().isEmpty())
                    && uri.getRawQuery() == null && uri.getRawFragment() == null;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }
}
