package lk.uniwork.admin;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.UniWorkUser;
import lk.uniwork.user.UserIdentityService;
import lk.uniwork.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AdminServiceTest {
    private final JdbcTemplate db=mock(JdbcTemplate.class);
    private final UserIdentityService identities=mock(UserIdentityService.class);
    private final AdminService service=new AdminService(db,identities,2,2);

    @Test void invalidComplaintAmountIsRejectedBeforeDatabaseWrite() {
        when(identities.requireStudent("student")).thenReturn(new UniWorkUser("student",UserRole.STUDENT));
        var request=new AdminDtos.ComplaintRequest(AdminDtos.PaymentReason.INCORRECT_PAYMENT_AMOUNT,new BigDecimal("-1"),"Incorrect payment received");
        assertEquals(HttpStatus.BAD_REQUEST,assertThrows(ApiException.class,
                () -> service.fileComplaint("student",UUID.randomUUID(),request)).getStatus());
        verifyNoInteractions(db);
    }

    @Test void restrictionMustHaveFutureExpiry() {
        var request=new AdminDtos.RestrictionRequest("Investigation pending",Instant.now().minusSeconds(60));
        assertEquals(HttpStatus.BAD_REQUEST,assertThrows(ApiException.class,
                () -> service.restrict("admin",UUID.randomUUID(),request)).getStatus());
        verifyNoInteractions(db);
    }
}
