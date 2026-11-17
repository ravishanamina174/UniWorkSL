package lk.uniwork.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface StudentProfessionalProfileRepository extends JpaRepository<StudentProfessionalProfile, UUID> {
    Optional<StudentProfessionalProfile> findByUserId(UUID userId);
    List<StudentProfessionalProfile> findTop200ByDiscoverableTrue();
}
