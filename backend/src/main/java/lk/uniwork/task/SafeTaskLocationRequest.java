package lk.uniwork.task;

import jakarta.validation.constraints.*;

public record SafeTaskLocationRequest(@NotNull @DecimalMin("-90") @DecimalMax("90") Double latitude,
                                      @NotNull @DecimalMin("-180") @DecimalMax("180") Double longitude,
                                      @DecimalMin("0") @DecimalMax("10000") Double accuracyMeters) { }
