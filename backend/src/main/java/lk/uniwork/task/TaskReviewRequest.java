package lk.uniwork.task;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record TaskReviewRequest(@Min(1) @Max(5) short posterRating, @NotNull Boolean positiveFeedback,
                               @Size(max=2000) String reviewText, @Size(max=2000) String locationFeedback) { }
