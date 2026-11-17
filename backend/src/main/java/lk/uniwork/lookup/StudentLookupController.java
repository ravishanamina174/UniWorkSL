package lk.uniwork.lookup;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/poster/student-lookup")
public class StudentLookupController {
    private final StudentLookupService service;
    public StudentLookupController(StudentLookupService service){this.service=service;}
    @PostMapping public StudentLookupResponse search(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody StudentLookupRequest request){return service.search(jwt.getSubject(),request.query().trim());}
}
