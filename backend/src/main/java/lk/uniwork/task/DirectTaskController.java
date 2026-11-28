package lk.uniwork.task;
import jakarta.validation.Valid; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.security.oauth2.jwt.Jwt; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1") public class DirectTaskController { private final DirectTaskService service; public DirectTaskController(DirectTaskService service){this.service=service;}
 @PostMapping("/poster/direct-tasks") public DirectTaskDtos.Response create(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody DirectTaskDtos.Create request){return service.create(jwt.getSubject(),request);}
 @GetMapping("/poster/direct-tasks") public List<DirectTaskDtos.Response> poster(@AuthenticationPrincipal Jwt jwt){return service.poster(jwt.getSubject());}
 @GetMapping("/student/direct-tasks") public List<DirectTaskDtos.Response> student(@AuthenticationPrincipal Jwt jwt){return service.student(jwt.getSubject());}
 @PostMapping("/student/direct-tasks/{id}/action") public DirectTaskDtos.Response action(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody DirectTaskDtos.Action request){return service.action(jwt.getSubject(),id,request);}
 @PostMapping("/poster/direct-tasks/{id}/action") public DirectTaskDtos.Response posterAction(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody DirectTaskDtos.Action request){return service.posterAction(jwt.getSubject(),id,request);}
}
