package lk.uniwork.task;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocationServiceTest {
    private final LocationService service = new LocationService();
    @Test void identicalPointsHaveZeroDistance() { assertEquals(0, service.distanceMeters(6.9271,79.8612,6.9271,79.8612), 0.001); }
    @Test void calculatesShortGeographicDistancesInMeters() {
        double distance=service.distanceMeters(6.9271,79.8612,6.9271,79.8622);
        assertTrue(distance > 100 && distance < 115, "one thousandth of a degree of longitude near Colombo is about 110 meters");
    }
}
