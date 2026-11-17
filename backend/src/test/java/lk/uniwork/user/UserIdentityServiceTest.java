package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserIdentityServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final UserIdentityService service = new UserIdentityService(users);

    @Test
    void taskPosterRoleIsReadFromTheInternalUserRecord() {
        when(users.findByClerkUserId("clerk_poster")).thenReturn(Optional.of(new UniWorkUser("clerk_poster", UserRole.TASK_POSTER)));
        assertEquals(UserRole.TASK_POSTER, service.requireTaskPoster("clerk_poster").getRole());
    }

    @Test
    void refusesUnknownOrStudentUsers() {
        when(users.findByClerkUserId("unknown")).thenReturn(Optional.empty());
        when(users.findByClerkUserId("clerk_student")).thenReturn(Optional.of(new UniWorkUser("clerk_student", UserRole.STUDENT)));
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.requireTaskPoster("unknown")).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.requireTaskPoster("clerk_student")).getStatus());
    }

    @Test
    void studentRoleIsReadFromTheInternalUserRecord() {
        when(users.findByClerkUserId("clerk_student")).thenReturn(Optional.of(new UniWorkUser("clerk_student", UserRole.STUDENT)));
        assertEquals(UserRole.STUDENT, service.requireStudent("clerk_student").getRole());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.requireStudent("clerk_poster")).getStatus());
    }
}
