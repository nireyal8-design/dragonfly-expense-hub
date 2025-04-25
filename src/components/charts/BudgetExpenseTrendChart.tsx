import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface MonthlyData {
  month: string;
  budget: number;
  expenses: number;
}

export function BudgetExpenseTrendChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch monthly budgets
      const { data: budgets } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id);

      if (!budgets || !expenses) return;

      // Process data
      const processedData = budgets.map(budget => {
        const monthKey = `${budget.year}-${budget.month}`;
        const monthExpenses = expenses
          .filter(expense => {
            const date = new Date(expense.date);
            return date.getFullYear() === budget.year && 
                   date.getMonth() + 1 === budget.month;
          })
          .reduce((sum, exp) => sum + exp.amount, 0);

        return {
          month: format(new Date(budget.year, budget.month - 1), 'MMM yyyy', { locale: he }),
          budget: budget.budget,
          expenses: monthExpenses
        };
      });

      setMonthlyData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>מגמת תקציב והוצאות</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>מגמת תקציב והוצאות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `${value.toLocaleString()} ₪`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} ₪`, '']}
                labelFormatter={(label) => `חודש: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="budget" 
                name="תקציב" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="הוצאות" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 