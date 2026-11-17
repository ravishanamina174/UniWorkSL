package lk.uniwork.user;

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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "student_professional_profiles")
public class StudentProfessionalProfile {
    @Id @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "professional_summary", length = 1200) private String professionalSummary;
    @Column(name = "primary_location", length = 160) private String primaryLocation;
    @Column(name = "primary_latitude", precision = 9, scale = 6) private BigDecimal primaryLatitude;
    @Column(name = "primary_longitude", precision = 9, scale = 6) private BigDecimal primaryLongitude;
    @Column(name = "secondary_location", length = 160) private String secondaryLocation;
    @Column(name = "secondary_latitude", precision = 9, scale = 6) private BigDecimal secondaryLatitude;
    @Column(name = "secondary_longitude", precision = 9, scale = 6) private BigDecimal secondaryLongitude;
    @Column(nullable = false) private boolean discoverable;
    @ElementCollection(fetch = FetchType.EAGER) @CollectionTable(name = "student_professional_skills", joinColumns = @JoinColumn(name = "user_id")) @Column(name = "skill", nullable = false, length = 80) private Set<String> skills = new HashSet<>();
    @ElementCollection(fetch = FetchType.EAGER) @Enumerated(EnumType.STRING) @CollectionTable(name = "student_professional_availability", joinColumns = @JoinColumn(name = "user_id")) @Column(name = "availability", nullable = false, length = 40) private Set<Availability> availability = new HashSet<>();
    @ElementCollection(fetch = FetchType.EAGER) @Enumerated(EnumType.STRING) @CollectionTable(name = "student_professional_languages", joinColumns = @JoinColumn(name = "user_id")) @Column(name = "language", nullable = false, length = 40) private Set<ProfessionalLanguage> languages = new HashSet<>();
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected StudentProfessionalProfile() {}
    public StudentProfessionalProfile(UUID userId) { this.userId = userId; }
    public void update(String summary, String primary, BigDecimal primaryLat, BigDecimal primaryLng, String secondary, BigDecimal secondaryLat, BigDecimal secondaryLng, Set<String> skills, Set<Availability> availability, Set<ProfessionalLanguage> languages, boolean discoverable) {
        this.professionalSummary = summary; this.primaryLocation = primary; this.primaryLatitude = primaryLat; this.primaryLongitude = primaryLng;
        this.secondaryLocation = secondary; this.secondaryLatitude = secondaryLat; this.secondaryLongitude = secondaryLng;
        this.skills = new HashSet<>(skills); this.availability = new HashSet<>(availability); this.languages = new HashSet<>(languages); this.discoverable = discoverable;
    }
    public UUID getUserId(){return userId;} public String getProfessionalSummary(){return professionalSummary;} public String getPrimaryLocation(){return primaryLocation;} public BigDecimal getPrimaryLatitude(){return primaryLatitude;} public BigDecimal getPrimaryLongitude(){return primaryLongitude;} public String getSecondaryLocation(){return secondaryLocation;} public BigDecimal getSecondaryLatitude(){return secondaryLatitude;} public BigDecimal getSecondaryLongitude(){return secondaryLongitude;} public boolean isDiscoverable(){return discoverable;} public Set<String> getSkills(){return skills;} public Set<Availability> getAvailability(){return availability;} public Set<ProfessionalLanguage> getLanguages(){return languages;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
