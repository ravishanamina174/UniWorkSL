package lk.uniwork.task;

import lk.uniwork.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
@Import(SecurityConfig.class)
class TaskControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private TaskService service;

    @Test
    void posterTaskCreationRequiresAnAuthenticatedJwt() throws Exception {
        mockMvc.perform(post("/api/v1/poster/tasks").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void invalidTaskInputIsRejectedBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/v1/poster/tasks").with(jwt().jwt(token -> token.subject("clerk_poster")))
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"title":"","description":"","amountLkr":0,"taskDateTime":"2020-01-01T09:00","locationAddress":"","latitude":91,"longitude":181,"requiredSkills":[]}
                                """))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        verify(service, never()).create(eq("clerk_poster"), any());
    }

    @Test
    void authenticatedValidTaskRequestIsMappedAndCreatedAsDraft() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.create(eq("clerk_poster"), any())).thenReturn(new TaskResponse(id, UUID.randomUUID(), "Carry boxes", "Move boxes",
                new BigDecimal("2500.00"), Set.of("lifting"), LocalDateTime.of(2027, 1, 10, 10, 0), "Colombo 07",
                new BigDecimal("6.9"), new BigDecimal("79.8"), TaskStatus.DRAFT, Instant.now(), Instant.now()));
        mockMvc.perform(post("/api/v1/poster/tasks").with(jwt().jwt(token -> token.subject("clerk_poster")))
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"title":"Carry boxes","description":"Move boxes","amountLkr":2500.00,"taskDateTime":"2027-01-10T10:00","locationAddress":"Colombo 07","latitude":6.9,"longitude":79.8,"requiredSkills":["lifting"]}
                                """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.taskId").value(id.toString())).andExpect(jsonPath("$.status").value("DRAFT"));
        verify(service).create(eq("clerk_poster"), any());
    }
}
