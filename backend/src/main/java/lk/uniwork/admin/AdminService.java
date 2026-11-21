package lk.uniwork.admin;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.UserIdentityService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static lk.uniwork.admin.AdminDtos.*;

@Service
public class AdminService {
    private final JdbcTemplate db;
    private final UserIdentityService identities;
    private final int lowRatingThreshold;
    private final int seriousReportThreshold;

    public AdminService(JdbcTemplate db, UserIdentityService identities,
            @Value("${uniwork.admin.watchlist-low-rating-threshold:2}") int lowRatingThreshold,
            @Value("${uniwork.admin.watchlist-serious-report-threshold:2}") int seriousReportThreshold) {
        if (lowRatingThreshold < 1 || lowRatingThreshold > 5 || seriousReportThreshold < 1)
            throw new IllegalArgumentException("Watchlist thresholds are invalid.");
        this.db = db; this.identities = identities;
        this.lowRatingThreshold = lowRatingThreshold; this.seriousReportThreshold = seriousReportThreshold;
    }

    private static UUID id(ResultSet rs, String column) throws SQLException { return rs.getObject(column, UUID.class); }
    private static Instant time(ResultSet rs, String column) throws SQLException { var value = rs.getTimestamp(column); return value == null ? null : value.toInstant(); }
    private long count(String sql, Object... args) { return db.queryForObject(sql, Long.class, args); }
    private <T> PageResponse<T> page(String sql, String countSql, RowMapper<T> mapper, int number, int size, Object... args) {
        int offset = Math.multiplyExact(number, size);
        Object[] paged = java.util.Arrays.copyOf(args, args.length + 2);
        paged[args.length] = size; paged[args.length + 1] = offset;
        long total = count(countSql, args);
        return new PageResponse<>(db.query(sql + " limit ? offset ?", mapper, paged), number, size, total, (int) Math.ceil((double) total / size));
    }

    @Transactional(readOnly = true)
    public Overview overview() {
        long ongoing = count("select count(*) from tasks where status in ('STARTED','ONGOING')");
        long activeSharing = count("select count(*) from safetask_sessions s join task_executions e on e.execution_id=s.execution_id join tasks t on t.task_id=e.task_id where s.revoked_at is null and e.started_at is not null and e.completed_at is null and t.status in ('STARTED','ONGOING')");
        long flagged = count("select count(*) from admin_watchlist_cases where status in ('FLAGGED_FOR_REVIEW','UNDER_INVESTIGATION')");
        long disputes = count("select count(*) from payment_disputes where status not in ('RESOLVED','INSUFFICIENT_EVIDENCE')");
        long reports = count("select count(*) from safety_reports where status in ('OPEN','UNDER_REVIEW')");
        return new Overview(ongoing, activeSharing, flagged, disputes, reports, flagged + disputes + reports,
                count("select count(*) from tasks where status='STARTED'"), count("select count(*) from tasks where status='ONGOING'"),
                count("select count(*) from payment_disputes where status='RESOLVED'"));
    }

    private static final String ACTIVE_FROM = " from tasks t join task_poster_profiles pp on pp.user_id=t.poster_user_id join task_executions e on e.task_id=t.task_id join student_profiles sp on sp.user_id=e.student_user_id left join safetask_sessions ss on ss.execution_id=e.execution_id where t.status in ('STARTED','ONGOING')";
    private static final RowMapper<ActiveTask> ACTIVE_TASK = (rs, row) -> new ActiveTask(id(rs,"task_id"), rs.getString("title"), rs.getString("status"), rs.getString("location_address"),
            rs.getBigDecimal("latitude"), rs.getBigDecimal("longitude"), time(rs,"started_at"), rs.getString("poster_name"), id(rs,"poster_user_id"),
            rs.getString("student_name"), id(rs,"student_user_id"), rs.getString("sharing_status"));

    @Transactional(readOnly = true)
    public PageResponse<ActiveTask> activeTasks(int number, int size, String search, String status, Instant from) {
        String filter = " and (?='' or lower(t.title) like lower('%' || ? || '%') or lower(pp.full_name) like lower('%' || ? || '%') or lower(sp.full_name) like lower('%' || ? || '%')) and (?='' or t.status=?) and (cast(? as timestamptz) is null or e.started_at >= cast(? as timestamptz))";
        Object fromTimestamp = from == null ? null : java.sql.Timestamp.from(from);
        Object[] args = {search, search, search, search, status, status, fromTimestamp, fromTimestamp};
        String select = "select t.task_id,t.title,t.status,t.location_address,t.latitude,t.longitude,e.started_at,t.poster_user_id,pp.full_name poster_name,e.student_user_id,sp.full_name student_name,case when ss.session_id is null then 'NOT_SHARED' when ss.revoked_at is not null then 'STOPPED' else 'ACTIVE' end sharing_status";
        return page(select + ACTIVE_FROM + filter + " order by e.started_at desc", "select count(*)" + ACTIVE_FROM + filter, ACTIVE_TASK, number, size, args);
    }

    /** Low ratings or two serious reports are signals for investigation, never automatic findings. */
    @Transactional
    public void refreshWatchlist() {
        db.update("""
            with signals as (
              select t.poster_user_id, count(*) filter (where r.poster_rating <= ?) low_count,
                     max(r.created_at) filter (where r.poster_rating <= ?) latest
              from task_reviews r join tasks t on t.task_id=r.task_id group by t.poster_user_id
            ), complaints as (
              select t.poster_user_id, count(*) serious_count, max(r.created_at) latest
              from safety_reports r join tasks t on t.task_id=r.task_id
              where r.category in ('HARASSMENT','UNSAFE_LOCATION') group by t.poster_user_id
            ), eligible as (
              select coalesce(s.poster_user_id,c.poster_user_id) poster_user_id,
                     greatest(coalesce(s.latest,'epoch'::timestamptz),coalesce(c.latest,'epoch'::timestamptz)) latest
              from signals s full join complaints c on c.poster_user_id=s.poster_user_id
              where coalesce(s.low_count,0)>0 or coalesce(c.serious_count,0)>=?
            )
            insert into admin_watchlist_cases(poster_user_id,last_signal_at)
            select poster_user_id,latest from eligible
            on conflict (poster_user_id) do update set
              status=case when excluded.last_signal_at>admin_watchlist_cases.last_signal_at
                    and admin_watchlist_cases.status in ('RESOLVED','DISMISSED') then 'FLAGGED_FOR_REVIEW'
                    else admin_watchlist_cases.status end,
              last_signal_at=greatest(admin_watchlist_cases.last_signal_at,excluded.last_signal_at),
              updated_at=case when excluded.last_signal_at>admin_watchlist_cases.last_signal_at then now() else admin_watchlist_cases.updated_at end
            """,lowRatingThreshold,lowRatingThreshold,seriousReportThreshold);
    }

    private static final String WATCH_FROM = " from admin_watchlist_cases w join task_poster_profiles p on p.user_id=w.poster_user_id left join (select t.poster_user_id,count(*) total,coalesce(avg(r.poster_rating),0) average,count(*) filter (where r.poster_rating=1) ones,count(*) filter (where r.poster_rating=2) twos from task_reviews r join tasks t on t.task_id=r.task_id group by t.poster_user_id) ratings on ratings.poster_user_id=w.poster_user_id left join (select t.poster_user_id,count(*) serious from safety_reports r join tasks t on t.task_id=r.task_id where r.category in ('HARASSMENT','UNSAFE_LOCATION') group by t.poster_user_id) reports on reports.poster_user_id=w.poster_user_id left join (select poster_user_id,count(*) completed from tasks where status='COMPLETED' group by poster_user_id) completed on completed.poster_user_id=w.poster_user_id left join (select t.poster_user_id,count(*) disputes from payment_disputes d join tasks t on t.task_id=d.task_id group by t.poster_user_id) disputes on disputes.poster_user_id=w.poster_user_id";
    private static final String WATCH_SELECT = "select w.poster_user_id,p.full_name,w.status,w.flagged_at,w.last_signal_at,w.decision_reason,coalesce(ratings.average,0) average_rating,coalesce(ratings.total,0) total_reviews,coalesce(ratings.ones,0) one_star,coalesce(ratings.twos,0) two_star,coalesce(reports.serious,0) serious_reports,coalesce(completed.completed,0) completed_tasks,coalesce(disputes.disputes,0) payment_disputes";
    private static final RowMapper<WatchlistCase> WATCH = (rs,row) -> new WatchlistCase(id(rs,"poster_user_id"),rs.getString("full_name"),rs.getString("status"),time(rs,"flagged_at"),time(rs,"last_signal_at"),rs.getString("decision_reason"),rs.getDouble("average_rating"),rs.getLong("total_reviews"),rs.getLong("one_star"),rs.getLong("two_star"),rs.getLong("serious_reports"),rs.getLong("completed_tasks"),rs.getLong("payment_disputes"));

    @Transactional
    public PageResponse<WatchlistCase> watchlist(int number, int size, String status) {
        refreshWatchlist();
        String filter = " where (?='' or w.status=?)";
        return page(WATCH_SELECT + WATCH_FROM + filter + " order by w.flagged_at desc", "select count(*) from admin_watchlist_cases w" + filter, WATCH, number, size, status, status);
    }

    @Transactional
    public WatchDetail watchCase(UUID posterId) {
        refreshWatchlist();
        var rows = db.query(WATCH_SELECT + WATCH_FROM + " where w.poster_user_id=?", WATCH, posterId);
        if (rows.isEmpty()) throw missing();
        var signals = db.query("""
            select r.review_id source_id,t.task_id,t.title task_title,'REVIEW' source_type,
                   r.poster_rating rating,r.review_text detail,r.created_at
            from task_reviews r join tasks t on t.task_id=r.task_id
            where t.poster_user_id=? and r.poster_rating in (1,2)
            union all
            select r.report_id,t.task_id,t.title,'SAFETY_REPORT',null,r.description,r.created_at
            from safety_reports r join tasks t on t.task_id=r.task_id
            where t.poster_user_id=? and r.category in ('HARASSMENT','UNSAFE_LOCATION')
            order by created_at desc limit 50
            """, (rs,row) -> new WatchSignal(id(rs,"source_id"),id(rs,"task_id"),rs.getString("task_title"),rs.getString("source_type"),rs.getObject("rating",Integer.class),rs.getString("detail"),time(rs,"created_at")),posterId,posterId);
        return new WatchDetail(rows.getFirst(), notes("WATCHLIST",posterId), signals);
    }

    private static final String DISPUTE_FROM = " from payment_disputes d join tasks t on t.task_id=d.task_id join student_profiles sp on sp.user_id=d.student_user_id join task_poster_profiles pp on pp.user_id=t.poster_user_id";
    private static final String DISPUTE_SELECT = "select d.*,t.title task_title,t.amount_lkr agreed_amount_lkr,sp.full_name student_name,pp.full_name poster_name";
    private static final RowMapper<Dispute> DISPUTE = (rs,row) -> new Dispute(id(rs,"dispute_id"),id(rs,"task_id"),rs.getString("task_title"),rs.getString("student_name"),rs.getString("poster_name"),rs.getBigDecimal("agreed_amount_lkr"),rs.getBigDecimal("actual_amount_lkr"),rs.getString("reason"),rs.getString("student_statement"),rs.getString("poster_response"),rs.getObject("poster_says_paid",Boolean.class),rs.getString("status"),rs.getString("outcome"),time(rs,"created_at"),time(rs,"responded_at"),time(rs,"updated_at"));

    @Transactional(readOnly = true)
    public PageResponse<Dispute> disputes(int number, int size, String status) {
        String filter = " where (?='' or d.status=?)";
        return page(DISPUTE_SELECT + DISPUTE_FROM + filter + " order by d.created_at desc", "select count(*) from payment_disputes d" + filter, DISPUTE, number, size, status, status);
    }
    @Transactional(readOnly = true)
    public CaseDetail<Dispute> dispute(UUID disputeId) {
        var rows = db.query(DISPUTE_SELECT + DISPUTE_FROM + " where d.dispute_id=?",DISPUTE,disputeId);
        if (rows.isEmpty()) throw missing();
        return new CaseDetail<>(rows.getFirst(), notes("DISPUTE",disputeId));
    }

    private static final String REPORT_FROM = " from safety_reports r join tasks t on t.task_id=r.task_id join student_profiles sp on sp.user_id=r.reporter_user_id join task_poster_profiles pp on pp.user_id=t.poster_user_id";
    private static final RowMapper<SafetyCase> REPORT = (rs,row) -> new SafetyCase(id(rs,"report_id"),id(rs,"task_id"),rs.getString("task_title"),rs.getString("category"),rs.getString("description"),rs.getString("status"),time(rs,"created_at"),rs.getString("reporter_name"),rs.getString("poster_name"));
    private static final String REPORT_SELECT = "select r.report_id,r.task_id,t.title task_title,r.category,r.description,r.status,r.created_at,sp.full_name reporter_name,pp.full_name poster_name";
    @Transactional(readOnly = true)
    public PageResponse<SafetyCase> safetyCases(int number, int size, String status) {
        String filter = " where (?='' or r.status=?)";
        return page(REPORT_SELECT + REPORT_FROM + filter + " order by r.created_at desc", "select count(*) from safety_reports r" + filter, REPORT, number, size, status, status);
    }
    @Transactional(readOnly = true)
    public CaseDetail<SafetyCase> safetyCase(UUID reportId) {
        var rows = db.query(REPORT_SELECT + REPORT_FROM + " where r.report_id=?",REPORT,reportId);
        if (rows.isEmpty()) throw missing();
        return new CaseDetail<>(rows.getFirst(),notes("SAFETY_REPORT",reportId));
    }

    private static final RowMapper<Note> NOTE = (rs,row) -> new Note(id(rs,"note_id"),rs.getString("case_type"),id(rs,"case_id"),rs.getString("admin_clerk_id"),rs.getString("note"),time(rs,"created_at"));
    private List<Note> notes(String type, UUID id) { return db.query("select * from admin_case_notes where case_type=? and case_id=? order by created_at desc",NOTE,type,id); }
    @Transactional
    public Note addNote(String admin, String type, UUID target, String text) {
        requireCase(type,target);
        UUID noteId=UUID.randomUUID();
        db.update("insert into admin_case_notes(note_id,case_type,case_id,admin_clerk_id,note) values(?,?,?,?,?)",noteId,type,target,admin,text.trim());
        audit(admin,"NOTE_ADDED",type,target,null,null,"Investigation note recorded");
        return notes(type,target).stream().filter(note -> note.noteId().equals(noteId)).findFirst().orElseThrow();
    }
    private void requireCase(String type, UUID id) {
        String table = switch(type) { case "WATCHLIST" -> "admin_watchlist_cases"; case "DISPUTE" -> "payment_disputes"; case "SAFETY_REPORT" -> "safety_reports"; default -> throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_CASE_TYPE","Choose a valid case type."); };
        String column = switch(type) { case "WATCHLIST" -> "poster_user_id"; case "DISPUTE" -> "dispute_id"; default -> "report_id"; };
        if(count("select count(*) from " + table + " where " + column + "=?",id)==0) throw missing();
    }

    @Transactional
    public void decide(String admin, String type, UUID target, String status, String reason) {
        String table; String column; String allowed;
        switch(type) {
            case "WATCHLIST" -> { table="admin_watchlist_cases"; column="poster_user_id"; allowed="FLAGGED_FOR_REVIEW,UNDER_INVESTIGATION,RESOLVED,DISMISSED"; }
            case "DISPUTE" -> { table="payment_disputes"; column="dispute_id"; allowed="OPEN,AWAITING_POSTER_RESPONSE,UNDER_REVIEW,RESOLVED,INSUFFICIENT_EVIDENCE"; }
            case "SAFETY_REPORT" -> { table="safety_reports"; column="report_id"; allowed="OPEN,UNDER_REVIEW,RESOLVED,CLOSED"; }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_CASE_TYPE","Choose a valid case type.");
        }
        if (!List.of(allowed.split(",")).contains(status)) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_CASE_STATUS","Choose a valid status.");
        var previous = db.queryForList("select status from " + table + " where " + column + "=? for update",String.class,target);
        if(previous.isEmpty()) throw missing();
        String before=previous.getFirst();
        if(type.equals("WATCHLIST")) db.update("update admin_watchlist_cases set status=?,decision_reason=?,updated_at=now() where poster_user_id=?",status,reason.trim(),target);
        else if(type.equals("DISPUTE")) db.update("update payment_disputes set status=?,outcome=?,updated_at=now() where dispute_id=?",status,reason.trim(),target);
        else db.update("update safety_reports set status=? where report_id=?",status,target);
        audit(admin,"CASE_STATUS_CHANGED",type,target,before,status,reason.trim());
    }

    @Transactional
    public Dispute fileComplaint(String student, UUID taskId, ComplaintRequest request) {
        var user=identities.requireStudent(student);
        if(request.actualAmountLkr()!=null && request.actualAmountLkr().signum()<0) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_AMOUNT","Received amount must be zero or greater.");
        if(request.reason()==PaymentReason.INCORRECT_PAYMENT_AMOUNT && request.actualAmountLkr()==null) throw new ApiException(HttpStatus.BAD_REQUEST,"AMOUNT_REQUIRED","Enter the amount received.");
        long eligible=count("select count(*) from task_executions e join tasks t on t.task_id=e.task_id where e.task_id=? and e.student_user_id=? and e.completed_at is not null and t.status='COMPLETED'",taskId,user.getId());
        if(eligible==0) throw new ApiException(HttpStatus.FORBIDDEN,"TASK_NOT_ASSIGNED","Only the assigned student can report a completed task.");
        UUID disputeId=UUID.randomUUID();
        try { db.update("insert into payment_disputes(dispute_id,task_id,student_user_id,reason,actual_amount_lkr,student_statement,status) values(?,?,?,?,?,?,'AWAITING_POSTER_RESPONSE')",
                disputeId,taskId,user.getId(),request.reason().name(),request.actualAmountLkr(),request.statement().trim()); }
        catch(DuplicateKeyException duplicate) { throw new ApiException(HttpStatus.CONFLICT,"PAYMENT_DISPUTE_EXISTS","A complaint for this payment issue already exists."); }
        return dispute(disputeId).item();
    }
    @Transactional(readOnly = true)
    public List<Dispute> studentDisputes(String student, UUID taskId) {
        identities.requireStudent(student);
        return db.query(DISPUTE_SELECT + DISPUTE_FROM + " join uniwork_users u on u.user_id=d.student_user_id where d.task_id=? and u.clerk_user_id=? order by d.created_at desc",DISPUTE,taskId,student);
    }
    @Transactional(readOnly = true)
    public List<Dispute> posterDisputes(String poster, UUID taskId) {
        identities.requireTaskPoster(poster);
        return db.query(DISPUTE_SELECT + DISPUTE_FROM + " join uniwork_users u on u.user_id=t.poster_user_id where d.task_id=? and u.clerk_user_id=? order by d.created_at desc",DISPUTE,taskId,poster);
    }
    @Transactional
    public Dispute posterResponse(String poster, UUID disputeId, PosterResponseRequest request) {
        identities.requireTaskPoster(poster);
        var owned=db.queryForList("select d.status from payment_disputes d join tasks t on t.task_id=d.task_id join uniwork_users u on u.user_id=t.poster_user_id where d.dispute_id=? and u.clerk_user_id=? for update",String.class,disputeId,poster);
        if(owned.isEmpty()) throw missing();
        if(!List.of("OPEN","AWAITING_POSTER_RESPONSE","UNDER_REVIEW").contains(owned.getFirst()) || count("select count(*) from payment_disputes where dispute_id=? and poster_response is not null",disputeId)>0)
            throw new ApiException(HttpStatus.CONFLICT,"RESPONSE_ALREADY_RECORDED","The response cannot be changed after submission.");
        db.update("update payment_disputes set poster_response=?,poster_says_paid=?,responded_at=now(),status='UNDER_REVIEW',updated_at=now() where dispute_id=?",request.details().trim(),request.paymentMade(),disputeId);
        return dispute(disputeId).item();
    }

    @Transactional(readOnly = true)
    public void requireCanPublish(UUID posterId) {
        if(count("select count(*) from admin_publishing_restrictions where poster_user_id=? and removed_at is null and expires_at>now()",posterId)>0)
            throw new ApiException(HttpStatus.FORBIDDEN,"PUBLISHING_RESTRICTED","Task publishing is temporarily restricted. Please contact UniWork support for details.");
    }
    @Transactional
    public void restrict(String admin, UUID posterId, RestrictionRequest request) {
        if(!request.expiresAt().isAfter(Instant.now())) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_EXPIRY","Choose a future expiry time.");
        if(count("select count(*) from uniwork_users where user_id=? and role='TASK_POSTER'",posterId)==0) throw missing();
        db.update("insert into admin_publishing_restrictions(poster_user_id,reason,expires_at,applied_by) values(?,?,?,?) on conflict (poster_user_id) do update set reason=excluded.reason,expires_at=excluded.expires_at,applied_at=now(),removed_at=null,applied_by=excluded.applied_by,removed_by=null",posterId,request.reason().trim(),java.sql.Timestamp.from(request.expiresAt()),admin);
        audit(admin,"PUBLISHING_RESTRICTED","POSTER",posterId,null,request.expiresAt().toString(),request.reason().trim());
    }
    @Transactional
    public void removeRestriction(String admin, UUID posterId, String reason) {
        int changed=db.update("update admin_publishing_restrictions set removed_at=now(),removed_by=? where poster_user_id=? and removed_at is null",admin,posterId);
        if(changed==0) throw missing();
        audit(admin,"PUBLISHING_RESTRICTION_REMOVED","POSTER",posterId,"ACTIVE","REMOVED",reason.trim());
    }
    @Transactional
    public void warn(String admin, UUID posterId, String reason) {
        if(count("select count(*) from uniwork_users where user_id=? and role='TASK_POSTER'",posterId)==0) throw missing();
        audit(admin,"OFFICIAL_WARNING","POSTER",posterId,null,"RECORDED",reason.trim());
    }
    private void audit(String admin,String action,String targetType,UUID target,String before,String after,String reason) {
        db.update("insert into admin_audit_events(audit_id,admin_clerk_id,action,target_type,target_id,before_state,after_state,reason) values(?,?,?,?,?,?,?,?)",
                UUID.randomUUID(),admin,action,targetType,target,before,after,reason);
    }
    private static final RowMapper<AuditEvent> AUDIT = (rs,row) -> new AuditEvent(id(rs,"audit_id"),rs.getString("admin_clerk_id"),rs.getString("action"),rs.getString("target_type"),id(rs,"target_id"),rs.getString("before_state"),rs.getString("after_state"),rs.getString("reason"),time(rs,"created_at"));
    @Transactional(readOnly = true)
    public PageResponse<AuditEvent> auditEvents(int number,int size) {
        return page("select * from admin_audit_events order by created_at desc","select count(*) from admin_audit_events",AUDIT,number,size);
    }
    private ApiException missing() { return new ApiException(HttpStatus.NOT_FOUND,"CASE_NOT_FOUND","This record could not be found."); }
}
