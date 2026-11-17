package lk.uniwork.user;

import jakarta.validation.constraints.Size;
import java.util.List;

public record StudentProfessionalProfileRequest(
        @Size(max = 1200) String professionalSummary,
        @Size(max = 80) String primaryLocation,
        Double primaryLatitude, Double primaryLongitude,
        @Size(max = 80) String secondaryLocation,
        Double secondaryLatitude, Double secondaryLongitude,
        @Size(max = 20) List<@Size(max = 80) String> skills,
        @Size(max = 5) List<Availability> availability,
        @Size(max = 3) List<ProfessionalLanguage> languages,
        boolean discoverable) {}
