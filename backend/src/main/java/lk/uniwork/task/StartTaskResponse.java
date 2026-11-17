package lk.uniwork.task;
import java.time.Instant;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
public record StartTaskResponse(UUID taskId, String title, String description, BigDecimal amountLkr, LocalDateTime taskDateTime,
                                String locationAddress, java.math.BigDecimal latitude, java.math.BigDecimal longitude,
                                Set<String> requiredSkills, String status, Instant startRequestedAt, Instant pinExpiresAt,
                                Instant pinVerifiedAt, Instant startedAt, int attemptsRemaining,
                                Boolean locationVerified, String locationResult, Instant locationCheckedAt,
                                Instant completedAt, Boolean paymentReceived) {
    static StartTaskResponse from(TaskExecution e) {
        Task task = e.getTask();
        return new StartTaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getAmountLkr(),
                task.getScheduledAt().atZone(java.time.ZoneId.of("Asia/Colombo")).toLocalDateTime(), task.getLocationAddress(),
                task.getLatitude(), task.getLongitude(), task.getRequiredSkills(), task.getStatus().name(), e.getStartRequestedAt(), e.getPinExpiresAt(),
                e.getPinVerifiedAt(), e.getStartedAt(), Math.max(0, 5 - e.getPinAttempts()), e.getLocationVerified(),
                e.getLocationResult(), e.getLocationCheckedAt(), e.getCompletedAt(), e.getPaymentReceived());
    }
}
