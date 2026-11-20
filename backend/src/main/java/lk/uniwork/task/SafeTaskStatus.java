package lk.uniwork.task;

import java.time.Instant;

public record SafeTaskStatus(String status, Instant expiresAt, Instant lastUpdatedAt) { }
