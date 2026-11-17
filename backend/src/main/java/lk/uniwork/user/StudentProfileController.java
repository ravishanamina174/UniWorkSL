package lk.uniwork.user;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/profile")
public class StudentProfileController {
    private final StudentProfileService service;
    public StudentProfileController(StudentProfileService service) { this.service = service; }
    @GetMapping public StudentProfileResponse get(@AuthenticationPrincipal Jwt jwt) { return service.get(jwt.getSubject()); }
    @PutMapping public StudentProfileResponse save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody StudentProfileRequest request) { return service.save(jwt.getSubject(), request); }
}
