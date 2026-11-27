package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class IdentityVerificationService {
    private static final Logger logger=LoggerFactory.getLogger(IdentityVerificationService.class);
    public record State(String status, String method, Instant verifiedAt, String lastReviewStatus, String lastReviewReason) { }
    public record Review(UUID reviewId, UUID userId, String name, String userType, String maskedNic, String status,
                         String verificationStatus, Instant submittedAt, Instant expiresAt, Instant decidedAt, String decisionReason,
                         String method) { }
    private final JdbcTemplate db;
    private final UserIdentityService identities;
    private final StudentProfileRepository students;
    private final TaskPosterProfileRepository posters;
    private final PiiEncryptionService encryption;
    private final IdentityDocument documents;
    private final R2IdentityStorage storage;
    private final IdentityCleanupService cleanup;
    private final int retentionDays;

    public IdentityVerificationService(JdbcTemplate db, UserIdentityService identities, StudentProfileRepository students,
            TaskPosterProfileRepository posters, PiiEncryptionService encryption, IdentityDocument documents,
            R2IdentityStorage storage, IdentityCleanupService cleanup,
            @Value("${uniwork.identity.review-retention-days:30}") int retentionDays) {
        this.db=db; this.identities=identities; this.students=students; this.posters=posters;
        this.encryption=encryption; this.documents=documents; this.storage=storage; this.cleanup=cleanup;
        this.retentionDays=Math.max(1,retentionDays);
    }

    private UniWorkUser user(String subject, UserRole role) {
        return role == UserRole.STUDENT ? identities.requireStudent(subject) : identities.requireTaskPoster(subject);
    }
    private String profileNic(UniWorkUser user) {
        String ciphertext;
        if (user.getRole()==UserRole.STUDENT) {
            StudentProfile p=students.findById(user.getId()).orElseThrow(() -> profileRequired());
            if (p.getFullName().isBlank() || p.getAddressCiphertext().isBlank() || p.getPhoneNumber().isBlank()
                    || p.getUniversity().isBlank() || p.getFaculty().isBlank() || p.getAge()<16 || p.getGender()==null) throw profileRequired();
            ciphertext=p.getNicCiphertext();
        } else {
            TaskPosterProfile p=posters.findById(user.getId()).orElseThrow(() -> profileRequired());
            if (p.getFullName().isBlank() || p.getAddress().isBlank() || p.getPhoneNumber().isBlank() || p.getGender()==null) throw profileRequired();
            ciphertext=p.getNicCiphertext();
        }
        String nic=encryption.decrypt(ciphertext);
        if (!NicNumbers.valid(nic)) throw profileRequired();
        return nic;
    }
    private ApiException profileRequired() { return new ApiException(HttpStatus.CONFLICT,"IDENTITY_PROFILE_REQUIRED","Complete your profile and enter a valid NIC before verification."); }
    private void ensureRow(UUID userId) {
        db.update("insert into identity_verifications(user_id) values(?) on conflict (user_id) do nothing",userId);
    }
    private State state(UUID userId) {
        var rows=db.query("select status,method,verified_at,(select r.status from identity_reviews r where r.user_id=v.user_id order by r.submitted_at desc limit 1),(select r.decision_reason from identity_reviews r where r.user_id=v.user_id order by r.submitted_at desc limit 1) from identity_verifications v where user_id=?",
                (rs,n)->new State(rs.getString(1),rs.getString(2),rs.getTimestamp(3)==null?null:rs.getTimestamp(3).toInstant(),rs.getString(4),rs.getString(5)),userId);
        return rows.isEmpty()?new State("UNVERIFIED",null,null,null,null):rows.getFirst();
    }
    @Transactional(readOnly=true)
    public State status(String subject, UserRole role) { return state(user(subject,role).getId()); }
    @Transactional(readOnly=true)
    public State status(UUID userId) { return state(userId); }
    @Transactional(readOnly=true)
    public void requireVerified(UUID userId, String code, String message) {
        if (!state(userId).status().equals("VERIFIED")) throw new ApiException(HttpStatus.FORBIDDEN,code,message);
    }
    @Transactional(readOnly=true)
    public void requireNicUnchanged(UUID userId, String existing, String requested) {
        if (List.of("VERIFIED","MANUAL_REVIEW_PENDING").contains(state(userId).status()) && !NicNumbers.normalize(existing).equals(NicNumbers.normalize(requested)))
            throw new ApiException(HttpStatus.CONFLICT,"NIC_LOCKED","Your NIC cannot be changed while matched or under review. Contact support for corrections.");
    }

    @Transactional
    public State submitReview(String subject, UserRole role, MultipartFile file) {
        UniWorkUser user=user(subject,role); profileNic(user);
        IdentityDocument.Image image=documents.read(file);
        ensureRow(user.getId());
        db.queryForList("select status from identity_verifications where user_id=? for update",String.class,user.getId());
        State current=state(user.getId());
        if (current.status().equals("VERIFIED")) throw new ApiException(HttpStatus.CONFLICT,"ALREADY_VERIFIED","Your NIC has already been reviewed.");
        if (current.status().equals("MANUAL_REVIEW_PENDING")) throw new ApiException(HttpStatus.CONFLICT,"REVIEW_PENDING","A review is already pending.");
        UUID id=UUID.randomUUID(); String key="nic-reviews/"+UUID.randomUUID()+".jpg";
        try { storage.put(key,image.bytes()); }
        catch (RuntimeException failure) { throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"PRIVATE_STORAGE_UNAVAILABLE","The document could not be submitted. Please try again."); }
        try {
            db.update("insert into identity_reviews(review_id,user_id,object_key,expires_at) values(?,?,?,?)",id,user.getId(),key,
                    java.sql.Timestamp.from(Instant.now().plus(retentionDays,ChronoUnit.DAYS)));
            db.update("update identity_verifications set status='MANUAL_REVIEW_PENDING',updated_at=now() where user_id=?",user.getId());
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if (status==STATUS_ROLLED_BACK) try { storage.delete(key); } catch (RuntimeException failure) { logger.warn("Rollback NIC image deletion failed; orphan cleanup will retry."); }
                }
            });
        } catch (RuntimeException failure) {
            try { storage.delete(key); } catch (RuntimeException deletionFailure) { logger.warn("NIC image deletion after review submission failure will be retried by orphan cleanup."); }
            throw failure;
        }
        return state(user.getId());
    }

    private Review review(java.sql.ResultSet rs) throws java.sql.SQLException {
        UUID userId=rs.getObject("user_id",UUID.class);
        String type=rs.getString("role");
        String name, nic;
        if ("STUDENT".equals(type)) { var p=students.findById(userId).orElseThrow(); name=p.getFullName(); nic=encryption.decrypt(p.getNicCiphertext()); }
        else { var p=posters.findById(userId).orElseThrow(); name=p.getFullName(); nic=encryption.decrypt(p.getNicCiphertext()); }
        return new Review(rs.getObject("review_id",UUID.class),userId,name,type,"••••••••"+nic.substring(Math.max(0,nic.length()-4)),
                rs.getString("status"),rs.getString("verification_status"),rs.getTimestamp("submitted_at").toInstant(),
                rs.getTimestamp("expires_at").toInstant(),rs.getTimestamp("decided_at")==null?null:rs.getTimestamp("decided_at").toInstant(),
                rs.getString("decision_reason"),rs.getString("method"));
    }
    private static final String REVIEW_SQL="select r.*,u.role,v.status verification_status,v.method from identity_reviews r join uniwork_users u on u.user_id=r.user_id join identity_verifications v on v.user_id=r.user_id";
    @Transactional(readOnly=true)
    public PageResponse<Review> reviews(int page,int size,String status,String search) {
        int bounded=Math.min(Math.max(size,1),50), index=Math.max(page,0); String filter=status==null||status.isBlank()?"PENDING":status;
        if (!List.of("PENDING","APPROVED","REJECTED","EXPIRED").contains(filter)) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_STATUS","Choose a valid review status.");
        String query=search==null?"":search.trim().toLowerCase();
        if (query.length()>100) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_SEARCH","Search is too long.");
        String predicate=" where r.status=? and (?='' or lower(coalesce(sp.full_name,pp.full_name)) like ?)";
        String joins=" left join student_profiles sp on sp.user_id=r.user_id left join task_poster_profiles pp on pp.user_id=r.user_id";
        long total=db.queryForObject("select count(*) from identity_reviews r"+joins+predicate,Long.class,filter,query,"%"+query+"%");
        List<Review> values=db.query(REVIEW_SQL+joins+predicate+" order by r.submitted_at desc limit ? offset ?",(rs,n)->review(rs),filter,query,"%"+query+"%",bounded,index*bounded);
        return new PageResponse<>(values,index,bounded,total,(int)Math.ceil((double)total/bounded));
    }
    @Transactional(readOnly=true)
    public Review review(UUID id) {
        var rows=db.query(REVIEW_SQL+" where r.review_id=?",(rs,n)->review(rs),id);
        if (rows.isEmpty()) throw new ApiException(HttpStatus.NOT_FOUND,"REVIEW_NOT_FOUND","This review was not found.");
        return rows.getFirst();
    }
    @Transactional(readOnly=true)
    public String comparisonNic(UUID id) {
        Review value=review(id);
        if (!value.status().equals("PENDING") || value.expiresAt().isBefore(Instant.now())) throw new ApiException(HttpStatus.NOT_FOUND,"REVIEW_NOT_PENDING","This document is no longer pending review.");
        return profileNic(value.userType().equals("STUDENT") ? students.findById(value.userId()).orElseThrow().getUser()
                : posters.findById(value.userId()).orElseThrow().getUser());
    }
    @Transactional(readOnly=true)
    public byte[] image(UUID id) {
        var keys=db.queryForList("select object_key from identity_reviews where review_id=? and status='PENDING' and expires_at>now()",String.class,id);
        if (keys.isEmpty() || keys.getFirst()==null) throw new ApiException(HttpStatus.NOT_FOUND,"IMAGE_NOT_AVAILABLE","This document is no longer available.");
        try { return storage.get(keys.getFirst()); }
        catch (RuntimeException failure) { throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"PRIVATE_STORAGE_UNAVAILABLE","The document is temporarily unavailable."); }
    }
    @Transactional
    public Review decide(String admin,UUID id,boolean approve,String reason) {
        if (reason==null || reason.isBlank() || reason.length()>2000) throw new ApiException(HttpStatus.BAD_REQUEST,"REASON_REQUIRED","Enter a brief decision reason.");
        var pending=db.queryForList("select status from identity_reviews where review_id=? for update",String.class,id);
        if (pending.isEmpty()) throw new ApiException(HttpStatus.NOT_FOUND,"REVIEW_NOT_FOUND","This review was not found.");
        if (!pending.getFirst().equals("PENDING")) throw new ApiException(HttpStatus.CONFLICT,"REVIEW_DECIDED","This review has already been decided.");
        Instant expiry=db.queryForObject("select expires_at from identity_reviews where review_id=?",(rs,n)->rs.getTimestamp(1).toInstant(),id);
        if (expiry.isBefore(Instant.now())) throw new ApiException(HttpStatus.CONFLICT,"REVIEW_EXPIRED","This review has expired. Ask the user to submit a new document.");
        String next=approve?"APPROVED":"REJECTED";
        UUID userId=db.queryForObject("select user_id from identity_reviews where review_id=?",UUID.class,id);
        db.update("update identity_reviews set status=?,decided_by=?,decision_reason=?,decided_at=now(),deletion_pending=true,updated_at=now() where review_id=?",next,admin,reason.trim(),id);
        db.update("update identity_verifications set status=?,method=?,verified_at=?,updated_at=now() where user_id=?",approve?"VERIFIED":"REJECTED",approve?"MANUAL_REVIEW":null,
                approve?java.sql.Timestamp.from(Instant.now()):null,userId);
        db.update("insert into admin_audit_events(audit_id,admin_clerk_id,action,target_type,target_id,before_state,after_state,reason) values(?,?,'IDENTITY_REVIEW_DECIDED','IDENTITY_REVIEW',?,'PENDING',?,?)",
                UUID.randomUUID(),admin,id,next,reason.trim());
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
            @Override public void afterCommit() { try { cleanup.deleteOne(id); } catch (RuntimeException failure) { logger.warn("NIC image deletion after decision failed; the queued sweep will retry."); } }
        });
        return review(id);
    }
}
