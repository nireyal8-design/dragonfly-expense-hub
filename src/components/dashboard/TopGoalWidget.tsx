import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  allocation_percentage: number;
};

export function TopGoalWidget() {
  const [topGoal, setTopGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopGoal();
  }, []);

  const fetchTopGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the goal with highest allocation percentage
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('allocation_percentage', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!goals?.length) {
        setIsLoading(false);
        return;
      }

      const goal = goals[0];

      // Calculate current amount
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', goal.created_at);

      const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const monthlyBudget = 5000; // This should come from your monthly_budgets table
      const monthsSinceCreation = Math.ceil(
        (new Date().getTime() - new Date(goal.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      const totalBudget = monthlyBudget * monthsSinceCreation;
      const currentAmount = Math.min(totalBudget - totalExpenses, goal.target_amount);

      setTopGoal({
        ...goal,
        current_amount: currentAmount
      });
    } catch (error) {
      console.error('Error fetching top goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>מטרה עיקרית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topGoal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>מטרה עיקרית</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">אין מטרות להצגה</p>
        </CardContent>
      </Card>
    );
  }

  const progress = Math.min(Math.round((topGoal.current_amount / topGoal.target_amount) * 100), 100);
  const monthsRemaining = topGoal.deadline
    ? Math.ceil(
        (new Date(topGoal.deadline).getTime() - new Date().getTime()) / (30 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{topGoal.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {topGoal.current_amount.toLocaleString()} / {topGoal.target_amount.toLocaleString()} ₪
            </p>
            <Progress value={progress} className="mt-2" />
          </div>
          <p className="text-sm text-muted-foreground">
            {topGoal.allocation_percentage}% מהחיסכון החודשי
          </p>
          {topGoal.deadline && (
            <p className="text-sm text-muted-foreground">
              תאריך יעד: {format(new Date(topGoal.deadline), 'dd/MM/yyyy')}
              {monthsRemaining !== null && ` (נשארו ${monthsRemaining} חודשים)`}
            </p>
          )}
          {progress >= 80 && progress < 100 && (
            <p className="text-sm text-green-500">🎉 הגעת ל-{progress}% מהמטרה!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 