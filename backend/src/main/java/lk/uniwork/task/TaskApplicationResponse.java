package lk.uniwork.task;

import java.time.Instant;
import java.util.UUID;

public record TaskApplicationResponse(UUID applicationId, UUID taskId, String taskTitle,
                                      TaskApplicationStatus status, Instant submittedAt,
                                      String studentName, String university, String faculty) {
    static TaskApplicationResponse from(TaskApplication application, lk.uniwork.user.StudentProfile profile) {
        return new TaskApplicationResponse(application.getId(), application.getTask().getId(), application.getTask().getTitle(),
                application.getStatus(), application.getCreatedAt(), profile.getFullName(), profile.getUniversity(), profile.getFaculty());
    }
    static TaskApplicationResponse from(TaskApplication application) {
        return new TaskApplicationResponse(application.getId(), application.getTask().getId(), application.getTask().getTitle(),
                application.getStatus(), application.getCreatedAt(), null, null, null);
    }
}
