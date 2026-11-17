package lk.uniwork.common;

import java.time.Instant;

public record ApiError(int status, String code, String message, Instant timestamp) { }
