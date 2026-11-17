package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByPosterClerkUserId(String clerkUserId, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndTitleContainingIgnoreCase(String clerkUserId, String query, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndStatus(String clerkUserId, TaskStatus status, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndStatusAndTitleContainingIgnoreCase(String clerkUserId, TaskStatus status, String query, Pageable pageable);
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);
    Optional<Task> findByIdAndPosterClerkUserId(UUID id, String clerkUserId);
    Page<Task> findByStatusAndTitleContainingIgnoreCaseOrStatusAndDescriptionContainingIgnoreCase(TaskStatus titleStatus, String title, TaskStatus descriptionStatus, String description, Pageable pageable);
    long countByPosterClerkUserId(String clerkUserId);
    long countByPosterClerkUserIdAndStatus(String clerkUserId, TaskStatus status);
}
