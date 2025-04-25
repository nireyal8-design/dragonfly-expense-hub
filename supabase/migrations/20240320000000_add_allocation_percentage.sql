-- Add allocation_percentage column
ALTER TABLE goals ADD COLUMN allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00;

-- Update existing goals to have allocation_percentage based on priority
UPDATE goals 
SET allocation_percentage = 
  CASE 
    WHEN priority = 1 THEN 50.00
    WHEN priority = 2 THEN 35.00
    WHEN priority = 3 THEN 15.00
    ELSE 50.00
  END;

-- Remove priority column
ALTER TABLE goals DROP COLUMN priority; 