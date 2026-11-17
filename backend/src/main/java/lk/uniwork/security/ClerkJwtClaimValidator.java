package lk.uniwork.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/** Validates optional Clerk audience and authorized-party claims when configured. */
public final class ClerkJwtClaimValidator implements OAuth2TokenValidator<Jwt> {
    private static final OAuth2Error INVALID_CLAIM = new OAuth2Error("invalid_token", "The Clerk token is not intended for this application.", null);
    private final List<String> audiences;
    private final List<String> authorizedParties;

    public ClerkJwtClaimValidator(List<String> audiences, List<String> authorizedParties) {
        this.audiences = List.copyOf(audiences);
        this.authorizedParties = List.copyOf(authorizedParties);
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (!audiences.isEmpty() && audiences.stream().noneMatch(jwt.getAudience()::contains))
            return OAuth2TokenValidatorResult.failure(INVALID_CLAIM);
        String authorizedParty = jwt.getClaimAsString("azp");
        if (authorizedParty != null && !authorizedParties.isEmpty() && !authorizedParties.contains(authorizedParty))
            return OAuth2TokenValidatorResult.failure(INVALID_CLAIM);
        return OAuth2TokenValidatorResult.success();
    }
}
