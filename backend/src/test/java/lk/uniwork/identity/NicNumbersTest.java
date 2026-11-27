package lk.uniwork.identity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class NicNumbersTest {
    @Test void acceptsBothStructuresAndRejectsInvalidDay() {
        assertTrue(NicNumbers.valid("641042757V"));
        assertTrue(NicNumbers.valid("196410402757"));
        assertFalse(NicNumbers.valid("640002757V"));
        assertFalse(NicNumbers.valid("196490002757"));
        assertFalse(NicNumbers.valid("ABC"));
    }
    @Test void comparesOldAndNewWithoutTrustingSuffixAlone() {
        assertTrue(NicNumbers.same("64 104 2757v", "196410402757"));
        assertFalse(NicNumbers.same("641042758V", "196410402757"));
        assertFalse(NicNumbers.same("196410402757", "196410402758"));
    }
}
