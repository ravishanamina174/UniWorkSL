package lk.uniwork.task;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
public record LocationCheckRequest(boolean permissionGranted, boolean locationAvailable,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
        @Positive Double accuracyMeters) { }
