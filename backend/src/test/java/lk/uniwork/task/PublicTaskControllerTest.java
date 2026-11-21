package lk.uniwork.task;

import lk.uniwork.common.PageResponse;
import lk.uniwork.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicTaskController.class)
@Import(SecurityConfig.class)
class PublicTaskControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private TaskService service;
    @MockitoBean private lk.uniwork.security.AdminAuthorization adminAuthorization;

    @Test
    void publishedTaskListingIsPublicAndReturnsTheRealEmptyPage() throws Exception {
        when(service.listPublic(0, 10, null, null, null)).thenReturn(new PageResponse<>(List.of(), 0, 10, 0, 0));
        mockMvc.perform(get("/api/v1/public/tasks"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(0)).andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void invalidPublicPageSizeReturnsAClientValidationError() throws Exception {
        mockMvc.perform(get("/api/v1/public/tasks").param("size", "51"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }
}
