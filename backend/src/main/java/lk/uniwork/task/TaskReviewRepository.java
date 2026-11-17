package lk.uniwork.task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface TaskReviewRepository extends JpaRepository<TaskReview, UUID> { boolean existsByTaskId(UUID taskId); }
