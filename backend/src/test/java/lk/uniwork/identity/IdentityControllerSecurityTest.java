package lk.uniwork.identity;

import lk.uniwork.common.PageResponse;
import lk.uniwork.security.AdminAuthorization;
import lk.uniwork.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IdentityVerificationController.class)
@Import(SecurityConfig.class)
class IdentityControllerSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean AdminAuthorization adminAuthorization;
    @MockitoBean IdentityVerificationService service;

    @Test void privateReviewIsDeniedWithoutCurrentAdminRole() throws Exception {
        mvc.perform(get("/api/v1/admin/identity-reviews")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/identity-reviews").with(jwt().jwt(token -> token.subject("student"))))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/identity-reviews/00000000-0000-0000-0000-000000000001/image")
                .with(jwt().jwt(token -> token.subject("poster")))).andExpect(status().isForbidden());
    }
    @Test void roleRemovalImmediatelyBlocksNextRequest() throws Exception {
        when(adminAuthorization.isAdmin(any(Authentication.class))).thenReturn(true,false);
        when(service.reviews(eq(0),eq(20),eq("PENDING"),eq(""))).thenReturn(new PageResponse<>(List.of(),0,20,0,0));
        mvc.perform(get("/api/v1/admin/identity-reviews").with(jwt().jwt(token -> token.subject("admin")))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/identity-reviews").with(jwt().jwt(token -> token.subject("admin")))).andExpect(status().isForbidden());
    }
}
