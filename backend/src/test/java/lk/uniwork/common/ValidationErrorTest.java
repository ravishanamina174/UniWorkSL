package lk.uniwork.common;

import jakarta.validation.Validation;
import lk.uniwork.task.DirectTaskDtos;
import lk.uniwork.user.StudentCategory;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ValidationErrorTest {
    @Test
    void quoteCoordinatesMustFitSixDecimalPlaces() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var valid = quote(new BigDecimal("6.927078"));
            var invalid = quote(new BigDecimal("6.927078234234"));
            assertTrue(validator.validate(valid).isEmpty());
            assertTrue(validator.validate(invalid).stream().anyMatch(error -> error.getPropertyPath().toString().equals("latitude")));
        }
    }

    @Test
    void validationResponseIdentifiesFieldWithoutReturningSubmittedValue() throws NoSuchMethodException {
        var binding = new BeanPropertyBindingResult(new Object(), "request");
        binding.addError(new FieldError("request", "latitude", "private-value", false,
                null, null, "numeric value out of bounds"));
        var parameter = new MethodParameter(getClass().getDeclaredMethod("example", Object.class), 0);
        var response = new GlobalExceptionHandler().handleValidation(new MethodArgumentNotValidException(parameter, binding));
        assertEquals("numeric value out of bounds", response.getBody().fieldErrors().get("latitude"));
        assertFalse(response.getBody().toString().contains("private-value"));
    }

    private DirectTaskDtos.Create quote(BigDecimal latitude) {
        return new DirectTaskDtos.Create("student", "Help move boxes", Instant.now(),
                new BigDecimal("2500"), "Colombo", latitude, new BigDecimal("79.861243"),
                StudentCategory.MOVING_PACKING);
    }

    @SuppressWarnings("unused")
    private void example(Object request) { }
}
