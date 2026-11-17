package lk.uniwork.user;

import org.junit.jupiter.api.Test;
import java.util.Base64;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskPosterProfileServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final TaskPosterProfileRepository profiles = mock(TaskPosterProfileRepository.class);
    private final PiiEncryptionService encryption = new PiiEncryptionService(Base64.getEncoder().encodeToString(new byte[32]));
    private final TaskPosterProfileService service = new TaskPosterProfileService(users, profiles, encryption);

    @Test
    void createsPosterRoleServerSideAndEncryptsNicAtRest() {
        when(users.findByClerkUserId("clerk_poster")).thenReturn(Optional.empty());
        when(users.save(any(UniWorkUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(profiles.findById(any())).thenReturn(Optional.empty());
        when(profiles.save(any(TaskPosterProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ProfileResponse response = service.completeOrUpdate("clerk_poster", new ProfileRequest("A Person", "A home address", "0771234567", "123456789V", Gender.PREFER_NOT_TO_SAY));
        assertEquals(UserRole.TASK_POSTER, response.role());
        assertEquals("123456789V", response.nic());
        var captor = org.mockito.ArgumentCaptor.forClass(TaskPosterProfile.class);
        verify(profiles).save(captor.capture());
        assertNotEquals("123456789V", captor.getValue().getNicCiphertext());
    }
}
