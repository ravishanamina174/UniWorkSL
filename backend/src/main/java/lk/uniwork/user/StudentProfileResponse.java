package lk.uniwork.user;

import java.time.Instant;
import java.util.UUID;

public record StudentProfileResponse(UUID userId, String fullName, short age, Gender gender, String address,
                                     String phoneNumber, String nic, String university, String faculty,
                                     Instant createdAt, Instant updatedAt) { }
