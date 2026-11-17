package lk.uniwork.lookup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record StudentLookupRequest(@NotBlank @Size(max = 500) String query) {}
