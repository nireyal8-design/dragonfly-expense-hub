import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MonthlyBreakdown {
  month: string;
  budget: number;
  expenses: number;
  savings: number;
  allocatedSavings: Record<string, number>; // Map of goal ID to allocated savings
}

interface Goal {
  id: string;
  name: string;
  allocation_percentage: number;
}

export function SavingsBreakdown() {
  const [breakdown, setBreakdown] = useState<MonthlyBreakdown[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBreakdown();
  }, []);

  const fetchBreakdown = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, name, allocation_percentage')
        .eq('user_id', user.id)
        .order('allocation_percentage', { ascending: false });

      if (goalsData) {
        setGoals(goalsData);
      }

      // Get monthly budgets
      const { data: monthlyBudgets } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      // Get expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id);

      if (!monthlyBudgets || !expenses) return;

      // Group expenses by month
      const expensesByMonth = expenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[key] = (acc[key] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      // Calculate breakdown for each month
      const monthlyBreakdown = monthlyBudgets.map(budget => {
        const key = `${budget.year}-${budget.month}`;
        const monthExpenses = expensesByMonth[key] || 0;
        const savings = budget.budget - monthExpenses;

        // Calculate allocated savings for each goal
        const allocatedSavings: Record<string, number> = {};
        if (savings > 0 && goalsData) {
          goalsData.forEach(goal => {
            allocatedSavings[goal.id] = savings * (goal.allocation_percentage / 100);
          });
        }

        return {
          month: format(new Date(budget.year, budget.month - 1), 'MMMM yyyy', { locale: he }),
          budget: budget.budget,
          expenses: monthExpenses,
          savings: savings,
          allocatedSavings: allocatedSavings
        };
      });

      setBreakdown(monthlyBreakdown);
    } catch (error) {
      console.error('Error fetching breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פירוט חיסכון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>פירוט חיסכון</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">חודש</th>
                    <th className="text-right p-2">תקציב</th>
                    <th className="text-right p-2">הוצאות</th>
                    <th className="text-right p-2">חיסכון</th>
                    {goals.map(goal => (
                      <th key={goal.id} className="text-right p-2">
                        {goal.name} ({goal.allocation_percentage}%)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((month, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{month.month}</td>
                      <td className="p-2">{month.budget.toLocaleString()} ₪</td>
                      <td className="p-2">{month.expenses.toLocaleString()} ₪</td>
                      <td className="p-2">{month.savings.toLocaleString()} ₪</td>
                      {goals.map(goal => (
                        <td key={goal.id} className="p-2">
                          {month.allocatedSavings[goal.id]?.toLocaleString() || '0'} ₪
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
} 