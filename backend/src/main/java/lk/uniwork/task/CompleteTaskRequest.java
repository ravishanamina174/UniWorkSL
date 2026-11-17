package lk.uniwork.task;
import jakarta.validation.constraints.NotNull;
public record CompleteTaskRequest(@NotNull Boolean paymentReceived) { }
