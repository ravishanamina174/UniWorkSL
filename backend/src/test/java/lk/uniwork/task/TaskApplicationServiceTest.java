package lk.uniwork.task;

import jakarta.persistence.EntityManager;
import lk.uniwork.common.ApiException;
import lk.uniwork.user.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskApplicationServiceTest {
    private final TaskRepository tasks=mock(TaskRepository.class);
    private final TaskApplicationRepository applications=mock(TaskApplicationRepository.class);
    private final StudentProfileRepository profiles=mock(StudentProfileRepository.class);
    private final UserIdentityService identities=mock(UserIdentityService.class);
    private final TaskExecutionRepository executions=mock(TaskExecutionRepository.class);
    private final TaskApplicationService service=new TaskApplicationService(tasks,applications,profiles,identities,executions);
    private final UniWorkUser poster=new UniWorkUser("poster",UserRole.TASK_POSTER);
    private final UniWorkUser student=new UniWorkUser("student",UserRole.STUDENT);

    @Test void aStudentCannotApplyToAnUnpublishedTaskOrSubmitAnActiveDuplicate() {
        Task task=task(); when(identities.requireStudent("student")).thenReturn(student);
        when(profiles.findById(student.getId())).thenReturn(Optional.of(profile()));
        when(tasks.findByIdForUpdate(task.getId())).thenReturn(Optional.of(task));
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,()->service.apply("student",task.getId())).getStatus());
        task.publish();
        TaskApplication existing=new TaskApplication(task,student);
        when(applications.findByTaskIdAndStudentClerkUserId(task.getId(),"student")).thenReturn(Optional.of(existing));
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,()->service.apply("student",task.getId())).getStatus());
        verify(applications,never()).save(any());
    }

    @Test void selectionLocksAndAcceptsExactlyTheChosenApplicant() {
        Task task=task(); task.publish();
        TaskApplication selected=new TaskApplication(task,student);
        when(identities.requireTaskPoster("poster")).thenReturn(poster);
        when(applications.findByIdAndTaskPosterClerkUserId(selected.getId(),"poster")).thenReturn(Optional.of(selected));
        when(tasks.findByIdForUpdate(task.getId())).thenReturn(Optional.of(task));
        when(applications.updatePendingStatuses(task.getId(),TaskApplicationStatus.PENDING,TaskApplicationStatus.REJECTED)).thenReturn(1);
        when(profiles.findById(student.getId())).thenReturn(Optional.of(profile()));
        ReflectionTestUtils.setField(service,"entityManager",mock(EntityManager.class));
        var response=service.accept("poster",selected.getId());
        assertEquals(TaskApplicationStatus.ACCEPTED,response.status()); assertEquals(TaskStatus.ACCEPTED,task.getStatus());
        verify(applications).updatePendingStatuses(task.getId(),TaskApplicationStatus.PENDING,TaskApplicationStatus.REJECTED);
        verify(executions).save(any(TaskExecution.class));
    }

    private Task task(){return new Task(poster,"Task","Details",new BigDecimal("1000"),LocalDateTime.now().plusDays(1).atZone(ZoneId.of("Asia/Colombo")).toInstant(),"Address",new BigDecimal("6.9"),new BigDecimal("79.8"),Set.of("help"));}
    private StudentProfile profile(){return new StudentProfile(student,"Student",(short)22,Gender.OTHER,"encrypted","+94770000000","encrypted","University","Faculty");}
}
