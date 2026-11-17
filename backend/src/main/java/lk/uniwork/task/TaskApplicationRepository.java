package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

public interface TaskApplicationRepository extends JpaRepository<TaskApplication, UUID> {
    Page<TaskApplication> findByTaskPosterClerkUserId(String clerkUserId, Pageable pageable);
    Page<TaskApplication> findByTaskIdAndTaskPosterClerkUserId(UUID taskId, String clerkUserId, Pageable pageable);
    long countByTaskPosterClerkUserIdAndStatus(String clerkUserId, TaskApplicationStatus status);
    boolean existsByTaskIdAndStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<TaskApplication> findByIdAndTaskPosterClerkUserId(UUID id, String clerkUserId);
    Optional<TaskApplication> findByTaskIdAndStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<TaskApplication> findByTaskIdAndStatus(UUID taskId, TaskApplicationStatus status);
    Page<TaskApplication> findByStudentClerkUserId(String clerkUserId, Pageable pageable);
    Page<TaskApplication> findByStudentClerkUserIdAndStatus(String clerkUserId, TaskApplicationStatus status, Pageable pageable);
    Page<TaskApplication> findByStudentClerkUserIdAndStatusIn(String clerkUserId, java.util.Collection<TaskApplicationStatus> status, Pageable pageable);
    Page<TaskApplication> findByTaskIdAndTaskPosterClerkUserIdOrderByCreatedAtDesc(UUID taskId, String clerkUserId, Pageable pageable);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("update TaskApplication a set a.status = :status where a.task.id = :taskId and a.status = :pending")
    int updatePendingStatuses(@org.springframework.data.repository.query.Param("taskId") UUID taskId,
                              @org.springframework.data.repository.query.Param("pending") TaskApplicationStatus pending,
                              @org.springframework.data.repository.query.Param("status") TaskApplicationStatus status);
}
