package lk.uniwork.task;
import jakarta.persistence.*;
import lk.uniwork.user.UniWorkUser;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal; import java.time.Instant; import java.util.UUID; import lk.uniwork.user.StudentCategory;
@Entity @Table(name="direct_tasks")
public class DirectTask {
 @Id @Column(name="direct_task_id") private UUID id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="poster_user_id",nullable=false) private UniWorkUser poster;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_user_id",nullable=false) private UniWorkUser student;
 @Column(nullable=false,length=2000) private String description; @Column(name="scheduled_at",nullable=false) private Instant scheduledAt;
 @Column(name="amount_lkr",nullable=false,precision=12,scale=2) private BigDecimal amountLkr; @Column(name="location_address",nullable=false,length=500) private String locationAddress;
 @Column(nullable=false,precision=9,scale=6) private BigDecimal latitude; @Column(nullable=false,precision=9,scale=6) private BigDecimal longitude;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=24) private DirectTaskStatus status=DirectTaskStatus.SENT;
 @Enumerated(EnumType.STRING) @Column(length=40) private StudentCategory category;
 @Column(name="counter_amount_lkr",precision=12,scale=2) private BigDecimal counterAmountLkr; @CreationTimestamp @Column(name="created_at") private Instant createdAt; @UpdateTimestamp @Column(name="updated_at") private Instant updatedAt;
 @OneToOne(fetch=FetchType.LAZY) @JoinColumn(name="task_id") private Task linkedTask;
 protected DirectTask() {}
 public DirectTask(UniWorkUser poster, UniWorkUser student, String description, Instant scheduledAt, BigDecimal amountLkr, String locationAddress, BigDecimal latitude, BigDecimal longitude) { this.id=UUID.randomUUID();this.poster=poster;this.student=student;this.description=description;this.scheduledAt=scheduledAt;this.amountLkr=amountLkr;this.locationAddress=locationAddress;this.latitude=latitude;this.longitude=longitude; }
 public void counter(BigDecimal amount){status=DirectTaskStatus.COUNTEROFFERED;counterAmountLkr=amount;} public void accept(){status=DirectTaskStatus.ACCEPTED;if(counterAmountLkr!=null)amountLkr=counterAmountLkr;} public void decline(){status=DirectTaskStatus.DECLINED;} public void rejectCounter(){status=DirectTaskStatus.COUNTER_REJECTED;} public void setCategory(StudentCategory value){category=value;} public StudentCategory getCategory(){return category;}
 public void linkTask(Task task){this.linkedTask=task;} public UUID getId(){return id;} public UniWorkUser getPoster(){return poster;} public UniWorkUser getStudent(){return student;} public String getDescription(){return description;} public Instant getScheduledAt(){return scheduledAt;} public BigDecimal getAmountLkr(){return amountLkr;} public String getLocationAddress(){return locationAddress;} public BigDecimal getLatitude(){return latitude;} public BigDecimal getLongitude(){return longitude;} public DirectTaskStatus getStatus(){return status;} public BigDecimal getCounterAmountLkr(){return counterAmountLkr;} public Instant getCreatedAt(){return createdAt;} public Task getLinkedTask(){return linkedTask;}
}
