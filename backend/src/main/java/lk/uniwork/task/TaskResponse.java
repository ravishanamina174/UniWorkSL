package lk.uniwork.task;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record TaskResponse(UUID taskId, UUID posterId, String title, String description, BigDecimal amountLkr,
                           Set<String> requiredSkills, LocalDateTime taskDateTime, String locationAddress,
                           BigDecimal latitude, BigDecimal longitude, TaskStatus status, Instant createdAt, Instant updatedAt) { }
