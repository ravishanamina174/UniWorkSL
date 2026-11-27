package lk.uniwork.identity;

import lk.uniwork.common.ApiException;
import lk.uniwork.user.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SuppressWarnings({"unchecked", "rawtypes"})
class IdentityVerificationServiceTest {
    private final JdbcTemplate db=mock(JdbcTemplate.class);
    private final UserIdentityService identities=mock(UserIdentityService.class);
    private final StudentProfileRepository students=mock(StudentProfileRepository.class);
    private final TaskPosterProfileRepository posters=mock(TaskPosterProfileRepository.class);
    private final PiiEncryptionService encryption=mock(PiiEncryptionService.class);
    private final IdentityDocument documents=mock(IdentityDocument.class);
    private final NicOcr ocr=mock(NicOcr.class);
    private final R2IdentityStorage storage=mock(R2IdentityStorage.class);
    private final IdentityCleanupService cleanup=mock(IdentityCleanupService.class);
    private final IdentityVerificationService service=new IdentityVerificationService(db,identities,students,posters,encryption,documents,ocr,storage,cleanup,30);
    private final UniWorkUser student=new UniWorkUser("student",UserRole.STUDENT);
    private final MockMultipartFile upload=new MockMultipartFile("image","nic.jpg","image/jpeg",new byte[]{1});

    @BeforeEach void profile() {
        when(identities.requireStudent("student")).thenReturn(student);
        when(students.findById(student.getId())).thenReturn(Optional.of(new StudentProfile(student,"Student Name",(short)22,
                Gender.OTHER,"address","+94770000000","nic","University","Faculty")));
        when(encryption.decrypt("nic")).thenReturn("196410402V");
        when(documents.read(upload)).thenReturn(new IdentityDocument.Image(new byte[]{1,2,3},"image/jpeg"));
        when(db.queryForList(startsWith("select status from identity_verifications"),eq(String.class),eq(student.getId())))
                .thenReturn(List.of("UNVERIFIED"));
        when(db.query(startsWith("select status,method"),any(RowMapper.class),eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("UNVERIFIED",null,0,null,false,null)));
    }

    @Test void successfulOcrMatchRequiresExtractedNumberAndDoesNotStoreImage() {
        when(ocr.extract(any(byte[].class))).thenReturn(Set.of("196410402V"));
        assertEquals("MATCHED",service.match("student",UserRole.STUDENT,upload).outcome());
        verify(db).update(startsWith("update identity_verifications set status='VERIFIED'"),eq(student.getId()));
        verifyNoInteractions(storage);
    }

    @Test void mismatchedAndUnreadableImagesCountAsUnsuccessfulWithoutVerification() {
        when(ocr.extract(any(byte[].class))).thenReturn(Set.of("196410403V"),Set.of());
        assertEquals("NOT_MATCHED",service.match("student",UserRole.STUDENT,upload).outcome());
        assertEquals("UNREADABLE",service.match("student",UserRole.STUDENT,upload).outcome());
        verify(db,times(2)).update(startsWith("update identity_verifications set unsuccessful_attempts="),eq(student.getId()));
        verify(db,never()).update(startsWith("update identity_verifications set status='VERIFIED'"),eq(student.getId()));
    }

    @Test void missingOcrDoesNotConsumeAttempt() {
        when(ocr.extract(any(byte[].class))).thenThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"OCR_UNAVAILABLE","Try later"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,assertThrows(ApiException.class,()->service.match("student",UserRole.STUDENT,upload)).getStatus());
        verify(db,never()).update(startsWith("update identity_verifications set unsuccessful_attempts="),eq(student.getId()));
    }

    @Test void incompleteProfileBlocksVerificationBeforeImageProcessing() {
        when(students.findById(student.getId())).thenReturn(Optional.empty());
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,()->service.match("student",UserRole.STUDENT,upload)).getStatus());
        verifyNoInteractions(documents,ocr,storage);
    }

    @Test void manualReviewRequiresTwoFailuresAndStorageFailureLeavesNoPendingState() {
        assertEquals(HttpStatus.FORBIDDEN,assertThrows(ApiException.class,()->service.submitReview("student",UserRole.STUDENT,upload)).getStatus());
        when(db.query(startsWith("select status,method"),any(RowMapper.class),eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("UNVERIFIED",null,2,null,true,null)));
        doThrow(new IllegalStateException("R2 unavailable")).when(storage).put(anyString(),any(byte[].class));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,assertThrows(ApiException.class,()->service.submitReview("student",UserRole.STUDENT,upload)).getStatus());
        verify(db,never()).update(startsWith("insert into identity_reviews"),any(),any(),any(),any());
    }

    @Test void matchedNicCannotBeChangedThroughAProfileUpdate() {
        when(db.query(startsWith("select status,method"),any(RowMapper.class),eq(student.getId())))
                .thenReturn(List.of(new IdentityVerificationService.State("VERIFIED","AUTOMATIC_OCR",0,null,false,null)));
        assertEquals(HttpStatus.CONFLICT,assertThrows(ApiException.class,
                ()->service.requireNicUnchanged(student.getId(),"196410402V","196410403V")).getStatus());
        assertDoesNotThrow(()->service.requireNicUnchanged(student.getId(),"196410402V","196 410 402v"));
    }
}
