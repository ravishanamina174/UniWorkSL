ALTER TABLE task_executions
    ADD CONSTRAINT task_executions_pin_result_check
    CHECK (pin_last_result IS NULL OR pin_last_result IN ('INVALID', 'VERIFIED'));
