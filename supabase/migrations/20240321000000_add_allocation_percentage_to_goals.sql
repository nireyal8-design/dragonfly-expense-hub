-- Add allocation_percentage column and remove priority column
ALTER TABLE public.goals
  ADD COLUMN allocation_percentage DECIMAL NOT NULL DEFAULT 0,
  DROP COLUMN priority;

-- Update the index to use allocation_percentage instead of priority
DROP INDEX IF EXISTS goals_priority_idx;
CREATE INDEX IF NOT EXISTS goals_allocation_percentage_idx ON public.goals(allocation_percentage);

-- Add a check constraint to ensure total allocation doesn't exceed 100%
ALTER TABLE public.goals
  ADD CONSTRAINT check_allocation_percentage
  CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100); 