package lk.uniwork.task;

import java.time.Instant;
import java.util.UUID;

public record TaskApplicationResponse(UUID applicationId, UUID taskId, String taskTitle,
                                      TaskApplicationStatus status, Instant submittedAt) {
    static TaskApplicationResponse from(TaskApplication application) {
        return new TaskApplicationResponse(application.getId(), application.getTask().getId(), application.getTask().getTitle(),
                application.getStatus(), application.getCreatedAt());
    }
}
