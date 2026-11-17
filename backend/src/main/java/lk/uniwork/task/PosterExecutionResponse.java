package lk.uniwork.task;
import java.time.Instant;
import java.util.UUID;
public record PosterExecutionResponse(UUID taskId, String taskTitle, String taskStatus, String studentName,
                                      String university, String faculty, String verificationStatus,
                                      String verificationPin, Instant pinExpiresAt, Instant startedAt,
                                      Boolean locationVerified, String locationResult, Instant locationCheckedAt,
                                      Instant completedAt, Boolean paymentReceived) { }
