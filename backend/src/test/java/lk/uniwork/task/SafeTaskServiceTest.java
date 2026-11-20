package lk.uniwork.task;

import lk.uniwork.user.UserIdentityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SafeTaskServiceTest {
    private final SafeTaskRepository sessions = mock(SafeTaskRepository.class);
    private final TaskExecutionRepository executions = mock(TaskExecutionRepository.class);
    private final UserIdentityService identities = mock(UserIdentityService.class);
    private final TaskExecution execution = mock(TaskExecution.class);
    private final Task task = mock(Task.class);
    private final UUID taskId = UUID.randomUUID();
    private final SafeTaskService service = new SafeTaskService(sessions, executions, identities);
    @BeforeEach void setup() {
        when(executions.findByTaskIdAndStudentClerkUserId(taskId, "student")).thenReturn(Optional.of(execution));
        when(execution.getTask()).thenReturn(task);
        when(task.getStatus()).thenReturn(TaskStatus.ACCEPTED);
    }
    @Test void tokenIsRandomAndOnlyHashIsStored() {
        String token = service.create("student", taskId);
        ArgumentCaptor<SafeTaskSession> saved = ArgumentCaptor.forClass(SafeTaskSession.class);
        verify(sessions).save(saved.capture());
        assertEquals(64, token.length());
        assertEquals(64, saved.getValue().getTokenHash().length());
        assertNotEquals(token, saved.getValue().getTokenHash());
        assertNull(saved.getValue().getLatitude());
    }
    @Test void guardianCannotReadRevokedOrExpiredLocation() {
        SafeTaskSession session = new SafeTaskSession(execution, "hash", Instant.now().minusSeconds(400));
        when(sessions.findByTokenHash(anyString())).thenReturn(Optional.of(session));
        when(task.getStatus()).thenReturn(TaskStatus.COMPLETED);
        when(execution.getCompletedAt()).thenReturn(Instant.now().minusSeconds(3601));
        assertThrows(lk.uniwork.common.ApiException.class, () -> service.guardian("a".repeat(64)));
        when(execution.getCompletedAt()).thenReturn(Instant.now());
        session.revoke(Instant.now());
        assertThrows(lk.uniwork.common.ApiException.class, () -> service.guardian("a".repeat(64)));
    }
    @Test void guardianShowsLatestPositionDuringServerTimedSafetyWindow() {
        SafeTaskSession session = new SafeTaskSession(execution, "hash", Instant.now().minusSeconds(400));
        session.updateLocation(6.92, 79.86, 15.0, Instant.now());
        when(sessions.findByTokenHash(anyString())).thenReturn(Optional.of(session));
        when(task.getStatus()).thenReturn(TaskStatus.COMPLETED);
        when(task.getTitle()).thenReturn("Event support");
        when(task.getLocationAddress()).thenReturn("Private street, Colombo, Sri Lanka");
        when(execution.getCompletedAt()).thenReturn(Instant.now().minusSeconds(1800));
        SafeTaskGuardianView view = service.guardian("a".repeat(64));
        assertEquals("SAFETY_WINDOW", view.status());
        assertEquals("Colombo, Sri Lanka", view.generalTaskLocation());
        assertEquals(6.92, view.latitude());
    }
    @Test void locationRejectedUntilVerifiedStart() {
        SafeTaskSession session = new SafeTaskSession(execution, "hash", Instant.now());
        when(sessions.findByExecutionTaskIdAndExecutionStudentClerkUserId(taskId, "student")).thenReturn(Optional.of(session));
        assertThrows(lk.uniwork.common.ApiException.class, () -> service.location("student", taskId, new SafeTaskLocationRequest(6.9, 79.8, 10.0)));
    }
}
