package lk.uniwork.user;

import lk.uniwork.identity.IdentityVerificationService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class PublicStudentService {
    private final StudentProfileRepository profiles;
    private final StudentProfessionalProfileRepository professional;
    private final IdentityVerificationService verification;
    private final JdbcTemplate db;
    public PublicStudentService(StudentProfileRepository profiles, StudentProfessionalProfileRepository professional,
                                IdentityVerificationService verification, JdbcTemplate db) {
        this.profiles = profiles; this.professional = professional; this.verification = verification; this.db = db;
    }
    @Transactional(readOnly = true)
    public List<PublicStudentProfile> byCategory(StudentCategory category) {
        return professional.findTop200ByDiscoverableTrue().stream()
                .map(value -> toPublic(value.getUserId())).filter(value -> value.primaryCategory() == category).toList();
    }
    @Transactional(readOnly = true)
    public PublicStudentProfile get(UUID id) {
        var value = professional.findByUserId(id).filter(StudentProfessionalProfile::isDiscoverable)
                .orElseThrow(() -> new lk.uniwork.common.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND", "This student profile is not available."));
        return toPublic(value.getUserId());
    }
    private PublicStudentProfile toPublic(UUID id) {
        var profile = profiles.findById(id).orElseThrow();
        var details = professional.findByUserId(id).orElseThrow();
        var rating = db.queryForObject("select coalesce(avg(r.poster_rating),0), count(*) from task_reviews r join tasks t on t.task_id=r.task_id where r.student_user_id=? and t.status='COMPLETED' and (cast(? as varchar) is null or t.category=?)", (rs, n) -> new Object[]{rs.getDouble(1), rs.getLong(2)}, id, profile.getPrimaryCategory() == null ? null : profile.getPrimaryCategory().name(), profile.getPrimaryCategory() == null ? null : profile.getPrimaryCategory().name());
        return new PublicStudentProfile(id, profile.getFullName(), details.getPrimaryLocation(), details.getProfessionalSummary(), profile.getPrimaryCategory(), (double) rating[0], (long) rating[1], verification.status(id).status().equals("VERIFIED"));
    }
}
