package lk.uniwork.task;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface DirectTaskRepository extends JpaRepository<DirectTask,UUID> { List<DirectTask> findByStudentClerkUserIdOrderByCreatedAtDesc(String clerk); List<DirectTask> findByPosterClerkUserIdOrderByCreatedAtDesc(String clerk); Optional<DirectTask> findByIdAndStudentClerkUserId(UUID id,String clerk); Optional<DirectTask> findByIdAndPosterClerkUserId(UUID id,String clerk); }
