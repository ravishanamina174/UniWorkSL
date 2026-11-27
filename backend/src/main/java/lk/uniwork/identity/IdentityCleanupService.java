package lk.uniwork.identity;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.UUID;

@Service
public class IdentityCleanupService {
    private static final Logger logger=LoggerFactory.getLogger(IdentityCleanupService.class);
    private final JdbcTemplate db;
    private final R2IdentityStorage storage;
    private final int orphanGraceDays;
    public IdentityCleanupService(JdbcTemplate db,R2IdentityStorage storage,@Value("${uniwork.identity.orphan-grace-days:45}") int orphanGraceDays) {
        this.db=db; this.storage=storage; this.orphanGraceDays=Math.max(1,orphanGraceDays);
    }

    @Transactional(propagation=Propagation.REQUIRES_NEW)
    public void deleteOne(UUID reviewId) {
        var keys=db.queryForList("select object_key from identity_reviews where review_id=? and deletion_pending=true",String.class,reviewId);
        if (keys.isEmpty() || keys.getFirst()==null) return;
        storage.delete(keys.getFirst());
        db.update("update identity_reviews set object_key=null,deletion_pending=false,updated_at=now() where review_id=? and deletion_pending=true",reviewId);
    }

    @Scheduled(fixedDelayString="${IDENTITY_CLEANUP_INTERVAL_MS:3600000}")
    public void sweep() {
        expire();
        var ids=db.queryForList("select review_id from identity_reviews where deletion_pending=true and object_key is not null limit 50",UUID.class);
        for (UUID id:ids) try { deleteOne(id); } catch (RuntimeException failure) { logger.warn("Private NIC image deletion failed; review remains queued for retry."); }
        try {
            var referenced=new HashSet<>(db.queryForList("select object_key from identity_reviews where object_key is not null",String.class));
            for (String key:storage.orphanCandidates(Instant.now().minus(orphanGraceDays,ChronoUnit.DAYS))) {
                if (!referenced.contains(key)) storage.delete(key);
            }
        } catch (RuntimeException failure) { logger.warn("Private NIC orphan cleanup failed; it will retry on the next sweep."); }
    }
    @Transactional
    public void expire() {
        db.update("update identity_reviews set status='EXPIRED',deletion_pending=true,updated_at=now() where status='PENDING' and expires_at<now()");
        db.update("update identity_verifications v set status='UNVERIFIED',updated_at=now() where status='MANUAL_REVIEW_PENDING' and not exists (select 1 from identity_reviews r where r.user_id=v.user_id and r.status='PENDING')");
    }
}
