package lk.uniwork.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @NotBlank @Size(max = 160) String fullName,
        @NotBlank @Size(max = 500) String address,
        @NotBlank @Pattern(regexp = "(?:\\+94|0)7[0-9]{8}", message = "Enter a valid Sri Lankan mobile number.") String phoneNumber,
        @NotBlank @Pattern(regexp = "(?:[0-9]{9}[vVxX]|[0-9]{12})", message = "Enter a valid NIC number.") String nic,
        @NotNull Gender gender
) { }
