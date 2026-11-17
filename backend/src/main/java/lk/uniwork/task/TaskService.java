package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.UniWorkUser;
import lk.uniwork.user.UserIdentityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");
    private final TaskRepository tasks;
    private final TaskApplicationRepository applications;
    private final UserIdentityService identities;

    public TaskService(TaskRepository tasks, TaskApplicationRepository applications, UserIdentityService identities) {
        this.tasks = tasks;
        this.applications = applications;
        this.identities = identities;
    }

    @Transactional
    public TaskResponse create(String subject, TaskRequest request) {
        UniWorkUser poster = identities.requireTaskPoster(subject);
        Task task = tasks.save(new Task(poster, clean(request.title()), clean(request.description()), request.amountLkr(),
                scheduledInstant(request.taskDateTime()), clean(request.locationAddress()), request.latitude(), request.longitude(), cleanSkills(request.requiredSkills())));
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> listMine(String subject, int page, int size, String search, TaskStatus status) {
        identities.requireTaskPoster(subject);
        PageRequest paging = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String query = search == null ? "" : search.trim();
        Page<Task> results;
        if (status != null && !query.isEmpty()) {
            results = tasks.findByPosterClerkUserIdAndStatusAndTitleContainingIgnoreCase(subject, status, query, paging);
        } else if (status != null) {
            results = tasks.findByPosterClerkUserIdAndStatus(subject, status, paging);
        } else if (!query.isEmpty()) {
            results = tasks.findByPosterClerkUserIdAndTitleContainingIgnoreCase(subject, query, paging);
        } else {
            results = tasks.findByPosterClerkUserId(subject, paging);
        }
        return PageResponse.from(results.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TaskResponse getMine(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        return toResponse(findOwned(subject, taskId));
    }

    @Transactional
    public TaskResponse update(String subject, UUID taskId, TaskRequest request) {
        identities.requireTaskPoster(subject);
        Task task = findOwned(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT) throw conflict("Only draft tasks can be edited.");
        task.updateDetails(clean(request.title()), clean(request.description()), request.amountLkr(), scheduledInstant(request.taskDateTime()),
                clean(request.locationAddress()), request.latitude(), request.longitude(), cleanSkills(request.requiredSkills()));
        return toResponse(task);
    }

    @Transactional
    public TaskResponse publish(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        Task task = findOwned(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT) throw conflict("Only draft tasks can be published.");
        if (!task.getScheduledAt().isAfter(Instant.now())) throw new ApiException(HttpStatus.BAD_REQUEST, "TASK_DATE_IN_PAST", "Choose a future task date and time.");
        task.publish();
        return toResponse(task);
    }

    @Transactional
    public TaskResponse cancel(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        Task task = findOwned(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT && task.getStatus() != TaskStatus.PUBLISHED) throw conflict("This task can no longer be cancelled.");
        task.cancel();
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> listPublic(int page, int size, String search) {
        PageRequest paging = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "scheduledAt"));
        String query = search == null ? "" : search.trim();
        Page<Task> results = query.isEmpty()
                ? tasks.findByStatus(TaskStatus.PUBLISHED, paging)
                : tasks.findByStatusAndTitleContainingIgnoreCaseOrStatusAndDescriptionContainingIgnoreCase(TaskStatus.PUBLISHED, query, TaskStatus.PUBLISHED, query, paging);
        return PageResponse.from(results.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TaskResponse getPublic(UUID taskId) {
        Task task = tasks.findById(taskId).filter(value -> value.getStatus() == TaskStatus.PUBLISHED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This published task could not be found."));
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskSummaryResponse summary(String subject) {
        identities.requireTaskPoster(subject);
        return new TaskSummaryResponse(tasks.countByPosterClerkUserId(subject), tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.PUBLISHED),
                tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.ONGOING), tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.COMPLETED),
                applications.countByTaskPosterClerkUserIdAndStatus(subject, TaskApplicationStatus.PENDING));
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskApplicationResponse> applications(String subject, UUID taskId, int page, int size) {
        identities.requireTaskPoster(subject);
        if (taskId != null) findOwned(subject, taskId);
        PageRequest paging = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TaskApplication> results = taskId == null
                ? applications.findByTaskPosterClerkUserId(subject, paging)
                : applications.findByTaskIdAndTaskPosterClerkUserId(taskId, subject, paging);
        return PageResponse.from(results.map(TaskApplicationResponse::from));
    }

    private Task findOwned(String subject, UUID taskId) {
        return tasks.findByIdAndPosterClerkUserId(taskId, subject)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found."));
    }

    private TaskResponse toResponse(Task task) {
        LocalDateTime sriLankaTime = task.getScheduledAt().atZone(SRI_LANKA).toLocalDateTime();
        return new TaskResponse(task.getId(), task.getPoster().getId(), task.getTitle(), task.getDescription(), task.getAmountLkr(),
                task.getRequiredSkills(), sriLankaTime, task.getLocationAddress(), task.getLatitude(), task.getLongitude(), task.getStatus(), task.getCreatedAt(), task.getUpdatedAt());
    }

    private Instant scheduledInstant(LocalDateTime value) {
        Instant instant = value.atZone(SRI_LANKA).toInstant();
        if (!instant.isAfter(Instant.now())) throw new ApiException(HttpStatus.BAD_REQUEST, "TASK_DATE_IN_PAST", "Choose a future task date and time.");
        return instant;
    }

    private Set<String> cleanSkills(Set<String> skills) {
        return skills.stream().map(String::trim).filter(skill -> !skill.isEmpty()).map(skill -> skill.toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(TreeSet::new));
    }

    private String clean(String value) { return value.trim(); }
    private ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "INVALID_TASK_TRANSITION", message); }
}
