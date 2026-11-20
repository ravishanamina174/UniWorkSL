package lk.uniwork.task;

import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
public class SafeTaskController {
    private final SafeTaskService service;
    public SafeTaskController(SafeTaskService service) { this.service = service; }
    @PostMapping("/api/v1/student/tasks/{taskId}/safetask")
    public Map<String, String> create(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return Map.of("token", service.create(jwt.getSubject(), taskId)); }
    @GetMapping("/api/v1/student/tasks/{taskId}/safetask")
    public SafeTaskStatus status(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.status(jwt.getSubject(), taskId); }
    @PostMapping("/api/v1/student/tasks/{taskId}/safetask/location")
    public SafeTaskStatus location(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody SafeTaskLocationRequest request) { return service.location(jwt.getSubject(), taskId, request); }
    @DeleteMapping("/api/v1/student/tasks/{taskId}/safetask")
    public SafeTaskStatus revoke(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.revoke(jwt.getSubject(), taskId); }
    @GetMapping("/api/v1/public/safetask/{token}")
    public ResponseEntity<SafeTaskGuardianView> guardian(@PathVariable String token) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy", "no-referrer")
                .header("X-Robots-Tag", "noindex, nofollow").body(service.guardian(token));
    }
}
