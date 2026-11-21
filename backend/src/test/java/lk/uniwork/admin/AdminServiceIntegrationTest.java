package lk.uniwork.admin;

import lk.uniwork.common.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Run only against a disposable database with UNIWORK_ADMIN_INTEGRATION_TEST=1. */
@SpringBootTest
@Transactional
@EnabledIfEnvironmentVariable(named="UNIWORK_ADMIN_INTEGRATION_TEST", matches="1")
class AdminServiceIntegrationTest {
    @Autowired AdminService admin;
    @Autowired JdbcTemplate db;

    @Test void operationalQueriesAndCaseActionsUseExistingTaskData() {
        UUID poster=UUID.randomUUID(),student=UUID.randomUUID(),task=UUID.randomUUID(),application=UUID.randomUUID(),execution=UUID.randomUUID();
        db.update("insert into uniwork_users(user_id,clerk_user_id,role) values(?,?,'TASK_POSTER')",poster,"test_poster_"+poster);
        db.update("insert into uniwork_users(user_id,clerk_user_id,role) values(?,?,'STUDENT')",student,"test_student_"+student);
        db.update("insert into task_poster_profiles(user_id,full_name,address,phone_number,nic_ciphertext,gender) values(?,'Poster Test','Test address','000','cipher','OTHER')",poster);
        db.update("insert into student_profiles(user_id,full_name,age,gender,address_ciphertext,phone_number,nic_ciphertext,university,faculty) values(?,'Student Test',21,'OTHER','cipher','000','cipher','Uni','Faculty')",student);
        db.update("insert into tasks(task_id,poster_user_id,title,description,amount_lkr,scheduled_at,location_address,latitude,longitude,status) values(?,?,'Garden help','Test work',2500,now()+interval '1 day','Agreed garden',6.927100,79.861200,'STARTED')",task,poster);
        db.update("insert into task_applications(application_id,task_id,student_user_id,status) values(?,?,?,'ACCEPTED')",application,task,student);
        db.update("insert into task_executions(execution_id,task_id,application_id,student_user_id,started_at) values(?,?,?,?,now())",execution,task,application,student);
        db.update("insert into task_reviews(review_id,task_id,student_user_id,poster_rating,positive_feedback,review_text) values(?,?,?,1,false,'Concerning conduct')",UUID.randomUUID(),task,student);

        assertTrue(admin.activeTasks(0,20,"","",null).content().stream().anyMatch(row -> row.taskId().equals(task)));
        assertTrue(admin.overview().ongoingTasks()>=1);
        assertEquals("FLAGGED_FOR_REVIEW",admin.watchCase(poster).item().status());
        assertEquals(1,admin.watchCase(poster).signals().size());
        admin.addNote("admin_test","WATCHLIST",poster,"Review the evidence");
        admin.decide("admin_test","WATCHLIST",poster,"UNDER_INVESTIGATION","Review opened");
        assertEquals("UNDER_INVESTIGATION",admin.watchCase(poster).item().status());

        db.update("update tasks set status='COMPLETED' where task_id=?",task);
        db.update("update task_executions set completed_at=now() where execution_id=?",execution);
        var complaint=admin.fileComplaint("test_student_"+student,task,new AdminDtos.ComplaintRequest(
                AdminDtos.PaymentReason.PAYMENT_NOT_RECEIVED,null,"The agreed amount was not paid."));
        assertEquals(new BigDecimal("2500.00"),complaint.agreedAmountLkr());
        var response=admin.posterResponse("test_poster_"+poster,complaint.disputeId(),new AdminDtos.PosterResponseRequest(false,"Payment remains outstanding."));
        assertEquals("UNDER_REVIEW",response.status());
        admin.decide("admin_test","DISPUTE",complaint.disputeId(),"RESOLVED","Both accounts contacted; outcome documented.");
        assertEquals("RESOLVED",admin.dispute(complaint.disputeId()).item().status());

        admin.restrict("admin_test",poster,new AdminDtos.RestrictionRequest("Investigation underway",Instant.now().plusSeconds(3600)));
        assertThrows(ApiException.class,() -> admin.requireCanPublish(poster));
        db.update("update admin_publishing_restrictions set expires_at=now()-interval '1 minute' where poster_user_id=?",poster);
        assertDoesNotThrow(() -> admin.requireCanPublish(poster));
        admin.removeRestriction("admin_test",poster,"Restriction lifted after review");
        assertDoesNotThrow(() -> admin.requireCanPublish(poster));
        assertTrue(admin.auditEvents(0,20).totalElements()>=5);
    }

    @Test void databaseConstraintRejectsDuplicateComplaintForSameIssue() {
        UUID poster=UUID.randomUUID(),student=UUID.randomUUID(),task=UUID.randomUUID(),application=UUID.randomUUID();
        db.update("insert into uniwork_users(user_id,clerk_user_id,role) values(?,?,'TASK_POSTER')",poster,"test_poster_"+poster);
        db.update("insert into uniwork_users(user_id,clerk_user_id,role) values(?,?,'STUDENT')",student,"test_student_"+student);
        db.update("insert into task_poster_profiles(user_id,full_name,address,phone_number,nic_ciphertext,gender) values(?,'Poster Test','Test address','000','cipher','OTHER')",poster);
        db.update("insert into student_profiles(user_id,full_name,age,gender,address_ciphertext,phone_number,nic_ciphertext,university,faculty) values(?,'Student Test',21,'OTHER','cipher','000','cipher','Uni','Faculty')",student);
        db.update("insert into tasks(task_id,poster_user_id,title,description,amount_lkr,scheduled_at,location_address,latitude,longitude,status) values(?,?,'Garden help','Test work',2500,now()+interval '1 day','Agreed garden',6.927100,79.861200,'COMPLETED')",task,poster);
        db.update("insert into task_applications(application_id,task_id,student_user_id,status) values(?,?,?,'ACCEPTED')",application,task,student);
        db.update("insert into task_executions(execution_id,task_id,application_id,student_user_id,started_at,completed_at) values(?,?,?,?,now(),now())",UUID.randomUUID(),task,application,student);
        db.update("insert into payment_disputes(dispute_id,task_id,student_user_id,reason,student_statement) values(?,?,?,'PAYMENT_NOT_RECEIVED','Existing complaint')",UUID.randomUUID(),task,student);
        var request=new AdminDtos.ComplaintRequest(AdminDtos.PaymentReason.PAYMENT_NOT_RECEIVED,null,"The agreed amount was not paid.");
        assertEquals("PAYMENT_DISPUTE_EXISTS",assertThrows(ApiException.class,
                () -> admin.fileComplaint("test_student_"+student,task,request)).getCode());
    }
}
