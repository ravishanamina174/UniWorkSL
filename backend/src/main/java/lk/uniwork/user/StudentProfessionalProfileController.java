package lk.uniwork.user;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/student/professional-profile")
public class StudentProfessionalProfileController {
    private final StudentProfessionalProfileService service;
    public StudentProfessionalProfileController(StudentProfessionalProfileService service) { this.service = service; }
    @GetMapping public StudentProfessionalProfileResponse get(@AuthenticationPrincipal Jwt jwt) { return service.get(jwt.getSubject()); }
    @PutMapping public StudentProfessionalProfileResponse save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody StudentProfessionalProfileRequest request) { return service.save(jwt.getSubject(), request); }
}
