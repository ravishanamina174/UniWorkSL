package lk.uniwork.user;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record StudentProfessionalProfileResponse(UUID profileId, String professionalSummary, String primaryLocation, Double primaryLatitude, Double primaryLongitude, String secondaryLocation, Double secondaryLatitude, Double secondaryLongitude, List<String> skills, List<Availability> availability, List<ProfessionalLanguage> languages, boolean discoverable, Instant updatedAt) {}
