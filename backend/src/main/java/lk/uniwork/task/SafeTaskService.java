package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.UserIdentityService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class SafeTaskService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final SafeTaskRepository sessions;
    private final TaskExecutionRepository executions;
    private final UserIdentityService identities;
    public SafeTaskService(SafeTaskRepository sessions, TaskExecutionRepository executions, UserIdentityService identities) {
        this.sessions = sessions; this.executions = executions; this.identities = identities;
    }
    @Scheduled(fixedDelay = 86_400_000)
    @Transactional
    public void purgeOldSessions() {
        Instant now = Instant.now();
        sessions.deleteRetainedExpired(now.minus(Duration.ofDays(1)), now.minus(Duration.ofHours(25)));
    }
    @Transactional
    public String create(String subject, UUID taskId) {
        identities.requireStudent(subject);
        TaskExecution execution = owned(subject, taskId);
        if (execution.getTask().getStatus() != TaskStatus.ACCEPTED || execution.getPinVerifiedAt() != null)
            throw bad("SafeTask setup is available before verifying the start code.");
        if (sessions.findByExecutionTaskIdAndExecutionStudentClerkUserId(taskId, subject).isPresent())
            throw new ApiException(HttpStatus.CONFLICT, "SAFETASK_ALREADY_CREATED", "A sharing link already exists for this task. Return to the start screen to use it.");
        byte[] bytes = new byte[32]; RANDOM.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        sessions.save(new SafeTaskSession(execution, hash(token), Instant.now()));
        return token;
    }
    @Transactional(readOnly = true)
    public SafeTaskStatus status(String subject, UUID taskId) {
        identities.requireStudent(subject);
        owned(subject, taskId);
        return sessions.findByExecutionTaskIdAndExecutionStudentClerkUserId(taskId, subject)
                .map(session -> new SafeTaskStatus(state(session, Instant.now()), expiry(session), session.getLocationUpdatedAt()))
                .orElse(new SafeTaskStatus("OFF", null, null));
    }
    @Transactional
    public SafeTaskStatus location(String subject, UUID taskId, SafeTaskLocationRequest request) {
        identities.requireStudent(subject); owned(subject, taskId);
        SafeTaskSession session = session(subject, taskId);
        Instant now = Instant.now();
        if (!"ACTIVE".equals(state(session, now)) && !"SAFETY_WINDOW".equals(state(session, now)))
            throw bad("Location sharing is not active.");
        if (!Double.isFinite(request.latitude()) || !Double.isFinite(request.longitude()) ||
            (request.accuracyMeters() != null && !Double.isFinite(request.accuracyMeters()))) throw bad("Invalid coordinates.");
        if (session.getLatitude() != null && Math.abs(session.getLatitude() - request.latitude()) < 0.000001 &&
            Math.abs(session.getLongitude() - request.longitude()) < 0.000001 && session.getLocationUpdatedAt() != null &&
            Duration.between(session.getLocationUpdatedAt(), now).toMinutes() < 3) return status(subject, taskId);
        session.updateLocation(request.latitude(), request.longitude(), request.accuracyMeters(), now);
        return new SafeTaskStatus(state(session, now), expiry(session), now);
    }
    @Transactional
    public SafeTaskStatus revoke(String subject, UUID taskId) {
        identities.requireStudent(subject); owned(subject, taskId);
        SafeTaskSession session = session(subject, taskId);
        if (session.getRevokedAt() == null) session.revoke(Instant.now());
        return new SafeTaskStatus("STOPPED", expiry(session), null);
    }
    @Transactional(readOnly = true)
    public SafeTaskGuardianView guardian(String token) {
        if (token == null || !token.matches("[0-9a-f]{64}")) throw unavailable();
        SafeTaskSession session = sessions.findByTokenHash(hash(token)).orElseThrow(this::unavailable);
        String state = state(session, Instant.now());
        if (state.equals("STOPPED") || state.equals("EXPIRED")) throw unavailable();
        TaskExecution execution = session.getExecution(); Task task = execution.getTask();
        return new SafeTaskGuardianView(state, task.getTitle(), generalArea(task.getLocationAddress()), task.getStatus().name(),
                execution.getStartedAt(), expiry(session), session.getLatitude(), session.getLongitude(),
                session.getAccuracyMeters(), session.getLocationUpdatedAt());
    }
    private TaskExecution owned(String subject, UUID taskId) {
        return executions.findByTaskIdAndStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EXECUTION_NOT_FOUND", "Task execution unavailable."));
    }
    private SafeTaskSession session(String subject, UUID taskId) {
        return sessions.findByExecutionTaskIdAndExecutionStudentClerkUserId(taskId, subject)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SAFETASK_NOT_FOUND", "Safety sharing is not enabled."));
    }
    private String state(SafeTaskSession session, Instant now) {
        if (session.getRevokedAt() != null) return "STOPPED";
        TaskExecution execution = session.getExecution();
        if (execution.getCompletedAt() != null) return now.isBefore(execution.getCompletedAt().plus(Duration.ofHours(1))) ? "SAFETY_WINDOW" : "EXPIRED";
        if (execution.getTask().getStatus() != TaskStatus.STARTED) return execution.getTask().getStatus() == TaskStatus.ACCEPTED ? "PENDING" : "EXPIRED";
        return "ACTIVE";
    }
    private Instant expiry(SafeTaskSession session) {
        Instant completed = session.getExecution().getCompletedAt(); return completed == null ? null : completed.plus(Duration.ofHours(1));
    }
    private String generalArea(String address) {
        if (address == null) return "General area unavailable";
        String[] parts = address.split(",");
        if (parts.length < 2) return "General area unavailable";
        return parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
    }
    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.US_ASCII))); }
        catch (java.security.NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private ApiException bad(String message) { return new ApiException(HttpStatus.CONFLICT, "SAFETASK_UNAVAILABLE", message); }
    private ApiException unavailable() { return new ApiException(HttpStatus.NOT_FOUND, "SAFETASK_LINK_UNAVAILABLE", "Location Sharing Has Ended"); }
}
