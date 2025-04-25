import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Database } from '@/types/database';

type Goal = Database['public']['Tables']['goals']['Row'] & {
  current_amount: number;
};

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoal, setNewGoal] = useState<Omit<Database['public']['Tables']['goals']['Insert'], 'id' | 'created_at' | 'user_id'>>({
    name: '',
    target_amount: 0,
    allocation_percentage: 0,
    deadline: null,
    notes: null
  });

  // Calculate total allocation percentage
  const totalAllocation = useMemo(() => {
    return goals.reduce((sum, goal) => sum + goal.allocation_percentage, 0);
  }, [goals]);

  // Calculate remaining percentage available for new goals
  const remainingPercentage = useMemo(() => {
    return 100 - totalAllocation;
  }, [totalAllocation]);

  // Validate if adding a new goal would exceed 100%
  const validateAllocation = (percentage: number) => {
    return totalAllocation + percentage <= 100;
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('allocation_percentage', { ascending: false });

      if (error) throw error;

      // Calculate current amount for each goal
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
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
          const currentAmount = totalBudget - totalExpenses;

          return {
            ...goal,
            current_amount: Math.min(currentAmount, goal.target_amount)
          };
        })
      );

      setGoals(goalsWithProgress);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('שגיאה בטעינת המטרות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!validateAllocation(newGoal.allocation_percentage)) {
      toast.error('סך כל האחוזים לא יכול לעלות על 100%');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('goals')
        .insert({
          ...newGoal,
          user_id: user.id,
          deadline: newGoal.deadline || null,
          notes: newGoal.notes || null
        });

      if (error) throw error;

      toast.success('המטרה נוצרה בהצלחה');
      setNewGoal({
        name: '',
        target_amount: 0,
        allocation_percentage: 0,
        deadline: null,
        notes: null
      });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('שגיאה ביצירת המטרה');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast.success('המטרה נמחקה בהצלחה');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('שגיאה במחיקת המטרה');
    }
  };

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

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>מטרות כספיות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>מטרות כספיות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Create New Goal Form */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">יצירת מטרה חדשה</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="שם המטרה"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">לדוגמה: חיסכון לדירה, רכישת רכב, חופשה</p>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="סכום היעד"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">הסכום הסופי שאתה רוצה לחסוך</p>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="אחוז חיסכון חודשי"
                  value={newGoal.allocation_percentage}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 && value <= remainingPercentage) {
                      setNewGoal({ ...newGoal, allocation_percentage: value });
                    }
                  }}
                  min={0}
                  max={remainingPercentage}
                />
                <p className="text-xs text-muted-foreground">
                  אחוז מהחיסכון החודשי שיוקצה למטרה זו (נשארו {remainingPercentage}% פנויים)
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="תאריך יעד (אופציונלי)"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value || null })}
                />
                <p className="text-xs text-muted-foreground">התאריך שבו תרצה להשיג את המטרה</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Input
                  placeholder="הערות (אופציונלי)"
                  value={newGoal.notes || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value || null })}
                />
                <p className="text-xs text-muted-foreground">הוסף פרטים נוספים על המטרה שלך</p>
              </div>
            </div>
            <Button onClick={handleCreateGoal} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              צור מטרה
            </Button>
          </div>

          {/* Goals List */}
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.current_amount, goal.target_amount);
              const monthsRemaining = calculateTimeToCompletion(goal);
              
              return (
                <Card key={goal.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{goal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()} ₪
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {goal.allocation_percentage}% מהחיסכון החודשי
                      </p>
                      {goal.deadline && (
                        <p className="text-sm text-muted-foreground">
                          תאריך יעד: {format(new Date(goal.deadline), 'dd/MM/yyyy')}
                        </p>
                      )}
                      {monthsRemaining !== null && (
                        <p className="text-sm text-muted-foreground">
                          נשארו {monthsRemaining} חודשים
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-2" />
                  {progress >= 80 && progress < 100 && (
                    <p className="text-sm text-green-500 mt-2">🎉 הגעת ל-{progress}% מהמטרה!</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 