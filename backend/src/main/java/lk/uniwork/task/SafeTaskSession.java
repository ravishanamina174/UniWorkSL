package lk.uniwork.task;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "safetask_sessions")
public class SafeTaskSession {
    @Id @Column(name = "session_id") private UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "execution_id", unique = true) private TaskExecution execution;
    @Column(name = "token_hash", nullable = false, length = 64) private String tokenHash;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "revoked_at") private Instant revokedAt;
    private Double latitude;
    private Double longitude;
    @Column(name = "accuracy_meters") private Double accuracyMeters;
    @Column(name = "location_updated_at") private Instant locationUpdatedAt;
    protected SafeTaskSession() { }
    public SafeTaskSession(TaskExecution execution, String tokenHash, Instant now) {
        id = UUID.randomUUID(); this.execution = execution; this.tokenHash = tokenHash; createdAt = now;
    }
    public void updateLocation(double lat, double lng, Double accuracy, Instant now) {
        latitude = lat; longitude = lng; accuracyMeters = accuracy; locationUpdatedAt = now;
    }
    public void revoke(Instant now) { revokedAt = now; latitude = null; longitude = null; accuracyMeters = null; locationUpdatedAt = null; }
    public TaskExecution getExecution() { return execution; }
    public String getTokenHash() { return tokenHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Double getAccuracyMeters() { return accuracyMeters; }
    public Instant getLocationUpdatedAt() { return locationUpdatedAt; }
}
