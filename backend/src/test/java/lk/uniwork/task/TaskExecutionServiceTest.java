package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.PiiEncryptionService;
import lk.uniwork.user.StudentProfileRepository;
import lk.uniwork.user.UniWorkUser;
import lk.uniwork.user.UserIdentityService;
import lk.uniwork.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskExecutionServiceTest {
    private final TaskRepository tasks=mock(TaskRepository.class);
    private final TaskExecutionRepository executions=mock(TaskExecutionRepository.class);
    private final StudentProfileRepository profiles=mock(StudentProfileRepository.class);
    private final UserIdentityService identities=mock(UserIdentityService.class);
    private final PiiEncryptionService crypto=new PiiEncryptionService("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    private final TaskExecutionService service=new TaskExecutionService(tasks,executions,profiles,identities,crypto,new LocationService());
    private final UniWorkUser poster=new UniWorkUser("poster",UserRole.TASK_POSTER);
    private final UniWorkUser student=new UniWorkUser("student",UserRole.STUDENT);

    @Test void validPinStartsTaskAndDeniedLocationDoesNotBlockStartOrUnresolvedPayment() {
        Fixture f=fixture();
        when(identities.requireStudent("student")).thenReturn(student);
        when(tasks.findByIdForUpdate(f.task.getId())).thenReturn(Optional.of(f.task));
        when(executions.findByTaskIdAndStudentClerkUserId(f.task.getId(),"student")).thenReturn(Optional.of(f.execution));
        service.requestStart("student",f.task.getId());
        String pin=crypto.deriveFourDigitCode(f.task.getId() + ":" + student.getId(),f.execution.getPinSalt());
        var verified=service.verifyPin("student",f.task.getId(),pin);
        assertTrue(verified.verified()); assertEquals(TaskStatus.STARTED.name(),verified.taskStatus());
        var location=service.checkLocation("student",f.task.getId(),new LocationCheckRequest(false,false,null,null,null));
        assertFalse(location.locationVerified()); assertEquals("PERMISSION_DENIED",location.locationResult());
        var completed=service.complete("student",f.task.getId(),false);
        assertEquals(TaskStatus.COMPLETED.name(),completed.status()); assertFalse(completed.paymentReceived());
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,()->service.complete("student",f.task.getId(),false)).getStatus());
    }

    @Test void fiveWrongPinsLockTheCodeAndApplyRegenerationCooldown() {
        Fixture f=fixture();
        when(identities.requireStudent("student")).thenReturn(student);
        when(tasks.findByIdForUpdate(f.task.getId())).thenReturn(Optional.of(f.task));
        when(executions.findByTaskIdAndStudentClerkUserId(f.task.getId(),"student")).thenReturn(Optional.of(f.execution));
        service.requestStart("student",f.task.getId());
        String real=crypto.deriveFourDigitCode(f.task.getId() + ":" + student.getId(),f.execution.getPinSalt());
        String wrong=real.equals("0000") ? "0001" : "0000";
        PinVerificationResponse result=null;
        for(int i=0;i<5;i++) result=service.verifyPin("student",f.task.getId(),wrong);
        assertNotNull(result); assertFalse(result.verified()); assertTrue(result.locked()); assertEquals(0,result.attemptsRemaining());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS,assertThrows(ApiException.class,()->service.requestStart("student",f.task.getId())).getStatus());
    }

    @Test void expiredCodeCannotStartButMayBeReplacedWithANewSession() {
        Fixture f=fixture();
        when(identities.requireStudent("student")).thenReturn(student);
        when(tasks.findByIdForUpdate(f.task.getId())).thenReturn(Optional.of(f.task));
        when(executions.findByTaskIdAndStudentClerkUserId(f.task.getId(),"student")).thenReturn(Optional.of(f.execution));
        var expired=java.time.Instant.now().minusSeconds(360);
        f.execution.createPin("expired-hash","0123456789abcdef0123456789abcdef",expired,expired.plusSeconds(300));
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,()->service.verifyPin("student",f.task.getId(),"1234")).getStatus());
        service.requestStart("student",f.task.getId());
        assertTrue(f.execution.hasActivePin(java.time.Instant.now()));
    }

    private Fixture fixture() {
        Task task=new Task(poster,"Carry boxes","Move boxes",new BigDecimal("2500.00"),LocalDateTime.now().plusDays(1).atZone(ZoneId.of("Asia/Colombo")).toInstant(),
                "Colombo 07",new BigDecimal("6.9271"),new BigDecimal("79.8612"),Set.of("lifting"));
        task.acceptStudent();
        TaskApplication app=new TaskApplication(task,student); app.changeStatus(TaskApplicationStatus.ACCEPTED);
        return new Fixture(task,new TaskExecution(task,app,student));
    }
    private record Fixture(Task task,TaskExecution execution) { }
}
