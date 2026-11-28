package lk.uniwork.task;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lk.uniwork.user.UniWorkUser;
import jakarta.persistence.ManyToOne;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lk.uniwork.user.StudentCategory;

@Entity
@Table(name = "tasks")
@BatchSize(size = 25)
public class Task {
    @Id
    @Column(name = "task_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poster_user_id", nullable = false, updatable = false)
    private UniWorkUser poster;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(name = "amount_lkr", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountLkr;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "location_address", nullable = false, length = 500)
    private String locationAddress;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private StudentCategory category;

    @ElementCollection
    @BatchSize(size = 25)
    @CollectionTable(name = "task_skills", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "skill", nullable = false, length = 80)
    private Set<String> requiredSkills = new LinkedHashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Task() { }

    public Task(UniWorkUser poster, String title, String description, BigDecimal amountLkr, Instant scheduledAt,
                String locationAddress, BigDecimal latitude, BigDecimal longitude, Set<String> requiredSkills) {
        this.id = UUID.randomUUID();
        this.poster = poster;
        this.status = TaskStatus.DRAFT;
        updateDetails(title, description, amountLkr, scheduledAt, locationAddress, latitude, longitude, requiredSkills);
    }

    public Task(UniWorkUser poster, String title, String description, BigDecimal amountLkr, Instant scheduledAt,
                String locationAddress, BigDecimal latitude, BigDecimal longitude, Set<String> requiredSkills, StudentCategory category) {
        this(poster, title, description, amountLkr, scheduledAt, locationAddress, latitude, longitude, requiredSkills);
        this.category = category;
    }

    public void updateDetails(String title, String description, BigDecimal amountLkr, Instant scheduledAt,
                              String locationAddress, BigDecimal latitude, BigDecimal longitude, Set<String> requiredSkills) {
        this.title = title;
        this.description = description;
        this.amountLkr = amountLkr;
        this.scheduledAt = scheduledAt;
        this.locationAddress = locationAddress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.requiredSkills.clear();
        this.requiredSkills.addAll(requiredSkills);
    }

    public void publish() { this.status = TaskStatus.PUBLISHED; }
    public void cancel() { this.status = TaskStatus.CANCELLED; }
    public void acceptStudent() { this.status = TaskStatus.ACCEPTED; }
    public void start() { this.status = TaskStatus.STARTED; }
    public void complete() { this.status = TaskStatus.COMPLETED; }
    public void setCategory(StudentCategory category) { this.category = category; }
    public UUID getId() { return id; }
    public UniWorkUser getPoster() { return poster; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getAmountLkr() { return amountLkr; }
    public Instant getScheduledAt() { return scheduledAt; }
    public String getLocationAddress() { return locationAddress; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public TaskStatus getStatus() { return status; }
    public StudentCategory getCategory() { return category; }
    public Set<String> getRequiredSkills() { return Set.copyOf(requiredSkills); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
