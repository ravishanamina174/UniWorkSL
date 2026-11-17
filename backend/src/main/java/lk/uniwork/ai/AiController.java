package lk.uniwork.ai;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/ai")
public class AiController {
    private final GeminiTextService service;
    public AiController(GeminiTextService service) { this.service = service; }
    @PostMapping("/enhance-text")
    public EnhanceTextResponse enhance(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EnhanceTextRequest request) {
        String original = request.text().trim(); String enhanced = service.enhance(request.type(), original);
        if (request.type() == EnhancementType.TITLE && enhanced.length() > 120) throw new lk.uniwork.common.ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "AI_INVALID_OUTPUT", "The AI returned a title that is too long.");
        if (request.type() == EnhancementType.DESCRIPTION && enhanced.split("\\s+").length > 100) throw new lk.uniwork.common.ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "AI_INVALID_OUTPUT", "The AI returned a description that is too long.");
        return new EnhanceTextResponse(original, enhanced);
    }
}
