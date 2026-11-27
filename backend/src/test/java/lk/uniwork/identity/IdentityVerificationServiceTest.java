package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SuppressWarnings({"unchecked", "rawtypes"})
class IdentityVerificationServiceTest {
    private final JdbcTemplate db = mock(JdbcTemplate.class);
    private final UserIdentityService identities = mock(UserIdentityService.class);
    private final StudentProfileRepository students = mock(StudentProfileRepository.class);
    private final TaskPosterProfileRepository posters = mock(TaskPosterProfileRepository.class);
    private final PiiEncryptionService encryption = mock(PiiEncryptionService.class);
    private final IdentityDocument documents = mock(IdentityDocument.class);
    private final R2IdentityStorage storage = mock(R2IdentityStorage.class);
    private final IdentityCleanupService cleanup = mock(IdentityCleanupService.class);
    private final IdentityVerificationService service = new IdentityVerificationService(
            db, identities, students, posters, encryption, documents, storage, cleanup, 30);
    private final UniWorkUser student = new UniWorkUser("student", UserRole.STUDENT);
    private final MockMultipartFile upload = new MockMultipartFile("image", "nic.jpg", "image/jpeg", new byte[]{1});

    @BeforeEach
    void profile() {
        TransactionSynchronizationManager.initSynchronization();
        when(identities.requireStudent("student")).thenReturn(student);
        when(students.findById(student.getId())).thenReturn(Optional.of(new StudentProfile(student, "Student Name", (short) 22,
                Gender.OTHER, "address", "+94770000000", "nic", "University", "Faculty")));
        when(encryption.decrypt("nic")).thenReturn("196410402V");
        when(documents.read(upload)).thenReturn(new IdentityDocument.Image(new byte[]{1, 2, 3}, "image/jpeg"));
        when(db.queryForList(startsWith("select status from identity_verifications"), eq(String.class), eq(student.getId())))
                .thenReturn(List.of("UNVERIFIED"));
        when(db.query(startsWith("select status,method"), any(RowMapper.class), eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("UNVERIFIED", null, null, null, null)));
    }

    @AfterEach
    void clearTransactionSynchronization() {
        TransactionSynchronizationManager.clearSynchronization();
    }

    @Test
    void manualSubmissionStoresPrivateImageAndCreatesPendingReview() {
        when(db.query(startsWith("select status,method"), any(RowMapper.class), eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("UNVERIFIED", null, null, null, null)))
                .thenReturn(List.of(new IdentityVerificationService.State("MANUAL_REVIEW_PENDING", "MANUAL_REVIEW", null, "PENDING", null)));
        IdentityVerificationService.State result = service.submitReview("student", UserRole.STUDENT, upload);
        assertEquals("MANUAL_REVIEW_PENDING", result.status());
        verify(storage).put(startsWith("nic-reviews/"), any(byte[].class));
        verify(db).update(startsWith("insert into identity_reviews"), any(), eq(student.getId()), any(), any());
        verify(db).update(contains("status='MANUAL_REVIEW_PENDING'"), eq(student.getId()));
    }

    @Test
    void incompleteProfileBlocksSubmissionBeforeImageProcessing() {
        when(students.findById(student.getId())).thenReturn(Optional.empty());
        assertEquals(409, assertThrows(ApiException.class,
                () -> service.submitReview("student", UserRole.STUDENT, upload)).getStatus().value());
        verifyNoInteractions(documents, storage);
    }

    @Test
    void pendingAndApprovedUsersCannotSubmitAgain() {
        when(db.query(startsWith("select status,method"), any(RowMapper.class), eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("MANUAL_REVIEW_PENDING", "MANUAL_REVIEW", null, "PENDING", null)));
        assertEquals(409, assertThrows(ApiException.class,
                () -> service.submitReview("student", UserRole.STUDENT, upload)).getStatus().value());
        when(db.query(startsWith("select status,method"), any(RowMapper.class), eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("VERIFIED", "MANUAL_REVIEW", null, "APPROVED", null)));
        assertEquals(409, assertThrows(ApiException.class,
                () -> service.submitReview("student", UserRole.STUDENT, upload)).getStatus().value());
    }

    @Test
    void storageFailureDoesNotCreatePendingReview() {
        doThrow(new IllegalStateException("R2 unavailable")).when(storage).put(anyString(), any(byte[].class));
        assertEquals(503, assertThrows(ApiException.class,
                () -> service.submitReview("student", UserRole.STUDENT, upload)).getStatus().value());
        verify(db, never()).update(startsWith("insert into identity_reviews"), any(), any(), any(), any());
    }

    @Test
    void nicCannotChangeWhileVerifiedOrPending() {
        when(db.query(startsWith("select status,method"), any(RowMapper.class), eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("VERIFIED", "MANUAL_REVIEW", null, "APPROVED", null)));
        assertEquals(409, assertThrows(ApiException.class,
                () -> service.requireNicUnchanged(student.getId(), "196410402V", "196410403V")).getStatus().value());
        assertDoesNotThrow(() -> service.requireNicUnchanged(student.getId(), "196410402V", "196 410 402v"));
    }
}
