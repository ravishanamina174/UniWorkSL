package lk.uniwork.task;

import lk.uniwork.common.ApiException;
import lk.uniwork.common.PageResponse;
import lk.uniwork.user.UserIdentityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class TaskFeedbackService {
    private final TaskExecutionRepository executions; private final TaskReviewRepository reviews; private final SafetyReportRepository reports;
    private final TaskRepository tasks; private final lk.uniwork.user.UserRepository users; private final UserIdentityService identities;
    public TaskFeedbackService(TaskExecutionRepository executions, TaskReviewRepository reviews, SafetyReportRepository reports,
            TaskRepository tasks, lk.uniwork.user.UserRepository users, UserIdentityService identities) {
        this.executions=executions; this.reviews=reviews; this.reports=reports; this.tasks=tasks; this.users=users; this.identities=identities;
    }
    @Transactional
    public TaskReviewResponse review(String subject, UUID taskId, TaskReviewRequest request) {
        var user=identities.requireStudent(subject);
        TaskExecution execution=executions.findByTaskIdAndStudentClerkUserId(taskId, subject).orElseThrow(()->notFound("EXECUTION_NOT_FOUND","This task is not assigned to you."));
        var task=tasks.findByIdForUpdate(taskId).orElseThrow(()->notFound("TASK_NOT_FOUND","This task could not be found."));
        if(execution.getCompletedAt()==null) throw conflict("Reviews are available after task completion.");
        if(reviews.existsByTaskId(taskId)) throw conflict("A review has already been submitted for this task.");
        var review=reviews.save(new TaskReview(task,user,request.posterRating(),request.positiveFeedback(),clean(request.reviewText()),clean(request.locationFeedback())));
        return TaskReviewResponse.from(review);
    }
    @Transactional
    public SafetyReportResponse report(String subject, UUID taskId, SafetyReportRequest request) {
        var user=identities.requireStudent(subject);
        var execution=executions.findByTaskIdAndStudentClerkUserId(taskId,subject).orElseThrow(()->notFound("EXECUTION_NOT_FOUND","This task is not assigned to you."));
        var report=reports.save(new SafetyReport(execution.getTask(),user,request.category(),request.description().trim()));
        return SafetyReportResponse.from(report);
    }
    @Transactional(readOnly=true)
    public PageResponse<SafetyReportResponse> reports(String subject,int page,int size) {
        identities.requireStudent(subject);
        return PageResponse.from(reports.findByReporterClerkUserId(subject,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt"))).map(SafetyReportResponse::from));
    }
    private String clean(String value){return value==null||value.isBlank()?null:value.trim();}
    private ApiException conflict(String msg){return new ApiException(HttpStatus.CONFLICT,"INVALID_FEEDBACK_TRANSITION",msg);}
    private ApiException notFound(String code,String msg){return new ApiException(HttpStatus.NOT_FOUND,code,msg);}
}
