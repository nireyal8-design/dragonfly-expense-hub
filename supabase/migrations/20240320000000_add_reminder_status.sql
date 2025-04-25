-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON reminder_status;

-- Create the reminder_status table
CREATE TABLE IF NOT EXISTS reminder_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the trigger for updating the updated_at column
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON reminder_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reminder_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminder statuses"
    ON reminder_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder statuses"
    ON reminder_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder statuses"
    ON reminder_status FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder statuses"
    ON reminder_status FOR DELETE
    USING (auth.uid() = user_id); 