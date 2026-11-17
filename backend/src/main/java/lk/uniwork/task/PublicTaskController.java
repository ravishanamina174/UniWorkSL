package lk.uniwork.task;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lk.uniwork.common.PageResponse;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.math.BigDecimal;

@Validated
@RestController
@RequestMapping("/api/v1/public/tasks")
public class PublicTaskController {
    private final TaskService service;

    public PublicTaskController(TaskService service) { this.service = service; }

    @Operation(summary = "Browse published tasks for the future student marketplace")
    @GetMapping
    public PageResponse<TaskResponse> list(@RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size, @RequestParam(required = false) String search,
            @RequestParam(required = false) @jakarta.validation.constraints.DecimalMin("0.00") BigDecimal minAmount,
            @RequestParam(required = false) @jakarta.validation.constraints.DecimalMin("0.00") BigDecimal maxAmount) {
        return service.listPublic(page, size, search, minAmount, maxAmount);
    }

    @GetMapping("/{taskId}")
    public TaskResponse get(@PathVariable UUID taskId) { return service.getPublic(taskId); }
}
