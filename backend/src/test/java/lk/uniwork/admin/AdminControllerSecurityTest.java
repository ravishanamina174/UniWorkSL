package lk.uniwork.admin;

import lk.uniwork.security.AdminAuthorization;
import lk.uniwork.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean AdminAuthorization adminAuthorization;
    @MockitoBean AdminService service;

    @Test void unauthenticatedAndNonAdminCannotReadOverview() throws Exception {
        mvc.perform(get("/api/v1/admin/overview")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/overview").with(jwt().jwt(token -> token.subject("user_student"))))
                .andExpect(status().isForbidden());
    }

    @Test void everyRequestRechecksAdminAccess() throws Exception {
        when(adminAuthorization.isAdmin(any(Authentication.class))).thenReturn(true,false);
        when(service.overview()).thenReturn(new AdminDtos.Overview(0,0,0,0,0,0,0,0,0));
        mvc.perform(get("/api/v1/admin/overview").with(jwt().jwt(token -> token.subject("user_admin"))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/overview").with(jwt().jwt(token -> token.subject("user_admin"))))
                .andExpect(status().isForbidden());
    }
}
