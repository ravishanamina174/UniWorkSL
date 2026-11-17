package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {
    private final UserRepository users;
    private final StudentProfileRepository profiles;
    private final PiiEncryptionService encryption;
    public StudentProfileService(UserRepository users, StudentProfileRepository profiles, PiiEncryptionService encryption) {
        this.users = users; this.profiles = profiles; this.encryption = encryption;
    }
    @Transactional
    public StudentProfileResponse save(String subject, StudentProfileRequest request) {
        UniWorkUser user = users.findByClerkUserId(subject).orElse(null);
        if (user != null && user.getRole() != UserRole.STUDENT) throw new ApiException(HttpStatus.FORBIDDEN, "STUDENT_ROLE_REQUIRED", "This account cannot become a Student.");
        if (user == null) user = users.save(new UniWorkUser(subject, UserRole.STUDENT));
        String address = encryption.encrypt(request.address().trim());
        String nic = encryption.encrypt(request.nic().trim().toUpperCase());
        StudentProfile profile = profiles.findById(user.getId()).orElse(null);
        if (profile == null) profile = profiles.save(new StudentProfile(user, clean(request.fullName()), request.age(), request.gender(), address,
                clean(request.phoneNumber()), nic, clean(request.university()), clean(request.faculty())));
        else profile.update(clean(request.fullName()), request.age(), request.gender(), address, clean(request.phoneNumber()), nic,
                clean(request.university()), clean(request.faculty()));
        return response(profile);
    }
    @Transactional(readOnly = true)
    public StudentProfileResponse get(String subject) {
        UniWorkUser user = users.findByClerkUserId(subject).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                "STUDENT_PROFILE_REQUIRED", "Complete Student onboarding before accessing this profile."));
        if (user.getRole() != UserRole.STUDENT) throw new ApiException(HttpStatus.FORBIDDEN, "STUDENT_ROLE_REQUIRED", "This feature is available to Students only.");
        StudentProfile profile = profiles.findByUserClerkUserId(subject)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "STUDENT_PROFILE_INCOMPLETE", "Complete your Student profile to continue."));
        return response(profile);
    }
    private StudentProfileResponse response(StudentProfile p) {
        return new StudentProfileResponse(p.getId(), p.getFullName(), p.getAge(), p.getGender(), encryption.decrypt(p.getAddressCiphertext()),
                p.getPhoneNumber(), encryption.decrypt(p.getNicCiphertext()), p.getUniversity(), p.getFaculty(), p.getCreatedAt(), p.getUpdatedAt());
    }
    private String clean(String value) { return value.trim(); }
}
