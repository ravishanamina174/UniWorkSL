package lk.uniwork.security;

import lk.uniwork.health.HealthController;
import lk.uniwork.health.HealthResponse;
import lk.uniwork.health.HealthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private HealthService healthService;

    @Test
    void healthIsPublicAndOtherRoutesRequireAuthentication() throws Exception {
        when(healthService.check()).thenReturn(new HealthResponse("UP", "UniWork API", "UP"));
        mockMvc.perform(get("/api/v1/health").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/private-resource"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void browserHealthRequestsAllowConfiguredWebOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/health")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }
}
