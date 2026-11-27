package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskPosterProfileService {
    private final UserRepository users;
    private final TaskPosterProfileRepository profiles;
    private final PiiEncryptionService encryption;
    private final lk.uniwork.identity.IdentityVerificationService verification;

    public TaskPosterProfileService(UserRepository users, TaskPosterProfileRepository profiles, PiiEncryptionService encryption,
            lk.uniwork.identity.IdentityVerificationService verification) {
        this.users = users;
        this.profiles = profiles;
        this.encryption = encryption;
        this.verification=verification;
    }

    @Transactional(readOnly = true)
    public ProfileResponse get(String clerkUserId) {
        UniWorkUser user = users.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROFILE_INCOMPLETE", "Complete your Task Poster profile to continue."));
        if (user.getRole() != UserRole.TASK_POSTER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TASK_POSTER_ROLE_REQUIRED", "This profile is not a Task Poster profile.");
        }
        TaskPosterProfile profile = profiles.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROFILE_INCOMPLETE", "Complete your Task Poster profile to continue."));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileStatusResponse status(String clerkUserId) {
        UniWorkUser user = users.findByClerkUserId(clerkUserId).orElse(null);
        if (user == null) return new ProfileStatusResponse(false);
        if (user.getRole() != UserRole.TASK_POSTER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TASK_POSTER_ROLE_REQUIRED", "This account is not permitted to access the Task Poster dashboard.");
        }
        return new ProfileStatusResponse(profiles.existsById(user.getId()));
    }

    @Transactional
    public ProfileResponse completeOrUpdate(String clerkUserId, ProfileRequest request) {
        UniWorkUser user = users.findByClerkUserId(clerkUserId).orElse(null);
        if (user != null && user.getRole() != UserRole.TASK_POSTER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TASK_POSTER_ROLE_REQUIRED", "This account is not permitted to become a Task Poster.");
        }
        String ciphertext = encryption.encrypt(request.nic().trim().toUpperCase());
        if (user == null) user = users.save(new UniWorkUser(clerkUserId, UserRole.TASK_POSTER));
        TaskPosterProfile profile = profiles.findById(user.getId()).orElse(null);
        if (profile != null) verification.requireNicUnchanged(user.getId(), encryption.decrypt(profile.getNicCiphertext()), request.nic());
        if (profile == null) {
            profile = new TaskPosterProfile(user, request.fullName().trim(), request.address().trim(), request.phoneNumber().trim(), ciphertext, request.gender());
            profile = profiles.save(profile);
        } else {
            profile.update(request.fullName().trim(), request.address().trim(), request.phoneNumber().trim(), ciphertext, request.gender());
        }
        return toResponse(profile);
    }

    private ProfileResponse toResponse(TaskPosterProfile profile) {
        return new ProfileResponse(profile.getId(), profile.getUser().getRole(), profile.getFullName(), profile.getAddress(),
                profile.getPhoneNumber(), encryption.decrypt(profile.getNicCiphertext()), profile.getGender(), profile.getCreatedAt(), profile.getUpdatedAt(),
                verification.status(profile.getId()).status());
    }
}
