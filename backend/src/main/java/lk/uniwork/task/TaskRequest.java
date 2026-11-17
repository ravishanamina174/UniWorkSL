package lk.uniwork.task;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public record TaskRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 5000) String description,
        @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal amountLkr,
        @NotNull LocalDateTime taskDateTime,
        @NotBlank @Size(max = 500) String locationAddress,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") @Digits(integer = 3, fraction = 6) BigDecimal latitude,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") @Digits(integer = 3, fraction = 6) BigDecimal longitude,
        @NotNull @NotEmpty @Size(max = 20) Set<@NotBlank @Size(max = 80) String> requiredSkills
) { }
