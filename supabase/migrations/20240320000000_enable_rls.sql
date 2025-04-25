-- Enable RLS on monthly_budgets table
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;

-- Create policy for monthly_budgets
CREATE POLICY "Users can view their own monthly budgets"
ON public.monthly_budgets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly budgets"
ON public.monthly_budgets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly budgets"
ON public.monthly_budgets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly budgets"
ON public.monthly_budgets
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on recurring_expenses table
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for recurring_expenses
CREATE POLICY "Users can view their own recurring expenses"
ON public.recurring_expenses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring expenses"
ON public.recurring_expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses"
ON public.recurring_expenses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses"
ON public.recurring_expenses
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users table
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Note: We don't create a delete policy for users as we don't want users to delete their profiles 