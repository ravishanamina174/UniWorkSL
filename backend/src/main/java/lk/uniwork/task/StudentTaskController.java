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
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDate;

@Validated
@RestController
@RequestMapping("/api/v1/student/tasks")
public class StudentTaskController {
    private final TaskService tasks;
    private final lk.uniwork.user.UserIdentityService identities;
    public StudentTaskController(TaskService tasks, lk.uniwork.user.UserIdentityService identities) { this.tasks = tasks; this.identities = identities; }
    @GetMapping public PageResponse<TaskResponse> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") @Min(0) int page, @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            @RequestParam(required = false) String search, @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        identities.requireStudent(jwt.getSubject());
        return tasks.discover(page, size, search, minAmount, maxAmount, date, latitude, longitude);
    }
    @GetMapping("/{taskId}") public TaskResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) {
        identities.requireStudent(jwt.getSubject());
        return tasks.getStudent(jwt.getSubject(), taskId);
    }
}
