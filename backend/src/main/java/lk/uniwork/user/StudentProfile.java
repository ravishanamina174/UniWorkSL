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
@Table(name = "student_profiles")
public class StudentProfile {
    @Id @Column(name = "user_id", nullable = false) private UUID id;
    @MapsId @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private UniWorkUser user;
    @Column(name = "full_name", nullable = false, length = 160) private String fullName;
    @Column(nullable = false) private short age;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private Gender gender;
    @Column(name = "address_ciphertext", nullable = false, columnDefinition = "text") private String addressCiphertext;
    @Column(name = "phone_number", nullable = false, length = 24) private String phoneNumber;
    @Column(name = "nic_ciphertext", nullable = false, columnDefinition = "text") private String nicCiphertext;
    @Column(nullable = false, length = 200) private String university;
    @Column(nullable = false, length = 200) private String faculty;
    @Enumerated(EnumType.STRING) @Column(name = "primary_category", length = 40) private StudentCategory primaryCategory;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected StudentProfile() { }
    public StudentProfile(UniWorkUser user, String fullName, short age, Gender gender, String addressCiphertext,
                          String phoneNumber, String nicCiphertext, String university, String faculty) {
        this(user, fullName, age, gender, addressCiphertext, phoneNumber, nicCiphertext, university, faculty, null);
    }
    public StudentProfile(UniWorkUser user, String fullName, short age, Gender gender, String addressCiphertext,
                          String phoneNumber, String nicCiphertext, String university, String faculty, StudentCategory primaryCategory) {
        this.user = user; update(fullName, age, gender, addressCiphertext, phoneNumber, nicCiphertext, university, faculty, primaryCategory);
    }
    public void update(String fullName, short age, Gender gender, String addressCiphertext,
                       String phoneNumber, String nicCiphertext, String university, String faculty) {
        update(fullName, age, gender, addressCiphertext, phoneNumber, nicCiphertext, university, faculty, this.primaryCategory);
    }
    public void update(String fullName, short age, Gender gender, String addressCiphertext,
                       String phoneNumber, String nicCiphertext, String university, String faculty, StudentCategory primaryCategory) {
        this.fullName = fullName; this.age = age; this.gender = gender; this.addressCiphertext = addressCiphertext;
        this.phoneNumber = phoneNumber; this.nicCiphertext = nicCiphertext; this.university = university; this.faculty = faculty; this.primaryCategory = primaryCategory;
    }
    public UUID getId() { return id; } public UniWorkUser getUser() { return user; } public String getFullName() { return fullName; }
    public short getAge() { return age; } public Gender getGender() { return gender; } public String getAddressCiphertext() { return addressCiphertext; }
    public String getPhoneNumber() { return phoneNumber; } public String getNicCiphertext() { return nicCiphertext; }
    public String getUniversity() { return university; } public String getFaculty() { return faculty; }
    public StudentCategory getPrimaryCategory() { return primaryCategory; }
    public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; }
}
