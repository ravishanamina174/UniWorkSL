package lk.uniwork.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentProfileRequest(@NotBlank @Size(max = 160) String fullName,
                                    @Min(16) @Max(100) short age,
                                    @NotNull Gender gender,
                                    @NotBlank @Size(max = 500) String address,
                                    @NotBlank @Pattern(regexp = "[+0-9 ()-]{7,24}") String phoneNumber,
                                    @NotBlank @Pattern(regexp = "(?i)([0-9]{9}[vVxX]|[0-9]{12})", message = "Enter a valid NIC number.") String nic,
                                    @NotBlank @Size(max = 200) String university,
                                    @NotBlank @Size(max = 200) String faculty,
                                    @NotNull StudentCategory primaryCategory) {
    public StudentProfileRequest(String fullName, short age, Gender gender, String address, String phoneNumber,
                                 String nic, String university, String faculty) {
        this(fullName, age, gender, address, phoneNumber, nic, university, faculty, null);
    }
}
