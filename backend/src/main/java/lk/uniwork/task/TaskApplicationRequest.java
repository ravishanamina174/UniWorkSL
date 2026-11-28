package lk.uniwork.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskApplicationRequest(@NotBlank @Size(max = 1400) String introduction) { }
