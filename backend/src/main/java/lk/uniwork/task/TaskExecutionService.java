package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.PiiEncryptionService;
import lk.uniwork.user.StudentProfile;
import lk.uniwork.user.StudentProfileRepository;
import lk.uniwork.user.UserIdentityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class TaskExecutionService {
    private static final Duration PIN_LIFETIME = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();
    private final TaskRepository tasks;
    private final TaskExecutionRepository executions;
    private final StudentProfileRepository profiles;
    private final UserIdentityService identities;
    private final PiiEncryptionService crypto;
    private final LocationService locations;
    public TaskExecutionService(TaskRepository tasks, TaskExecutionRepository executions, StudentProfileRepository profiles,
                                UserIdentityService identities, PiiEncryptionService crypto, LocationService locations) {
        this.tasks = tasks; this.executions = executions; this.profiles = profiles; this.identities = identities; this.crypto = crypto; this.locations = locations;
    }

    @Transactional
    public StartTaskResponse requestStart(String subject, UUID taskId) {
        identities.requireStudent(subject);
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        if (task.getStatus() != TaskStatus.ACCEPTED) throw conflict("Only the selected student can start an accepted task.");
        TaskExecution execution = executions.findByTaskIdAndStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This accepted task is unavailable."));
        Instant now = Instant.now();
        if (execution.hasActivePin(now)) throw conflict("A start code is already active. Ask the poster to check the dashboard.");
        if (execution.getPinAttempts() >= 5 && execution.getPinExpiresAt() != null && execution.getPinExpiresAt().isAfter(now))
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "PIN_REGENERATION_COOLDOWN", "Too many attempts. Request a new code after the current five-minute verification window ends.");
        byte[] saltBytes = new byte[16]; RANDOM.nextBytes(saltBytes);
        String salt = java.util.HexFormat.of().formatHex(saltBytes);
        String value = crypto.deriveFourDigitCode(context(taskId, execution.getStudent().getId()), salt);
        execution.createPin(hash(taskId, execution.getStudent().getId(), salt, value), salt, now, now.plus(PIN_LIFETIME));
        return StartTaskResponse.from(execution);
    }

    @Transactional
    public PinVerificationResponse verifyPin(String subject, UUID taskId, String pin) {
        identities.requireStudent(subject);
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        TaskExecution execution = executions.findByTaskIdAndStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This accepted task is unavailable."));
        Instant now = Instant.now();
        if (task.getStatus() == TaskStatus.STARTED) throw conflict("This task has already started.");
        if (!execution.hasActivePin(now)) throw conflict("The verification code is missing or expired. Request a new code.");
        if (!execution.verifyHash(hash(taskId, execution.getStudent().getId(), execution.getPinSalt(), pin))) {
            execution.addPinAttempt(now);
            return new PinVerificationResponse(taskId, false, execution.getPinAttempts() >= 5,
                    Math.max(0, 5 - execution.getPinAttempts()), task.getStatus().name(), null);
        }
        execution.verifyPin(now);
        task.start();
        return new PinVerificationResponse(taskId, true, false, Math.max(0, 5 - execution.getPinAttempts()), task.getStatus().name(), now);
    }

    @Transactional
    public StartTaskResponse checkLocation(String subject, UUID taskId, LocationCheckRequest request) {
        identities.requireStudent(subject);
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        if (task.getStatus() != TaskStatus.STARTED) throw conflict("Location can be recorded after task-start verification.");
        TaskExecution execution = executions.findByTaskIdAndStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This task execution could not be found."));
        if (execution.getLocationCheckedAt() != null) throw conflict("Location verification has already been recorded.");
        boolean available = request.permissionGranted() && request.locationAvailable();
        boolean verified = false; Double distance = null; String result;
        if (!request.permissionGranted()) result = "PERMISSION_DENIED";
        else if (!request.locationAvailable()) result = "LOCATION_UNAVAILABLE";
        else {
            if (request.latitude() == null || request.longitude() == null)
                throw new ApiException(HttpStatus.BAD_REQUEST, "LOCATION_COORDINATES_REQUIRED", "Coordinates are required when location is available.");
            distance = locations.distanceMeters(task.getLatitude().doubleValue(), task.getLongitude().doubleValue(), request.latitude(), request.longitude());
            verified = distance <= 100;
            result = verified ? "WITHIN_RADIUS" : "OUTSIDE_RADIUS";
        }
        execution.recordLocation(verified, distance, available ? request.accuracyMeters() : null, result, Instant.now());
        return StartTaskResponse.from(execution);
    }

    @Transactional
    public StartTaskResponse complete(String subject, UUID taskId, boolean paymentReceived) {
        identities.requireStudent(subject);
        Task task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> notFound("TASK_NOT_FOUND", "This task could not be found."));
        if (task.getStatus() != TaskStatus.STARTED) throw conflict("Only a started task can be completed.");
        TaskExecution execution = executions.findByTaskIdAndStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This task execution could not be found."));
        Instant now = Instant.now(); execution.complete(paymentReceived, now); task.complete();
        return StartTaskResponse.from(execution);
    }

    @Transactional(readOnly = true)
    public PosterExecutionResponse posterView(String subject, UUID taskId) {
        identities.requireTaskPoster(subject);
        TaskExecution execution = executions.findByTaskIdAndTaskPosterClerkUserId(taskId, subject)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This task has no selected student."));
        StudentProfile profile = profiles.findById(execution.getStudent().getId()).orElseThrow(() -> notFound("STUDENT_PROFILE_NOT_FOUND", "Student profile unavailable."));
        Instant now = Instant.now(); String pin = execution.hasActivePin(now)
                ? crypto.deriveFourDigitCode(context(taskId, execution.getStudent().getId()), execution.getPinSalt()) : null;
        String verification = execution.getStartedAt() != null ? "VERIFIED" : pin != null ? "PIN_PENDING" : execution.getStartRequestedAt() == null ? "NOT_REQUESTED" : "EXPIRED";
        return new PosterExecutionResponse(taskId, execution.getTask().getTitle(), execution.getTask().getStatus().name(),
                profile.getFullName(), profile.getUniversity(), profile.getFaculty(), verification, pin,
                pin == null ? null : execution.getPinExpiresAt(), execution.getStartedAt(), execution.getLocationVerified(),
                execution.getLocationResult(), execution.getLocationCheckedAt(), execution.getCompletedAt(), execution.getPaymentReceived());
    }

    @Transactional(readOnly = true)
    public StartTaskResponse studentView(String subject, UUID taskId) {
        identities.requireStudent(subject);
        return executions.findByTaskIdAndStudentClerkUserId(taskId, subject).map(StartTaskResponse::from)
                .orElseThrow(() -> notFound("EXECUTION_NOT_FOUND", "This task is not assigned to you."));
    }

    @Transactional(readOnly = true)
    public PageResponse<StartTaskResponse> history(String subject, int page, int size, boolean completedOnly) {
        identities.requireStudent(subject);
        var paging = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = completedOnly ? executions.findByStudentClerkUserIdAndCompletedAtIsNotNull(subject, paging)
                : executions.findByStudentClerkUserIdAndCompletedAtIsNull(subject, paging);
        return PageResponse.from(result.map(StartTaskResponse::from));
    }

    private String context(UUID taskId, UUID studentId) { return taskId + ":" + studentId; }
    private String hash(UUID taskId, UUID studentId, String salt, String pin) { return crypto.keyedHash(context(taskId, studentId) + ":" + salt + ":" + pin); }
    private ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "INVALID_EXECUTION_TRANSITION", message); }
    private ApiException notFound(String code, String message) { return new ApiException(HttpStatus.NOT_FOUND, code, message); }
}
