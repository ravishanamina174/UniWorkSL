package lk.uniwork.user;

import jakarta.validation.constraints.Size;
import java.util.List;
import java.math.BigDecimal;

public record StudentProfessionalProfileRequest(
        @Size(max = 1200) String professionalSummary,
        @Size(max = 80) String primaryLocation,
        BigDecimal primaryLatitude, BigDecimal primaryLongitude,
        @Size(max = 80) String secondaryLocation,
        BigDecimal secondaryLatitude, BigDecimal secondaryLongitude,
        @Size(max = 20) List<@Size(max = 80) String> skills,
        @Size(max = 5) List<Availability> availability,
        @Size(max = 3) List<ProfessionalLanguage> languages,
        boolean discoverable) {}
