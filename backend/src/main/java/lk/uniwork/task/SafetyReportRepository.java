package lk.uniwork.task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface SafetyReportRepository extends JpaRepository<SafetyReport, UUID> { Page<SafetyReport> findByReporterClerkUserId(String clerkUserId, Pageable pageable); }
