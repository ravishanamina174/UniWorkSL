package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserIdentityService {
    private final UserRepository users;

    public UserIdentityService(UserRepository users) { this.users = users; }

    @Transactional(readOnly = true)
    public UniWorkUser requireTaskPoster(String clerkUserId) {
        UniWorkUser user = users.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "TASK_POSTER_PROFILE_REQUIRED", "Complete Task Poster onboarding before using this feature."));
        if (user.getRole() != UserRole.TASK_POSTER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TASK_POSTER_ROLE_REQUIRED", "This action is available to Task Posters only.");
        }
        return user;
    }
}
