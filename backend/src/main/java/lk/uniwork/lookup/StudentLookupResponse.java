package lk.uniwork.lookup;
import java.util.List;
public record StudentLookupResponse(StudentLookupCriteria criteria, List<StudentLookupCandidate> candidates) {}
