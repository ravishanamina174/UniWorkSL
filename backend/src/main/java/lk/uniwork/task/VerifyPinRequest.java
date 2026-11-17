package lk.uniwork.task;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
public record VerifyPinRequest(@NotBlank @Pattern(regexp = "[0-9]{4}") String pin) { }
