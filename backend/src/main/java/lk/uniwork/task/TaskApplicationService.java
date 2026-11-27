package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.StudentProfile;
import lk.uniwork.user.StudentProfileRepository;
import lk.uniwork.user.UniWorkUser;
import lk.uniwork.user.UserIdentityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.UUID;

@Service
public class TaskApplicationService {
    @PersistenceContext private EntityManager entityManager;
    private final TaskRepository tasks;
    private final TaskApplicationRepository applications;
    private final StudentProfileRepository profiles;
    private final UserIdentityService identities;
    private final TaskExecutionRepository executions;
    private final lk.uniwork.identity.IdentityVerificationService verification;
    public TaskApplicationService(TaskRepository tasks, TaskApplicationRepository applications,
                                  StudentProfileRepository profiles, UserIdentityService identities, TaskExecutionRepository executions,
                                  lk.uniwork.identity.IdentityVerificationService verification) {
        this.tasks = tasks; this.applications = applications; this.profiles = profiles; this.identities = identities; this.executions = executions; this.verification=verification;
    }

    @Transactional
    public TaskApplicationResponse apply(String subject, UUID taskId) {
        UniWorkUser student = identities.requireStudent(subject);
        StudentProfile profile = profiles.findById(student.getId()).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                "STUDENT_PROFILE_REQUIRED", "Complete your Student profile before applying."));
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task is unavailable."));
        if (task.getStatus() != TaskStatus.PUBLISHED) throw conflict("Only published tasks accept applications.");
        if (task.getPoster().getId().equals(student.getId())) throw new ApiException(HttpStatus.FORBIDDEN, "OWN_TASK_APPLICATION", "You cannot apply to your own task.");
        verification.requireVerified(student.getId(), "NIC_VERIFICATION_REQUIRED", "Complete NIC matching in your profile before applying for tasks.");
        TaskApplication existing = applications.findByTaskIdAndStudentClerkUserId(taskId, subject).orElse(null);
        if (existing != null) {
            if (existing.getStatus() != TaskApplicationStatus.WITHDRAWN) throw conflict("You already have an active application for this task.");
            existing.changeStatus(TaskApplicationStatus.PENDING);
            return TaskApplicationResponse.from(existing, profile);
        }
        TaskApplication saved = applications.save(new TaskApplication(task, student));
        return TaskApplicationResponse.from(saved, profile);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskApplicationResponse> mine(String subject, int page, int size, TaskApplicationStatus status) {
        identities.requireStudent(subject);
        var paging = PageRequest.of(page, size);
        var result = status == null ? applications.pageForStudent(subject, paging)
                : applications.pageForStudentStatus(subject, status, paging);
        return PageResponse.from(result);
    }

    @Transactional
    public TaskApplicationResponse withdraw(String subject, UUID applicationId) {
        identities.requireStudent(subject);
        TaskApplication application = applications.findById(applicationId)
                .filter(value -> value.getStudent().getClerkUserId().equals(subject))
                .orElseThrow(() -> notFound("APPLICATION_NOT_FOUND", "This application could not be found."));
        tasks.findByIdForUpdate(application.getTask().getId()).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        entityManager.refresh(application);
        if (application.getStatus() != TaskApplicationStatus.PENDING) throw conflict("Only pending applications can be withdrawn.");
        application.withdraw();
        return withStudentProfile(application);
    }

    @Transactional
    public TaskApplicationResponse accept(String subject, UUID applicationId) {
        identities.requireTaskPoster(subject);
        TaskApplication selected = applications.findByIdAndTaskPosterClerkUserId(applicationId, subject)
                .orElseThrow(() -> notFound("APPLICATION_NOT_FOUND", "This application could not be found."));
        Task task = tasks.findByIdForUpdate(selected.getTask().getId())
                .orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        entityManager.refresh(selected);
        if (task.getStatus() != TaskStatus.PUBLISHED) throw conflict("A student can only be selected for a published task.");
        if (selected.getStatus() != TaskApplicationStatus.PENDING) throw conflict("This application is no longer pending.");
        applications.updatePendingStatuses(task.getId(), TaskApplicationStatus.PENDING, TaskApplicationStatus.REJECTED);
        selected.changeStatus(TaskApplicationStatus.ACCEPTED);
        task.acceptStudent();
        executions.save(new TaskExecution(task, selected, selected.getStudent()));
        return withStudentProfile(selected);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskApplicationResponse> listPoster(String subject, UUID taskId, int page, int size) {
        identities.requireTaskPoster(subject);
        if (taskId != null && tasks.findByIdAndPosterClerkUserId(taskId, subject).isEmpty())
            throw notFound("TASK_NOT_FOUND", "This task could not be found.");
        var paging = PageRequest.of(page, size);
        var result = taskId == null ? applications.pageForPoster(subject, paging)
                : applications.pageForPosterTask(subject, taskId, paging);
        return PageResponse.from(result);
    }

    @Transactional
    public TaskApplicationResponse reject(String subject, UUID applicationId) {
        identities.requireTaskPoster(subject);
        TaskApplication application = applications.findByIdAndTaskPosterClerkUserId(applicationId, subject)
                .orElseThrow(() -> notFound("APPLICATION_NOT_FOUND", "This application could not be found."));
        tasks.findByIdForUpdate(application.getTask().getId()).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        entityManager.refresh(application);
        if (application.getTask().getStatus() != TaskStatus.PUBLISHED || application.getStatus() != TaskApplicationStatus.PENDING)
            throw conflict("Only pending applications for published tasks can be rejected.");
        application.changeStatus(TaskApplicationStatus.REJECTED);
        return withStudentProfile(application);
    }

    @Transactional(readOnly = true)
    public TaskApplicationResponse selected(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        if (tasks.findByIdAndPosterClerkUserId(taskId, subject).isEmpty()) throw notFound("TASK_NOT_FOUND", "This task could not be found.");
        TaskApplication selected = applications.findByTaskIdAndStatus(taskId, TaskApplicationStatus.ACCEPTED)
                .orElseThrow(() -> notFound("SELECTED_STUDENT_NOT_FOUND", "No student has been selected for this task."));
        return withStudentProfile(selected);
    }

    private TaskApplicationResponse withStudentProfile(TaskApplication application) {
        StudentProfile profile = profiles.findById(application.getStudent().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "STUDENT_PROFILE_MISSING", "The applicant profile is unavailable."));
        return TaskApplicationResponse.from(application, profile);
    }
    private ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "INVALID_APPLICATION_TRANSITION", message); }
    private ApiException notFound(String code, String message) { return new ApiException(HttpStatus.NOT_FOUND, code, message); }
}
