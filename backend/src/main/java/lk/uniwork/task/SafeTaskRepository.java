package lk.uniwork.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SafeTaskRepository extends JpaRepository<SafeTaskSession, UUID> {
    Optional<SafeTaskSession> findByExecutionTaskIdAndExecutionStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<SafeTaskSession> findByTokenHash(String tokenHash);
    @Modifying
    @Query(value = "DELETE FROM safetask_sessions s USING task_executions e WHERE s.execution_id=e.execution_id AND (s.revoked_at < :cutoff OR e.completed_at < :completedCutoff OR (e.started_at IS NULL AND s.created_at < :cutoff))", nativeQuery = true)
    int deleteRetainedExpired(@Param("cutoff") Instant cutoff, @Param("completedCutoff") Instant completedCutoff);
}
