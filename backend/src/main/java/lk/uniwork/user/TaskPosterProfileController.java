package lk.uniwork.user;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/poster/profile")
public class TaskPosterProfileController {
    private final TaskPosterProfileService service;

    public TaskPosterProfileController(TaskPosterProfileService service) { this.service = service; }

    @GetMapping
    public ProfileResponse get(@AuthenticationPrincipal Jwt jwt) { return service.get(jwt.getSubject()); }

    @GetMapping("/status")
    public ProfileStatusResponse status(@AuthenticationPrincipal Jwt jwt) { return service.status(jwt.getSubject()); }

    @PutMapping
    public ResponseEntity<ProfileResponse> completeOrUpdate(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(service.completeOrUpdate(jwt.getSubject(), request));
    }
}
