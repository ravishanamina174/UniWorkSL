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
@RequestMapping("/api/v1/student")
public class TaskFeedbackController {
    private final TaskFeedbackService service;
    public TaskFeedbackController(TaskFeedbackService service){this.service=service;}
    @PostMapping("/tasks/{taskId}/review")
    public TaskReviewResponse review(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID taskId,@Valid @RequestBody TaskReviewRequest request){return service.review(jwt.getSubject(),taskId,request);}
    @PostMapping("/tasks/{taskId}/reports")
    public SafetyReportResponse report(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID taskId,@Valid @RequestBody SafetyReportRequest request){return service.report(jwt.getSubject(),taskId,request);}
    @GetMapping("/reports")
    public PageResponse<SafetyReportResponse> reports(@AuthenticationPrincipal Jwt jwt,@RequestParam(defaultValue="0") @Min(0) int page,
              @RequestParam(defaultValue="10") @Min(1) @Max(50) int size){return service.reports(jwt.getSubject(),page,size);}
}
