package lk.uniwork.identity;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class IdentityCleanupServiceTest {
    private final JdbcTemplate db=mock(JdbcTemplate.class);
    private final R2IdentityStorage storage=mock(R2IdentityStorage.class);
    private final IdentityCleanupService cleanup=new IdentityCleanupService(db,storage,45);

    @Test void failedDeleteKeepsTheDatabaseRetryMarker() {
        UUID id=UUID.randomUUID();
        when(db.queryForList(startsWith("select object_key"),eq(String.class),eq(id))).thenReturn(List.of("nic-reviews/example.jpg"));
        doThrow(new IllegalStateException("Unavailable")).when(storage).delete("nic-reviews/example.jpg");
        assertThrows(IllegalStateException.class,()->cleanup.deleteOne(id));
        verify(db,never()).update(startsWith("update identity_reviews set object_key=null"),eq(id));
    }

    @Test void completedDeleteClearsTheRetryMarker() {
        UUID id=UUID.randomUUID();
        when(db.queryForList(startsWith("select object_key"),eq(String.class),eq(id))).thenReturn(List.of("nic-reviews/example.jpg"));
        cleanup.deleteOne(id);
        verify(storage).delete("nic-reviews/example.jpg");
        verify(db).update(startsWith("update identity_reviews set object_key=null"),eq(id));
    }

    @Test void orphanSweepDoesNotDeleteReferencedDocuments() {
        when(db.queryForList(startsWith("select review_id"),eq(UUID.class))).thenReturn(List.of());
        when(db.queryForList(startsWith("select object_key from identity_reviews where"),eq(String.class)))
                .thenReturn(List.of("nic-reviews/active.jpg"));
        when(storage.orphanCandidates(any(Instant.class))).thenReturn(List.of("nic-reviews/active.jpg","nic-reviews/orphan.jpg"));
        cleanup.sweep();
        verify(storage,never()).delete("nic-reviews/active.jpg");
        verify(storage).delete("nic-reviews/orphan.jpg");
        verify(db).update(startsWith("update identity_reviews set status='EXPIRED'"));
    }
}
