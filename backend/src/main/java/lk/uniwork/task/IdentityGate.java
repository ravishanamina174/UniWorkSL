package lk.uniwork.task;
import lk.uniwork.identity.IdentityVerificationService; import java.util.UUID; import org.springframework.stereotype.Component;
@Component public class IdentityGate { private final IdentityVerificationService verification; public IdentityGate(IdentityVerificationService verification){this.verification=verification;} public void requirePosterVerified(UUID id){verification.requireVerified(id,"NIC_VERIFICATION_REQUIRED","Complete NIC review before sending direct task offers.");} }
