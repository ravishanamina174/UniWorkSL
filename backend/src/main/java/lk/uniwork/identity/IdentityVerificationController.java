package lk.uniwork.identity;

import lk.uniwork.common.PageResponse;
import lk.uniwork.user.UserRole;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
public class IdentityVerificationController {
    private final IdentityVerificationService service;
    public IdentityVerificationController(IdentityVerificationService service) { this.service=service; }

    @GetMapping("/api/v1/{audience:student|poster}/identity")
    public IdentityVerificationService.State status(@AuthenticationPrincipal Jwt jwt,@PathVariable String audience) {
        return service.status(jwt.getSubject(),role(audience));
    }
    @PostMapping(value="/api/v1/{audience:student|poster}/identity/match",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public IdentityVerificationService.MatchResult match(@AuthenticationPrincipal Jwt jwt,@PathVariable String audience,@RequestPart("image") MultipartFile image) {
        return service.match(jwt.getSubject(),role(audience),image);
    }
    @PostMapping(value="/api/v1/{audience:student|poster}/identity/reviews",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public IdentityVerificationService.State review(@AuthenticationPrincipal Jwt jwt,@PathVariable String audience,@RequestPart("image") MultipartFile image) {
        return service.submitReview(jwt.getSubject(),role(audience),image);
    }
    private UserRole role(String audience) { return audience.equals("student")?UserRole.STUDENT:UserRole.TASK_POSTER; }

    @GetMapping("/api/v1/admin/identity-reviews")
    public PageResponse<IdentityVerificationService.Review> list(@RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="PENDING") String status,
            @RequestParam(defaultValue="") String search) {
        return service.reviews(page,size,status,search);
    }
    @GetMapping("/api/v1/admin/identity-reviews/{id}")
    public IdentityVerificationService.Review detail(@PathVariable UUID id) { return service.review(id); }
    public record NicComparison(String profileNic) { }
    @GetMapping("/api/v1/admin/identity-reviews/{id}/comparison")
    public ResponseEntity<NicComparison> comparison(@PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new NicComparison(service.comparisonNic(id)));
    }
    @GetMapping(value="/api/v1/admin/identity-reviews/{id}/image",produces=MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> image(@PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Pragma","no-cache")
                .header("X-Content-Type-Options","nosniff").contentType(MediaType.IMAGE_JPEG).body(service.image(id));
    }
    public record Decision(String reason) { }
    @PostMapping("/api/v1/admin/identity-reviews/{id}/approve")
    public IdentityVerificationService.Review approve(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@RequestBody Decision request) {
        return service.decide(jwt.getSubject(),id,true,request.reason());
    }
    @PostMapping("/api/v1/admin/identity-reviews/{id}/reject")
    public IdentityVerificationService.Review reject(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@RequestBody Decision request) {
        return service.decide(jwt.getSubject(),id,false,request.reason());
    }
}
