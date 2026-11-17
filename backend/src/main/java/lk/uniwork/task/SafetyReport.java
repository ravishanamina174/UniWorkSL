package lk.uniwork.task;
import jakarta.persistence.*;
import lk.uniwork.user.UniWorkUser;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="safety_reports")
public class SafetyReport {
    @Id @Column(name="report_id", nullable=false) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="task_id", nullable=false) private Task task;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="reporter_user_id", nullable=false) private UniWorkUser reporter;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=32) private SafetyReportCategory category;
    @Column(nullable=false, length=4000) private String description;
    @Column(nullable=false, length=24) private String status="OPEN";
    @CreationTimestamp @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    protected SafetyReport() { }
    public SafetyReport(Task task, UniWorkUser reporter, SafetyReportCategory category, String description){this.id=UUID.randomUUID();this.task=task;this.reporter=reporter;this.category=category;this.description=description;}
    public UUID getId(){return id;} public Task getTask(){return task;} public UniWorkUser getReporter(){return reporter;} public SafetyReportCategory getCategory(){return category;}
    public String getDescription(){return description;} public String getStatus(){return status;} public Instant getCreatedAt(){return createdAt;}
}
