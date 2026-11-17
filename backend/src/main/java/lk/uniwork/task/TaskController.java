package lk.uniwork.task;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/poster/tasks")
public class TaskController {
    private final TaskService service;
    private final TaskApplicationService applicationService;

    public TaskController(TaskService service, TaskApplicationService applicationService) { this.service = service; this.applicationService = applicationService; }

    @Operation(summary = "List tasks owned by the authenticated Task Poster")
    @GetMapping
    public PageResponse<TaskResponse> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status) {
        return service.listMine(jwt.getSubject(), page, size, search, status);
    }

    @GetMapping("/summary")
    public TaskSummaryResponse summary(@AuthenticationPrincipal Jwt jwt) { return service.summary(jwt.getSubject()); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody TaskRequest request) { return service.create(jwt.getSubject(), request); }

    @GetMapping("/{taskId}")
    public TaskResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.getMine(jwt.getSubject(), taskId); }

    @PutMapping("/{taskId}")
    public TaskResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody TaskRequest request) {
        return service.update(jwt.getSubject(), taskId, request);
    }

    @PostMapping("/{taskId}/publish")
    public TaskResponse publish(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.publish(jwt.getSubject(), taskId); }

    @PostMapping("/{taskId}/cancel")
    public TaskResponse cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.cancel(jwt.getSubject(), taskId); }

    @GetMapping("/{taskId}/applications")
    public PageResponse<TaskApplicationResponse> applications(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId,
            @RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        return applicationService.listPoster(jwt.getSubject(), taskId, page, size);
    }
}
