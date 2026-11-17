package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskApplicationRepository extends JpaRepository<TaskApplication, UUID> {
    Page<TaskApplication> findByTaskPosterClerkUserId(String clerkUserId, Pageable pageable);
    Page<TaskApplication> findByTaskIdAndTaskPosterClerkUserId(UUID taskId, String clerkUserId, Pageable pageable);
    long countByTaskPosterClerkUserIdAndStatus(String clerkUserId, TaskApplicationStatus status);
}
