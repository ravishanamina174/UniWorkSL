package lk.uniwork.user;

import java.util.UUID;

public record PublicStudentProfile(UUID userId, String name, String primaryArea, String summary,
                                  StudentCategory primaryCategory, double rating, long reviewCount,
                                  boolean nicReviewed) { }
