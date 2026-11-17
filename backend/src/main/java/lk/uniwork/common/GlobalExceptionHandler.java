package lk.uniwork.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiError> handleInvalidArgument(MethodArgumentTypeMismatchException exception) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", "A request value has an invalid format.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "One or more request fields are invalid.");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpectedError(Exception exception) {
        if (exception instanceof ErrorResponse errorResponse) {
            HttpStatusCode status = errorResponse.getStatusCode();
            return ResponseEntity.status(status).body(new ApiError(status.value(), "REQUEST_FAILED",
                    "The request could not be completed.", Instant.now()));
        }
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred.");
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), code, message, Instant.now()));
    }
}
