package lk.uniwork.task;

import java.time.Instant;

public record SafeTaskGuardianView(String status, String taskTitle, String generalTaskLocation,
                                   String taskStatus, Instant startedAt, Instant expiresAt,
                                   Double latitude, Double longitude, Double accuracyMeters, Instant lastUpdatedAt) { }
