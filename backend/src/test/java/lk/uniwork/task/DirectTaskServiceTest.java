package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DirectTaskServiceTest {
    private final DirectTaskRepository tasks = mock(DirectTaskRepository.class);
    private final UserIdentityService identities = mock(UserIdentityService.class);
    private final UserRepository users = mock(UserRepository.class);
    private final IdentityGate gate = mock(IdentityGate.class);
    private final DirectTaskService service = new DirectTaskService(tasks, identities, users, gate,
            mock(TaskRepository.class), mock(TaskApplicationRepository.class), mock(TaskExecutionRepository.class),
            mock(StudentProfileRepository.class), mock(TaskPosterProfileRepository.class));

    @Test
    void acceptsTheDatabaseUserIdExposedByThePublicStudentDirectory() {
        UniWorkUser poster = new UniWorkUser("poster", UserRole.TASK_POSTER);
        UniWorkUser student = new UniWorkUser("student", UserRole.STUDENT);
        when(identities.requireTaskPoster("poster")).thenReturn(poster);
        when(users.findById(student.getId())).thenReturn(Optional.of(student));
        when(tasks.save(any(DirectTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DirectTaskDtos.Response response = service.create("poster", request(student.getId().toString()));

        assertEquals("Student", response.studentName());
        assertEquals(StudentCategory.MOVING_PACKING, response.category());
        verify(users).findById(student.getId());
        verify(gate).requirePosterVerified(poster.getId());
        verify(tasks).save(any(DirectTask.class));
    }

    @Test
    void rejectsInvalidStudentIdsWithoutCreatingAnOffer() {
        when(identities.requireTaskPoster("poster")).thenReturn(new UniWorkUser("poster", UserRole.TASK_POSTER));
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.create("poster", request("not-a-uuid"))).getStatus());
        verify(users).findByClerkUserId("not-a-uuid");
        verifyNoInteractions(tasks, gate);
    }

    @Test
    void keepsExistingClerkIdBasedDirectOffersWorking() {
        UniWorkUser poster = new UniWorkUser("poster", UserRole.TASK_POSTER);
        UniWorkUser student = new UniWorkUser("clerk_student", UserRole.STUDENT);
        when(identities.requireTaskPoster("poster")).thenReturn(poster);
        when(users.findByClerkUserId("clerk_student")).thenReturn(Optional.of(student));
        when(tasks.save(any(DirectTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.create("poster", request("clerk_student"));

        verify(users).findByClerkUserId("clerk_student");
        verify(tasks).save(any(DirectTask.class));
    }

    private DirectTaskDtos.Create request(String studentId) {
        return new DirectTaskDtos.Create(studentId, "Help pack boxes", Instant.now().plusSeconds(86400),
                new BigDecimal("2500"), "Colombo", new BigDecimal("6.9271"),
                new BigDecimal("79.8612"), StudentCategory.MOVING_PACKING);
    }
}
