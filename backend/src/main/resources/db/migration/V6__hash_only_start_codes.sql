ALTER TABLE task_executions DROP CONSTRAINT task_executions_pin_pair;
ALTER TABLE task_executions DROP COLUMN start_pin_ciphertext;
ALTER TABLE task_executions ADD COLUMN start_pin_salt VARCHAR(32);
ALTER TABLE task_executions ADD CONSTRAINT task_executions_pin_pair
    CHECK ((start_pin_hash IS NULL) = (start_pin_salt IS NULL));
