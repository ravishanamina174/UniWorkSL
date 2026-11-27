package lk.uniwork.user;

import java.time.Instant;
import java.util.UUID;

public record ProfileResponse(UUID userId, UserRole role, String fullName, String address, String phoneNumber,
                              String nic, Gender gender, Instant createdAt, Instant updatedAt, String verificationStatus) { }
