package lk.uniwork.user;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
public class PublicStudentController {
    private final PublicStudentService service;
    public PublicStudentController(PublicStudentService service) { this.service = service; }
    @GetMapping("/categories/{category}/students")
    public List<PublicStudentProfile> byCategory(@PathVariable StudentCategory category) { return service.byCategory(category); }
    @GetMapping("/students/{id}")
    public PublicStudentProfile get(@PathVariable UUID id) { return service.get(id); }
}
