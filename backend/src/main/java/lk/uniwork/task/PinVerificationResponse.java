package lk.uniwork.task;
import java.time.Instant;
import java.util.UUID;
public record PinVerificationResponse(UUID taskId, boolean verified, boolean locked, int attemptsRemaining,
                                     String taskStatus, Instant startedAt) { }
