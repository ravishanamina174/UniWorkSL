package lk.uniwork.task;
import jakarta.persistence.*;
import lk.uniwork.user.UniWorkUser;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="task_reviews")
public class TaskReview {
    @Id @Column(name="review_id", nullable=false) private UUID id;
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="task_id", nullable=false, unique=true) private Task task;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="student_user_id", nullable=false) private UniWorkUser student;
    @Column(name="poster_rating", nullable=false) private short posterRating;
    @Column(name="positive_feedback", nullable=false) private boolean positiveFeedback;
    @Column(name="review_text", length=2000) private String reviewText;
    @Column(name="location_feedback", length=2000) private String locationFeedback;
    @CreationTimestamp @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    protected TaskReview() { }
    public TaskReview(Task task, UniWorkUser student, short rating, boolean positive, String review, String location) {
        this.id=UUID.randomUUID(); this.task=task; this.student=student; this.posterRating=rating; this.positiveFeedback=positive; this.reviewText=review; this.locationFeedback=location;
    }
    public UUID getId(){return id;} public Task getTask(){return task;} public UniWorkUser getStudent(){return student;} public short getPosterRating(){return posterRating;}
    public boolean isPositiveFeedback(){return positiveFeedback;} public String getReviewText(){return reviewText;} public String getLocationFeedback(){return locationFeedback;} public Instant getCreatedAt(){return createdAt;}
}
