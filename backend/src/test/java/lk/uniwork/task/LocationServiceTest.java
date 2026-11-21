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

    @Test void calculatesTheShortPathAcrossTheInternationalDateLine() {
        double distance = service.distanceMeters(0, 179.999, 0, -179.999);
        assertTrue(distance > 200 && distance < 230,
                "two thousandths of a degree across the date line should be about 222 metres, not nearly Earth's circumference");
    }

    @Test void isSymmetricForDistinctCoordinates() {
        double outbound = service.distanceMeters(6.9271, 79.8612, 7.2906, 80.6337);
        double returnTrip = service.distanceMeters(7.2906, 80.6337, 6.9271, 79.8612);
        assertEquals(outbound, returnTrip, 0.000001);
        assertTrue(outbound > 80_000 && outbound < 100_000, "Colombo to Kandy is roughly 95 km as the crow flies");
    }
}
