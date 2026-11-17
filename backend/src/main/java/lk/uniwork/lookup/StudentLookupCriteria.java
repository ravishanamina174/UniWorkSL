package lk.uniwork.lookup;
import lk.uniwork.user.Availability;
import lk.uniwork.user.ProfessionalLanguage;
import java.util.List;
public record StudentLookupCriteria(List<String> skills, String location, List<Availability> availability, List<ProfessionalLanguage> languages) {}
