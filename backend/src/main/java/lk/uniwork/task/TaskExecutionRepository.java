package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TaskExecutionRepository extends JpaRepository<TaskExecution, UUID> {
    Optional<TaskExecution> findByTaskId(UUID taskId);
    Optional<TaskExecution> findByTaskIdAndStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<TaskExecution> findByTaskIdAndTaskPosterClerkUserId(UUID taskId, String clerkUserId);
    Page<TaskExecution> findByStudentClerkUserId(String clerkUserId, Pageable pageable);
    Page<TaskExecution> findByStudentClerkUserIdAndCompletedAtIsNotNull(String clerkUserId, Pageable pageable);
    Page<TaskExecution> findByStudentClerkUserIdAndCompletedAtIsNull(String clerkUserId, Pageable pageable);
}
