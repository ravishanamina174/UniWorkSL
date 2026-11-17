package lk.uniwork.user;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
public record StudentProfessionalProfileResponse(UUID profileId, String professionalSummary, String primaryLocation, BigDecimal primaryLatitude, BigDecimal primaryLongitude, String secondaryLocation, BigDecimal secondaryLatitude, BigDecimal secondaryLongitude, List<String> skills, List<Availability> availability, List<ProfessionalLanguage> languages, boolean discoverable, Instant updatedAt) {}
