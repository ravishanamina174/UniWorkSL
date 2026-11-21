package lk.uniwork.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;


/** Resolves the current Clerk public metadata for every Admin API request. */
@Component
public class AdminAuthorization {
    private final RestClient clerk;
    private final String secretKey;
    private final ObjectMapper mapper;

    public AdminAuthorization(RestClient.Builder builder, ObjectMapper mapper,
            @Value("${uniwork.security.clerk-secret-key:}") String secretKey,
            @Value("${uniwork.security.clerk-api-url:https://api.clerk.com/v1}") String apiUrl) {
        this.clerk = builder.baseUrl(apiUrl).build();
        this.secretKey = secretKey;
        this.mapper = mapper;
    }

    public boolean isAdmin(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken jwt) || !authentication.isAuthenticated()
                || secretKey.isBlank() || jwt.getToken().getSubject() == null) return false;
        try {
            return "Admin".equals(currentRole(jwt));
        } catch (RuntimeException unavailable) {
            // Fail closed if Clerk is unavailable or the user was removed.
            return false;
        }
    }

    String currentRole(JwtAuthenticationToken jwt) {
        String user = clerk.get().uri("/users/{id}", jwt.getToken().getSubject())
                .headers(headers -> headers.setBearerAuth(secretKey))
                .retrieve().body(String.class);
        return user == null ? "" : mapper.readTree(user).path("public_metadata").path("role").asText();
    }
}
