package lk.uniwork.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "task_poster_profiles")
public class TaskPosterProfile {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UniWorkUser user;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "phone_number", nullable = false, length = 24)
    private String phoneNumber;

    @Column(name = "nic_ciphertext", nullable = false, columnDefinition = "text")
    private String nicCiphertext;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Gender gender;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TaskPosterProfile() { }

    public TaskPosterProfile(UniWorkUser user, String fullName, String address, String phoneNumber, String nicCiphertext, Gender gender) {
        this.user = user;
        this.fullName = fullName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.nicCiphertext = nicCiphertext;
        this.gender = gender;
    }

    public void update(String fullName, String address, String phoneNumber, String nicCiphertext, Gender gender) {
        this.fullName = fullName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.nicCiphertext = nicCiphertext;
        this.gender = gender;
    }

    public UUID getId() { return id; }
    public UniWorkUser getUser() { return user; }
    public String getFullName() { return fullName; }
    public String getAddress() { return address; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getNicCiphertext() { return nicCiphertext; }
    public Gender getGender() { return gender; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
