package lk.uniwork.ai;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record EnhanceTextRequest(@NotNull EnhancementType type, @NotBlank @Size(max = 5000) String text) {}
