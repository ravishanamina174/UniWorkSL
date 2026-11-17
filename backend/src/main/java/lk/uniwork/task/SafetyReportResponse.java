package lk.uniwork.task;
import java.time.Instant;
import java.util.UUID;
public record SafetyReportResponse(UUID reportId, UUID taskId, SafetyReportCategory category, String description, String status, Instant createdAt) {
    static SafetyReportResponse from(SafetyReport value){return new SafetyReportResponse(value.getId(),value.getTask().getId(),value.getCategory(),value.getDescription(),value.getStatus(),value.getCreatedAt());}
}
