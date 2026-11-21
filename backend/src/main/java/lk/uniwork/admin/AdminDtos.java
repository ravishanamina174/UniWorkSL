package lk.uniwork.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.uniwork.common.PageResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class AdminDtos {
    private AdminDtos() { }

    public record Overview(long ongoingTasks, long activeSafeTaskSessions, long flaggedPosters,
            long openPaymentDisputes, long unresolvedSafetyReports, long casesRequiringReview,
            long startedTasks, long otherOngoingTasks, long resolvedDisputes) { }
    public record ActiveTask(UUID taskId, String title, String status, String locationAddress,
            BigDecimal latitude, BigDecimal longitude, Instant startedAt, String posterName,
            UUID posterUserId, String studentName, UUID studentUserId, String safeTaskStatus) { }
    public record WatchlistCase(UUID posterUserId, String posterName, String status, Instant flaggedAt,
            Instant lastSignalAt, String decisionReason, double averageRating, long totalReviews,
            long oneStarReviews, long twoStarReviews, long seriousReports, long completedTasks,
            long paymentDisputes) { }
    public record Dispute(UUID disputeId, UUID taskId, String taskTitle, String studentName,
            String posterName, BigDecimal agreedAmountLkr, BigDecimal actualAmountLkr,
            String reason, String studentStatement, String posterResponse, Boolean posterSaysPaid,
            String status, String outcome, Instant createdAt, Instant respondedAt, Instant updatedAt) { }
    public record SafetyCase(UUID reportId, UUID taskId, String taskTitle, String category,
            String description, String status, Instant createdAt, String reporterName, String posterName) { }
    public record Note(UUID noteId, String caseType, UUID caseId, String adminClerkId, String note, Instant createdAt) { }
    public record AuditEvent(UUID auditId, String adminClerkId, String action, String targetType,
            UUID targetId, String beforeState, String afterState, String reason, Instant createdAt) { }
    public record CaseDetail<T>(T item, List<Note> notes) { }
    public record WatchSignal(UUID sourceId, UUID taskId, String taskTitle, String sourceType,
            Integer rating, String detail, Instant createdAt) { }
    public record WatchDetail(WatchlistCase item, List<Note> notes, List<WatchSignal> signals) { }
    public record ComplaintRequest(@NotNull PaymentReason reason, BigDecimal actualAmountLkr,
            @NotBlank @Size(max = 2000) String statement) { }
    public enum PaymentReason { PAYMENT_NOT_RECEIVED, INCORRECT_PAYMENT_AMOUNT }
    public record PosterResponseRequest(@NotNull Boolean paymentMade, @NotBlank @Size(max = 2000) String details) { }
    public record NoteRequest(@NotBlank @Size(max = 2000) String note) { }
    public record DecisionRequest(@NotBlank String status, @NotBlank @Size(max = 2000) String reason) { }
    public record RestrictionRequest(@NotBlank @Size(max = 2000) String reason, @NotNull Instant expiresAt) { }
    public record WarningRequest(@NotBlank @Size(max = 2000) String reason) { }
    public record ActionResult(String status) { }
}
