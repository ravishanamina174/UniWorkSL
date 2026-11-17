package lk.uniwork.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lk.uniwork.user.UniWorkUser;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "task_applications", uniqueConstraints = @UniqueConstraint(name = "task_applications_task_student_unique", columnNames = {"task_id", "student_user_id"}))
public class TaskApplication {
    @Id
    @Column(name = "application_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false, updatable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_user_id", nullable = false, updatable = false)
    private UniWorkUser student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TaskApplicationStatus status = TaskApplicationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TaskApplication() { }

    public UUID getId() { return id; }
    public Task getTask() { return task; }
    public UniWorkUser getStudent() { return student; }
    public TaskApplicationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
