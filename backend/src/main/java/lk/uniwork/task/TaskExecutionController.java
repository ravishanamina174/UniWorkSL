package lk.uniwork.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lk.uniwork.common.PageResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Validated
@RestController
public class TaskExecutionController {
    private final TaskExecutionService service;
    public TaskExecutionController(TaskExecutionService service) { this.service = service; }
    @GetMapping("/api/v1/poster/tasks/{taskId}/execution")
    public PosterExecutionResponse poster(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.posterView(jwt.getSubject(), taskId); }
    @GetMapping("/api/v1/student/tasks/{taskId}/execution")
    public StartTaskResponse student(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.studentView(jwt.getSubject(), taskId); }
    @PostMapping("/api/v1/student/tasks/{taskId}/execution/start")
    public StartTaskResponse start(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { return service.requestStart(jwt.getSubject(), taskId); }
    @PostMapping("/api/v1/student/tasks/{taskId}/execution/verify-pin")
    public PinVerificationResponse verify(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody VerifyPinRequest request) {
        return service.verifyPin(jwt.getSubject(), taskId, request.pin());
    }
    @PostMapping("/api/v1/student/tasks/{taskId}/execution/location")
    public StartTaskResponse location(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody LocationCheckRequest request) {
        return service.checkLocation(jwt.getSubject(), taskId, request);
    }
    @PostMapping("/api/v1/student/tasks/{taskId}/execution/complete")
    public StartTaskResponse complete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @Valid @RequestBody CompleteTaskRequest request) {
        return service.complete(jwt.getSubject(), taskId, request.paymentReceived());
    }
    @GetMapping("/api/v1/student/tasks/accepted")
    public PageResponse<StartTaskResponse> accepted(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") @Min(0) int page,
             @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) { return service.history(jwt.getSubject(), page, size, false); }
    @GetMapping("/api/v1/student/history")
    public PageResponse<StartTaskResponse> history(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") @Min(0) int page,
             @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) { return service.history(jwt.getSubject(), page, size, true); }
}
