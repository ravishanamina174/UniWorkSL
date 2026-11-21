package lk.uniwork.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lk.uniwork.common.PageResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;
import static lk.uniwork.admin.AdminDtos.*;

@Validated
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService service;
    public AdminController(AdminService service) { this.service = service; }

    @GetMapping("/overview") public Overview overview() { service.refreshWatchlist(); return service.overview(); }
    @GetMapping("/tasks") public PageResponse<ActiveTask> tasks(@RequestParam(defaultValue="0") @Min(0) int page,
            @RequestParam(defaultValue="20") @Min(1) @Max(50) int size, @RequestParam(defaultValue="") String search,
            @RequestParam(defaultValue="") String status, @RequestParam(required=false) Instant startedAfter) {
        return service.activeTasks(page,size,search.trim(),status.trim(),startedAfter);
    }
    @GetMapping("/watchlist") public PageResponse<WatchlistCase> watchlist(@RequestParam(defaultValue="0") @Min(0) int page,
            @RequestParam(defaultValue="20") @Min(1) @Max(50) int size, @RequestParam(defaultValue="") String status) { return service.watchlist(page,size,status); }
    @GetMapping("/watchlist/{posterId}") public WatchDetail watchCase(@PathVariable UUID posterId) { return service.watchCase(posterId); }
    @GetMapping("/disputes") public PageResponse<Dispute> disputes(@RequestParam(defaultValue="0") @Min(0) int page,
            @RequestParam(defaultValue="20") @Min(1) @Max(50) int size, @RequestParam(defaultValue="") String status) { return service.disputes(page,size,status); }
    @GetMapping("/disputes/{id}") public CaseDetail<Dispute> dispute(@PathVariable UUID id) { return service.dispute(id); }
    @GetMapping("/cases") public PageResponse<SafetyCase> cases(@RequestParam(defaultValue="0") @Min(0) int page,
            @RequestParam(defaultValue="20") @Min(1) @Max(50) int size, @RequestParam(defaultValue="") String status) { return service.safetyCases(page,size,status); }
    @GetMapping("/cases/{id}") public CaseDetail<SafetyCase> safetyCase(@PathVariable UUID id) { return service.safetyCase(id); }
    @GetMapping("/audit-logs") public PageResponse<AuditEvent> audit(@RequestParam(defaultValue="0") @Min(0) int page,
            @RequestParam(defaultValue="20") @Min(1) @Max(50) int size) { return service.auditEvents(page,size); }

    @PostMapping("/notes/{type}/{id}") public Note note(@AuthenticationPrincipal Jwt jwt,@PathVariable String type,@PathVariable UUID id,
            @Valid @RequestBody NoteRequest request) { return service.addNote(jwt.getSubject(),type,id,request.note()); }
    @PostMapping("/decisions/{type}/{id}") public ActionResult decide(@AuthenticationPrincipal Jwt jwt,@PathVariable String type,@PathVariable UUID id,
            @Valid @RequestBody DecisionRequest request) { service.decide(jwt.getSubject(),type,id,request.status(),request.reason()); return new ActionResult("RECORDED"); }
    @PostMapping("/posters/{posterId}/warnings") public ActionResult warn(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID posterId,
            @Valid @RequestBody WarningRequest request) { service.warn(jwt.getSubject(),posterId,request.reason()); return new ActionResult("RECORDED"); }
    @PostMapping("/posters/{posterId}/restriction") public ActionResult restrict(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID posterId,
            @Valid @RequestBody RestrictionRequest request) { service.restrict(jwt.getSubject(),posterId,request); return new ActionResult("RECORDED"); }
    @DeleteMapping("/posters/{posterId}/restriction") public ActionResult removeRestriction(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID posterId,
            @Valid @RequestBody WarningRequest request) { service.removeRestriction(jwt.getSubject(),posterId,request.reason()); return new ActionResult("RECORDED"); }
}
