package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.UniWorkUser;
import lk.uniwork.user.UserIdentityService;
import lk.uniwork.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskServiceTest {
    private final TaskRepository tasks = mock(TaskRepository.class);
    private final TaskApplicationRepository applications = mock(TaskApplicationRepository.class);
    private final UserIdentityService identities = mock(UserIdentityService.class);
    private final TaskService service = new TaskService(tasks, applications, identities);
    private final UniWorkUser poster = new UniWorkUser("clerk_poster", UserRole.TASK_POSTER);

    @Test
    void createsDraftTasksUsingAnAuthenticatedPoster() {
        when(identities.requireTaskPoster("clerk_poster")).thenReturn(poster);
        when(tasks.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        TaskResponse result = service.create("clerk_poster", futureTask());
        assertEquals(TaskStatus.DRAFT, result.status());
        assertEquals(new BigDecimal("2500.00"), result.amountLkr());
        assertEquals(2, result.requiredSkills().size());
        verify(tasks).save(any(Task.class));
    }

    @Test
    void publishesOnlyOwnedDraftsAndCancelsOnlyEligibleStates() {
        Task task = task(TaskStatus.DRAFT);
        when(identities.requireTaskPoster("clerk_poster")).thenReturn(poster);
        when(tasks.findByIdAndPosterClerkUserId(task.getId(), "clerk_poster")).thenReturn(Optional.of(task));
        when(tasks.findByIdForUpdate(task.getId())).thenReturn(Optional.of(task));
        assertEquals(TaskStatus.PUBLISHED, service.publish("clerk_poster", task.getId()).status());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.publish("clerk_poster", task.getId())).getStatus());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.update("clerk_poster", task.getId(), futureTask())).getStatus());
        assertEquals(TaskStatus.CANCELLED, service.cancel("clerk_poster", task.getId()).status());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.cancel("clerk_poster", task.getId())).getStatus());
    }

    @Test
    void anOtherPostersTaskIsReportedAsNotFound() {
        UUID id = UUID.randomUUID();
        when(identities.requireTaskPoster("clerk_poster")).thenReturn(poster);
        when(tasks.findByIdAndPosterClerkUserId(id, "clerk_poster")).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class, () -> service.getMine("clerk_poster", id)).getStatus());
    }

    @Test
    void paginatesAndFiltersPublishedPublicTasks() {
        Task published = task(TaskStatus.PUBLISHED);
        when(tasks.findByStatus(TaskStatus.PUBLISHED, PageRequest.of(0, 5, Sort.by(Sort.Direction.ASC, "scheduledAt"))))
                .thenReturn(new PageImpl<>(List.of(published)));
        assertEquals(1, service.listPublic(0, 5, "").content().size());
    }

    private TaskRequest futureTask() {
        return new TaskRequest("Carry boxes", "Move a few boxes upstairs", new BigDecimal("2500.00"), LocalDateTime.now().plusDays(2),
                "Colombo 07", new BigDecimal("6.9"), new BigDecimal("79.8"), Set.of("Lifting", "Careful handling"));
    }

    private Task task(TaskStatus status) {
        Task task = new Task(poster, "Carry boxes", "Move a few boxes upstairs", new BigDecimal("2500.00"),
                LocalDateTime.now().plusDays(2).atZone(java.time.ZoneId.of("Asia/Colombo")).toInstant(), "Colombo 07",
                new BigDecimal("6.9"), new BigDecimal("79.8"), Set.of("lifting", "careful handling"));
        if (status == TaskStatus.PUBLISHED) task.publish();
        if (status == TaskStatus.CANCELLED) task.cancel();
        return task;
    }
}
