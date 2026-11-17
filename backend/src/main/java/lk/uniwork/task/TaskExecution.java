package lk.uniwork.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lk.uniwork.user.UniWorkUser;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "task_executions")
public class TaskExecution {
    @Id @Column(name = "execution_id", nullable = false) private UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "task_id", nullable = false, unique = true) private Task task;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "application_id", nullable = false, unique = true) private TaskApplication application;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_user_id", nullable = false) private UniWorkUser student;
    @Column(name = "start_pin_hash", length = 64) private String pinHash;
    @Column(name = "start_pin_salt", length = 32) private String pinSalt;
    @Column(name = "pin_expires_at") private Instant pinExpiresAt;
    @Column(name = "pin_attempts", nullable = false) private short pinAttempts;
    @Column(name = "start_requested_at") private Instant startRequestedAt;
    @Column(name = "pin_verified_at") private Instant pinVerifiedAt;
    @Column(name = "pin_last_attempt_at") private Instant pinLastAttemptAt;
    @Column(name = "pin_last_result", length = 16) private String pinLastResult;
    @Column(name = "started_at") private Instant startedAt;
    @Column(name = "location_verified") private Boolean locationVerified;
    @Column(name = "location_distance_meters") private Double locationDistanceMeters;
    @Column(name = "location_accuracy_meters") private Double locationAccuracyMeters;
    @Column(name = "location_checked_at") private Instant locationCheckedAt;
    @Column(name = "location_result", length = 32) private String locationResult;
    @Column(name = "completed_at") private Instant completedAt;
    @Column(name = "payment_received") private Boolean paymentReceived;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected TaskExecution() { }
    public TaskExecution(Task task, TaskApplication application, UniWorkUser student) {
        this.id = UUID.randomUUID(); this.task = task; this.application = application; this.student = student;
    }
    public boolean hasActivePin(Instant now) { return pinHash != null && pinSalt != null && pinExpiresAt != null && pinExpiresAt.isAfter(now) && pinAttempts < 5; }
    public void createPin(String hash, String salt, Instant now, Instant expiresAt) {
        this.pinHash = hash; this.pinSalt = salt; this.pinExpiresAt = expiresAt; this.pinAttempts = 0; this.startRequestedAt = now;
    }
    public void addPinAttempt(Instant now) {
        this.pinAttempts++;
        this.pinLastAttemptAt = now; this.pinLastResult = "INVALID";
        if (this.pinAttempts >= 5) { this.pinHash = null; this.pinSalt = null; }
    }
    public boolean verifyHash(String hash) { return this.pinHash != null && this.pinHash.equals(hash); }
    public void verifyPin(Instant now) { this.pinVerifiedAt = now; this.pinLastAttemptAt = now; this.pinLastResult = "VERIFIED"; this.startedAt = now; clearPin(); }
    private void clearPin() { this.pinHash = null; this.pinSalt = null; this.pinExpiresAt = null; }
    public void recordLocation(boolean verified, Double distanceMeters, Double accuracyMeters, String result, Instant now) {
        this.locationVerified = verified; this.locationDistanceMeters = distanceMeters; this.locationAccuracyMeters = accuracyMeters;
        this.locationResult = result; this.locationCheckedAt = now;
    }
    public void complete(boolean paymentReceived, Instant now) { this.completedAt = now; this.paymentReceived = paymentReceived; }
    public UUID getId() { return id; } public Task getTask() { return task; } public TaskApplication getApplication() { return application; }
    public UniWorkUser getStudent() { return student; } public String getPinHash() { return pinHash; } public String getPinSalt() { return pinSalt; }
    public Instant getPinExpiresAt() { return pinExpiresAt; } public short getPinAttempts() { return pinAttempts; }
    public Instant getStartRequestedAt() { return startRequestedAt; } public Instant getPinVerifiedAt() { return pinVerifiedAt; }
    public Instant getPinLastAttemptAt() { return pinLastAttemptAt; } public String getPinLastResult() { return pinLastResult; }
    public Instant getStartedAt() { return startedAt; } public Boolean getLocationVerified() { return locationVerified; }
    public Double getLocationDistanceMeters() { return locationDistanceMeters; } public Double getLocationAccuracyMeters() { return locationAccuracyMeters; }
    public Instant getLocationCheckedAt() { return locationCheckedAt; } public String getLocationResult() { return locationResult; }
    public Instant getCompletedAt() { return completedAt; } public Boolean getPaymentReceived() { return paymentReceived; }
    public Instant getCreatedAt() { return createdAt; }
}
