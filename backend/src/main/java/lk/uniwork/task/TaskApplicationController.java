package lk.uniwork.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lk.uniwork.common.PageResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/poster/applications")
public class TaskApplicationController {
    private final TaskService service;
    private final TaskApplicationService applicationService;

    public TaskApplicationController(TaskService service, TaskApplicationService applicationService) { this.service = service; this.applicationService = applicationService; }

    @GetMapping
    public PageResponse<TaskApplicationResponse> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        return applicationService.listPoster(jwt.getSubject(), null, page, size);
    }

    @GetMapping("/tasks/{taskId}")
    public PageResponse<TaskApplicationResponse> listForTask(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId,
            @RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        return applicationService.listPoster(jwt.getSubject(), taskId, page, size);
    }

    @PostMapping("/{applicationId}/accept")
    public TaskApplicationResponse accept(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID applicationId) {
        return applicationService.accept(jwt.getSubject(), applicationId);
    }

    @PostMapping("/{applicationId}/reject")
    public TaskApplicationResponse reject(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID applicationId) {
        return applicationService.reject(jwt.getSubject(), applicationId);
    }

    @GetMapping("/tasks/{taskId}/selected")
    public TaskApplicationResponse selected(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) {
        return applicationService.selected(jwt.getSubject(), taskId);
    }
}
