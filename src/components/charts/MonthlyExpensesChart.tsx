import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Expense } from "@/types/expense";
import { Wallet } from "lucide-react";

interface MonthlyExpensesChartProps {
  expenses: Expense[];
  selectedMonth: Date;
}

export function MonthlyExpensesChart({ expenses, selectedMonth }: MonthlyExpensesChartProps) {
  // Filter expenses for the selected month
  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth.getMonth() &&
           expenseDate.getFullYear() === selectedMonth.getFullYear();
  });

  // Group expenses by day
  const dailyExpenses = monthExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const day = date.getDate();
    
    if (!acc[day]) {
      acc[day] = 0;
    }
    
    let amount = expense.amount;
    if (expense.currency === "USD") {
      amount *= 3.6;
    } else if (expense.currency === "EUR") {
      amount *= 3.9;
    }
    
    acc[day] += amount;
    return acc;
  }, {} as Record<number, number>);

  // Create data for all days in the month, even if there are no expenses
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: day,
      amount: dailyExpenses[day] || 0
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 rounded-lg border shadow-lg">
          <p className="font-medium text-sm text-muted-foreground">
            {data.date}/{selectedMonth.getMonth() + 1}
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">סכום:</span> ₪{data.amount.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          הוצאות חודשיות
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedMonth, 'MMMM yyyy', { locale: he })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 40,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'תאריך', 
                  position: 'insideBottom', 
                  offset: -15,
                  fontSize: 12,
                  fill: 'hsl(var(--foreground))'
                }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: '₪', 
                  angle: -90, 
                  position: 'insideLeft',
                  fontSize: 12,
                  fill: 'hsl(var(--foreground))'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                className="transition-opacity hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 