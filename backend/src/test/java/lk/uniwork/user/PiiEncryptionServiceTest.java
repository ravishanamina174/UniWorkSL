package lk.uniwork.user;

import lk.uniwork.common.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PiiEncryptionServiceTest {
    @Test
    void protectsNicWithAuthenticatedEncryption() {
        var encryption = new PiiEncryptionService(Base64.getEncoder().encodeToString(new byte[32]));
        String ciphertext = encryption.encrypt("123456789V");
        assertNotEquals("123456789V", ciphertext);
        assertEquals("123456789V", encryption.decrypt(ciphertext));
        assertNotEquals(ciphertext, encryption.encrypt("123456789V"));
    }

    @Test
    void refusesToPersistPiiWhenEncryptionKeyIsMissing() {
        var encryption = new PiiEncryptionService("");
        ApiException error = assertThrows(ApiException.class, () -> encryption.encrypt("123456789V"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatus());
    }
}
