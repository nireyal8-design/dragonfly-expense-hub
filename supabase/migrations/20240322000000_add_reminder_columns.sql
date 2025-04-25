-- Add reminder-related columns to expenses table
ALTER TABLE expenses
  ADD COLUMN has_reminder BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN reminder_days_before INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN reminder_notification BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN reminder_email BOOLEAN NOT NULL DEFAULT FALSE;

-- Add a check constraint to ensure reminder_days_before is non-negative
ALTER TABLE expenses
  ADD CONSTRAINT check_reminder_days_before
  CHECK (reminder_days_before >= 0); 