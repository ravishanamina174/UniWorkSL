package lk.uniwork.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByPosterClerkUserId(String clerkUserId, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndTitleContainingIgnoreCase(String clerkUserId, String query, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndStatus(String clerkUserId, TaskStatus status, Pageable pageable);
    Page<Task> findByPosterClerkUserIdAndStatusAndTitleContainingIgnoreCase(String clerkUserId, TaskStatus status, String query, Pageable pageable);
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);
    Optional<Task> findByIdAndPosterClerkUserId(UUID id, String clerkUserId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select t from Task t where t.id = :id")
    Optional<Task> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    Page<Task> findByStatusAndTitleContainingIgnoreCaseOrStatusAndDescriptionContainingIgnoreCase(TaskStatus titleStatus, String title, TaskStatus descriptionStatus, String description, Pageable pageable);
    @org.springframework.data.jpa.repository.Query("select t from Task t where t.status = lk.uniwork.task.TaskStatus.PUBLISHED and (:query = '' or lower(t.title) like lower(concat('%', :query, '%')) or lower(t.description) like lower(concat('%', :query, '%'))) and (:minAmount is null or t.amountLkr >= :minAmount) and (:maxAmount is null or t.amountLkr <= :maxAmount)")
    Page<Task> browsePublished(@org.springframework.data.repository.query.Param("query") String query,
                               @org.springframework.data.repository.query.Param("minAmount") java.math.BigDecimal minAmount,
                               @org.springframework.data.repository.query.Param("maxAmount") java.math.BigDecimal maxAmount,
                               Pageable pageable);
    @org.springframework.data.jpa.repository.Query(value = """
        SELECT t.* FROM tasks t
        WHERE t.status = 'PUBLISHED'
          AND (:query = '' OR lower(t.title) LIKE concat('%', lower(:query), '%')
               OR lower(t.description) LIKE concat('%', lower(:query), '%')
               OR EXISTS (SELECT 1 FROM task_skills s WHERE s.task_id = t.task_id AND lower(s.skill) LIKE concat('%', lower(:query), '%')))
          AND t.amount_lkr BETWEEN :minAmount AND :maxAmount
          AND t.scheduled_at >= :dateStart AND t.scheduled_at < :dateEnd
          AND (:near = false OR ST_DWithin(
             ST_SetSRID(ST_MakePoint(t.longitude::double precision, t.latitude::double precision), 4326)::geography,
             ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 10000.00001)
             AND ST_Distance(ST_SetSRID(ST_MakePoint(t.longitude::double precision, t.latitude::double precision), 4326)::geography,
             ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography) <= 10000)
        ORDER BY CASE WHEN :near = true THEN ST_Distance(
             ST_SetSRID(ST_MakePoint(t.longitude::double precision, t.latitude::double precision), 4326)::geography,
             ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography) END ASC NULLS LAST,
             t.scheduled_at ASC, t.task_id ASC
        """, countQuery = """
        SELECT count(*) FROM tasks t
        WHERE t.status = 'PUBLISHED'
          AND (:query = '' OR lower(t.title) LIKE concat('%', lower(:query), '%')
               OR lower(t.description) LIKE concat('%', lower(:query), '%')
               OR EXISTS (SELECT 1 FROM task_skills s WHERE s.task_id = t.task_id AND lower(s.skill) LIKE concat('%', lower(:query), '%')))
          AND t.amount_lkr BETWEEN :minAmount AND :maxAmount
          AND t.scheduled_at >= :dateStart AND t.scheduled_at < :dateEnd
          AND (:near = false OR ST_DWithin(
             ST_SetSRID(ST_MakePoint(t.longitude::double precision, t.latitude::double precision), 4326)::geography,
             ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 10000.00001)
             AND ST_Distance(ST_SetSRID(ST_MakePoint(t.longitude::double precision, t.latitude::double precision), 4326)::geography,
             ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography) <= 10000)
        """, nativeQuery = true)
    Page<Task> browseDiscover(String query, java.math.BigDecimal minAmount, java.math.BigDecimal maxAmount,
                              java.time.Instant dateStart, java.time.Instant dateEnd,
                              boolean near, double latitude, double longitude, Pageable pageable);
    long countByPosterClerkUserId(String clerkUserId);
    long countByPosterClerkUserIdAndStatus(String clerkUserId, TaskStatus status);
}
