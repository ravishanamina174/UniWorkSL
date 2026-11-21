package lk.uniwork.admin;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import static lk.uniwork.admin.AdminDtos.*;

@RestController
public class PaymentDisputeController {
    private final AdminService service;
    public PaymentDisputeController(AdminService service) { this.service=service; }
    @PostMapping("/api/v1/student/tasks/{taskId}/payment-disputes") @ResponseStatus(HttpStatus.CREATED)
    public Dispute file(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID taskId,@Valid @RequestBody ComplaintRequest request) {
        return service.fileComplaint(jwt.getSubject(),taskId,request);
    }
    @GetMapping("/api/v1/student/tasks/{taskId}/payment-disputes")
    public List<Dispute> student(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID taskId) { return service.studentDisputes(jwt.getSubject(),taskId); }
    @GetMapping("/api/v1/poster/tasks/{taskId}/payment-disputes")
    public List<Dispute> poster(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID taskId) { return service.posterDisputes(jwt.getSubject(),taskId); }
    @PostMapping("/api/v1/poster/payment-disputes/{id}/response")
    public Dispute respond(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody PosterResponseRequest request) {
        return service.posterResponse(jwt.getSubject(),id,request);
    }
}
