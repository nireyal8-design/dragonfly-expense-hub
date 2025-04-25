import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Database } from '@/types/supabase';
import { useMemo } from 'react';

type Goal = Database['public']['Tables']['goals']['Row'] & {
  current_amount: number;
};

interface GoalsStatusProps {
  goals: Goal[];
}

export function GoalsStatus({ goals }: GoalsStatusProps) {
  // Sort goals by allocation percentage (descending, so highest percentage first)
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => b.allocation_percentage - a.allocation_percentage);
  }, [goals]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateTimeToCompletion = (goal: Goal) => {
    if (!goal.deadline) return null;
    
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const monthsRemaining = Math.ceil(
      (deadline.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    
    return monthsRemaining;
  };

  const getPriorityColor = (percentage: number) => {
    if (percentage >= 50) return 'text-red-500';
    if (percentage >= 30) return 'text-orange-500';
    if (percentage >= 10) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getPriorityLabel = (percentage: number) => {
    if (percentage >= 50) return 'חיסכון משמעותי';
    if (percentage >= 30) return 'חיסכון בינוני';
    if (percentage >= 10) return 'חיסכון נמוך';
    return 'חיסכון מינימלי';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>מצב המטרות</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedGoals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const monthsRemaining = calculateTimeToCompletion(goal);
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{goal.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={getPriorityColor(goal.allocation_percentage)}>
                        {getPriorityLabel(goal.allocation_percentage)}
                      </span>
                      {goal.deadline && (
                        <span>
                          תאריך יעד: {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: he })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()} ₪
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {progress}% מהמטרה
                    </div>
                  </div>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                {monthsRemaining !== null && (
                  <div className="text-sm text-muted-foreground">
                    נשארו {monthsRemaining} חודשים להשלמת המטרה
                  </div>
                )}
                
                {goal.notes && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {goal.notes}
                  </div>
                )}
              </div>
            );
          })}
          
          {sortedGoals.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              אין מטרות להצגה. הוסף מטרות חדשות בהגדרות.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 