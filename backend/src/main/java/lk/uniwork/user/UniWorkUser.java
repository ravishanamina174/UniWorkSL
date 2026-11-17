package lk.uniwork.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "uniwork_users")
public class UniWorkUser {
    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "clerk_user_id", nullable = false, unique = true, updatable = false, length = 255)
    private String clerkUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private UserRole role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UniWorkUser() { }

    public UniWorkUser(String clerkUserId, UserRole role) {
        this.id = UUID.randomUUID();
        this.clerkUserId = clerkUserId;
        this.role = role;
    }

    public UUID getId() { return id; }
    public String getClerkUserId() { return clerkUserId; }
    public UserRole getRole() { return role; }
}
