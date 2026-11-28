package lk.uniwork.common;

import java.time.Instant;
import java.util.Map;

public record ApiError(int status, String code, String message, Instant timestamp, Map<String, String> fieldErrors) {
    public ApiError(int status, String code, String message, Instant timestamp) {
        this(status, code, message, timestamp, Map.of());
    }
}
