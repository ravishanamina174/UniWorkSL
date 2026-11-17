package lk.uniwork.lookup;
import lk.uniwork.user.Availability;
import lk.uniwork.user.ProfessionalLanguage;
import java.util.List;
import java.util.UUID;
public record StudentLookupCandidate(UUID profileId, String name, String professionalSummary, List<String> skills, String primaryLocation, String secondaryLocation, List<Availability> availability, List<ProfessionalLanguage> languages, int matchScore, List<String> matchReasons) {}
