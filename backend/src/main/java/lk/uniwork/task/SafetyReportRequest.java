package lk.uniwork.task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record SafetyReportRequest(@NotNull SafetyReportCategory category, @NotBlank @Size(max=4000) String description) { }
