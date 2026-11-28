package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskApplicationRepository extends JpaRepository<TaskApplication, UUID> {
    long countByTaskPosterClerkUserIdAndStatus(String clerkUserId, TaskApplicationStatus status);
    boolean existsByTaskIdAndStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<TaskApplication> findByIdAndTaskPosterClerkUserId(UUID id, String clerkUserId);
    Optional<TaskApplication> findByTaskIdAndStudentClerkUserId(UUID taskId, String clerkUserId);
    Optional<TaskApplication> findByTaskIdAndStatus(UUID taskId, TaskApplicationStatus status);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("update TaskApplication a set a.status = :status where a.task.id = :taskId and a.status = :pending")
    int updatePendingStatuses(@org.springframework.data.repository.query.Param("taskId") UUID taskId,
                              @org.springframework.data.repository.query.Param("pending") TaskApplicationStatus pending,
                              @org.springframework.data.repository.query.Param("status") TaskApplicationStatus status);

    @Query(value = "select new lk.uniwork.task.TaskApplicationResponse(a.id, t.id, t.title, a.status, a.createdAt, p.fullName, p.university, p.faculty, a.introduction) " +
            "from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where t.poster.clerkUserId = :clerkId order by a.createdAt desc",
            countQuery = "select count(a) from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where t.poster.clerkUserId = :clerkId")
    Page<TaskApplicationResponse> pageForPoster(@Param("clerkId") String clerkId, Pageable pageable);

    @Query(value = "select new lk.uniwork.task.TaskApplicationResponse(a.id, t.id, t.title, a.status, a.createdAt, p.fullName, p.university, p.faculty, a.introduction) " +
            "from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where t.poster.clerkUserId = :clerkId and t.id = :taskId order by a.createdAt desc",
            countQuery = "select count(a) from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where t.poster.clerkUserId = :clerkId and t.id = :taskId")
    Page<TaskApplicationResponse> pageForPosterTask(@Param("clerkId") String clerkId, @Param("taskId") UUID taskId, Pageable pageable);

    @Query(value = "select new lk.uniwork.task.TaskApplicationResponse(a.id, t.id, t.title, a.status, a.createdAt, p.fullName, p.university, p.faculty, a.introduction) " +
            "from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where a.student.clerkUserId = :clerkId order by a.createdAt desc",
            countQuery = "select count(a) from TaskApplication a where a.student.clerkUserId = :clerkId")
    Page<TaskApplicationResponse> pageForStudent(@Param("clerkId") String clerkId, Pageable pageable);

    @Query(value = "select new lk.uniwork.task.TaskApplicationResponse(a.id, t.id, t.title, a.status, a.createdAt, p.fullName, p.university, p.faculty, a.introduction) " +
            "from TaskApplication a join a.task t join StudentProfile p on p.user = a.student where a.student.clerkUserId = :clerkId and a.status = :status order by a.createdAt desc",
            countQuery = "select count(a) from TaskApplication a where a.student.clerkUserId = :clerkId and a.status = :status")
    Page<TaskApplicationResponse> pageForStudentStatus(@Param("clerkId") String clerkId, @Param("status") TaskApplicationStatus status, Pageable pageable);
}
