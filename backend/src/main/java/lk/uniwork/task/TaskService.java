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
    private final lk.uniwork.admin.AdminService admin;

    public TaskService(TaskRepository tasks, TaskApplicationRepository applications, UserIdentityService identities,
            lk.uniwork.admin.AdminService admin) {
        this.tasks = tasks;
        this.applications = applications;
        this.identities = identities;
        this.admin = admin;
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
        Task task = findOwnedForUpdate(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT) throw conflict("Only draft tasks can be edited.");
        task.updateDetails(clean(request.title()), clean(request.description()), request.amountLkr(), scheduledInstant(request.taskDateTime()),
                clean(request.locationAddress()), request.latitude(), request.longitude(), cleanSkills(request.requiredSkills()));
        return toResponse(task);
    }

    @Transactional
    public TaskResponse publish(String subject, UUID taskId) {
        UniWorkUser poster = identities.requireTaskPoster(subject);
        admin.requireCanPublish(poster.getId());
        Task task = findOwnedForUpdate(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT) throw conflict("Only draft tasks can be published.");
        if (!task.getScheduledAt().isAfter(Instant.now())) throw new ApiException(HttpStatus.BAD_REQUEST, "TASK_DATE_IN_PAST", "Choose a future task date and time.");
        task.publish();
        return toResponse(task);
    }

    @Transactional
    public TaskResponse cancel(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        Task task = findOwnedForUpdate(subject, taskId);
        if (task.getStatus() != TaskStatus.DRAFT && task.getStatus() != TaskStatus.PUBLISHED) throw conflict("This task can no longer be cancelled.");
        if (task.getStatus() == TaskStatus.PUBLISHED)
            applications.updatePendingStatuses(task.getId(), TaskApplicationStatus.PENDING, TaskApplicationStatus.REJECTED);
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
    public PageResponse<TaskResponse> listPublic(int page, int size, String search, java.math.BigDecimal minAmount, java.math.BigDecimal maxAmount) {
        PageRequest paging = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "scheduledAt"));
        if (minAmount != null && minAmount.signum() < 0 || maxAmount != null && maxAmount.signum() < 0
                || minAmount != null && maxAmount != null && minAmount.compareTo(maxAmount) > 0)
            throw new ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "INVALID_AMOUNT_FILTER", "Amount filters are invalid.");
        var results = tasks.browsePublished(search == null ? "" : search.trim(), minAmount, maxAmount, paging);
        return PageResponse.from(results.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> discover(int page, int size, String search, java.math.BigDecimal minAmount,
            java.math.BigDecimal maxAmount, java.time.LocalDate date, Double latitude, Double longitude) {
        if (minAmount != null && minAmount.signum() < 0 || maxAmount != null && maxAmount.signum() < 0
                || minAmount != null && maxAmount != null && minAmount.compareTo(maxAmount) > 0)
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AMOUNT_FILTER", "Choose a valid price range.");
        if ((latitude == null) != (longitude == null) || latitude != null && (!Double.isFinite(latitude) || !Double.isFinite(longitude)
                || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180))
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_LOCATION_FILTER", "Choose a valid location.");
        java.time.Instant start = date == null ? java.time.Instant.EPOCH : date.atStartOfDay(SRI_LANKA).toInstant();
        java.time.Instant end = date == null ? java.time.Instant.parse("9999-12-31T00:00:00Z") : date.plusDays(1).atStartOfDay(SRI_LANKA).toInstant();
        var result = tasks.browseDiscover(search == null ? "" : search.trim(), minAmount == null ? java.math.BigDecimal.ZERO : minAmount,
                maxAmount == null ? new java.math.BigDecimal("9999999999.99") : maxAmount,
                start, end, latitude != null, latitude == null ? 0 : latitude, longitude == null ? 0 : longitude,
                PageRequest.of(page, size));
        return PageResponse.from(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TaskResponse getPublic(UUID taskId) {
        Task task = tasks.findById(taskId).filter(value -> value.getStatus() == TaskStatus.PUBLISHED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This published task could not be found."));
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskResponse getStudent(String subject, UUID taskId) {
        identities.requireStudent(subject);
        Task task = tasks.findById(taskId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found."));
        boolean published = task.getStatus() == TaskStatus.PUBLISHED;
        boolean applied = applications.findByTaskIdAndStudentClerkUserId(taskId, subject).isPresent();
        if (!published && !applied) throw new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found.");
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskSummaryResponse summary(String subject) {
        identities.requireTaskPoster(subject);
        long started = tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.STARTED) + tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.ONGOING);
        return new TaskSummaryResponse(tasks.countByPosterClerkUserId(subject), tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.PUBLISHED),
                tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.ACCEPTED), started, tasks.countByPosterClerkUserIdAndStatus(subject, TaskStatus.COMPLETED),
                applications.countByTaskPosterClerkUserIdAndStatus(subject, TaskApplicationStatus.PENDING));
    }

    private Task findOwned(String subject, UUID taskId) {
        return tasks.findByIdAndPosterClerkUserId(taskId, subject)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found."));
    }

    private Task findOwnedForUpdate(String subject, UUID taskId) {
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found."));
        if (!task.getPoster().getClerkUserId().equals(subject)) throw new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "This task could not be found.");
        return task;
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
