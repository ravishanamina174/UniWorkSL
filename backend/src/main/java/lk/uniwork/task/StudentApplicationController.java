package lk.uniwork.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lk.uniwork.common.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/student")
public class StudentApplicationController {
    private final TaskApplicationService service;
    private final lk.uniwork.user.UserIdentityService identities;
    public StudentApplicationController(TaskApplicationService service, lk.uniwork.user.UserIdentityService identities) { this.service = service; this.identities = identities; }
    @PostMapping("/tasks/{taskId}/applications") @ResponseStatus(HttpStatus.CREATED)
    public TaskApplicationResponse apply(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody TaskApplicationRequest request) { return service.apply(jwt.getSubject(), taskId, request.introduction()); }
    @GetMapping("/applications")
    public PageResponse<TaskApplicationResponse> mine(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size, @RequestParam(required = false) TaskApplicationStatus status) {
        return service.mine(jwt.getSubject(), page, size, status);
    }
    @PostMapping("/applications/{applicationId}/withdraw")
    public TaskApplicationResponse withdraw(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID applicationId) { return service.withdraw(jwt.getSubject(), applicationId); }
}
