package lk.uniwork.task;
import java.time.Instant;
import java.util.UUID;
public record TaskReviewResponse(UUID reviewId, UUID taskId, short posterRating, boolean positiveFeedback,
                                 String reviewText, String locationFeedback, Instant createdAt) {
    static TaskReviewResponse from(TaskReview value){return new TaskReviewResponse(value.getId(),value.getTask().getId(),value.getPosterRating(),value.isPositiveFeedback(),value.getReviewText(),value.getLocationFeedback(),value.getCreatedAt());}
}
