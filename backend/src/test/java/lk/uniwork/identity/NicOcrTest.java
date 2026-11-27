package lk.uniwork.identity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class NicOcrTest {
    private String row(String confidence,String text) {
        return "5\t1\t1\t1\t1\t1\t0\t0\t100\t20\t"+confidence+"\t"+text+"\n";
    }
    @Test void acceptsOnlyHighConfidenceStructuredNic() {
        assertEquals(1,NicOcr.candidatesFromTsv(row("92","196410402757")).size());
        assertTrue(NicOcr.candidatesFromTsv(row("41","196410402757")).isEmpty());
        assertTrue(NicOcr.candidatesFromTsv(row("95","196490002757")).isEmpty());
    }
}
