package lk.uniwork.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import java.time.Instant;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClerkJwtClaimValidatorTest {
    private final Instant now = Instant.now();
    private Jwt token() {
        return Jwt.withTokenValue("test-token").header("alg", "RS256").subject("user_test")
                .issuedAt(now).expiresAt(now.plusSeconds(60)).claim("aud", List.of("uniwork-api"))
                .claim("azp", "https://poster.uniwork.lk").build();
    }

    @Test void acceptsConfiguredAudienceAndAuthorizedParty() {
        var validator = new ClerkJwtClaimValidator(List.of("other", "uniwork-api"), List.of("https://poster.uniwork.lk"));
        assertFalse(validator.validate(token()).hasErrors());
    }

    @Test void rejectsWrongAudienceOrOrigin() {
        assertTrue(new ClerkJwtClaimValidator(List.of("mobile-api"), List.of("https://poster.uniwork.lk")).validate(token()).hasErrors());
        assertTrue(new ClerkJwtClaimValidator(List.of("uniwork-api"), List.of("https://attacker.example")).validate(token()).hasErrors());
    }

    @Test void allowsMissingAuthorizedPartyClaimAsClerkSessionTokensMayOmitIt() {
        Jwt missingParty = Jwt.withTokenValue("test-token").header("alg", "RS256").subject("user_test")
                .issuedAt(now).expiresAt(now.plusSeconds(60)).claim("aud", List.of("uniwork-api")).build();
        assertFalse(new ClerkJwtClaimValidator(List.of("uniwork-api"), List.of("https://poster.uniwork.lk")).validate(missingParty).hasErrors());
    }
}
