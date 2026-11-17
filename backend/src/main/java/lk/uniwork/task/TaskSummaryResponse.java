package lk.uniwork.task;

public record TaskSummaryResponse(long totalPosted, long published, long accepted, long ongoing, long completed, long pendingApplications) { }
