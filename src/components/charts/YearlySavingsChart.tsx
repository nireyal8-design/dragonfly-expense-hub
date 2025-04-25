import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { PiggyBank } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';

interface YearlySavingsChartProps {
  expenses: any[];
  monthlyBudget: number;
  selectedMonth: Date;
}

interface MonthlyBudget {
  month: number;
  year: number;
  budget: number;
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function YearlySavingsChart({ expenses, monthlyBudget, selectedMonth }: YearlySavingsChartProps) {
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);

  useEffect(() => {
    const fetchMonthlyBudgets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', selectedMonth.getFullYear());

      if (error) {
        console.error('Error fetching monthly budgets:', error);
        return;
      }

      setMonthlyBudgets(data || []);
    };

    fetchMonthlyBudgets();
  }, [selectedMonth, monthlyBudget]);

  // Calculate savings for each month up to the current month
  const getMonthlySavings = () => {
    const monthlyData = [];
    const currentYear = selectedMonth.getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Find the last month that has expenses
    const lastMonthWithExpenses = expenses.reduce((lastMonth, expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === currentYear) {
        return Math.max(lastMonth, expenseDate.getMonth());
      }
      return lastMonth;
    }, -1);
    
    // Use the earlier of current month or last month with expenses
    const monthsToShow = Math.min(currentMonth, lastMonthWithExpenses) + 1;
    
    for (let month = 0; month < monthsToShow; month++) {
      const monthDate = new Date(currentYear, month, 1);
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && 
               expenseDate.getFullYear() === currentYear;
      });
      
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Find the budget for this specific month
      const monthBudget = monthlyBudgets.find(
        b => b.month === month + 1 && b.year === currentYear
      )?.budget || (month === currentMonth ? monthlyBudget : 0); // Only use fallback for current month
      
      const savings = monthBudget - totalExpenses;
      
      monthlyData.push({
        month: format(monthDate, 'MMM', { locale: he }),
        savings: savings, // Use actual savings value (can be negative)
        totalExpenses,
        monthlyBudget: monthBudget,
        fill: savings >= 0 ? '#22c55e' : '#ef4444'
      });
    }
    
    return monthlyData;
  };

  const data = getMonthlySavings();
  const maxSavings = Math.max(...data.map(d => Math.abs(d.savings)));
  const domain = [-maxSavings, maxSavings];

  // Calculate total savings for the year
  const totalYearlySavings = data.reduce((sum, month) => sum + month.savings, 0);
  const isPositiveSavings = totalYearlySavings >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 rounded-lg border shadow-lg">
          <p className="font-medium text-sm text-muted-foreground">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">תקציב:</span> ₪{data.monthlyBudget.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">הוצאות:</span> ₪{data.totalExpenses.toLocaleString()}
            </p>
            <p className={`text-sm font-medium ${data.savings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-muted-foreground">{data.savings >= 0 ? 'חיסכון' : 'גירעון'}:</span> ₪{Math.abs(data.savings).toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <PiggyBank className="h-6 w-6 text-primary" />
          חיסכון שנתי {selectedMonth.getFullYear()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              margin={{ left: 50, right: 30, top: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2} 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `₪${Math.abs(value).toLocaleString()}`}
                width={80}
                domain={domain}
                label={{ 
                  value: 'חיסכון בש״ח', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -35,
                  style: { 
                    fill: 'hsl(var(--foreground))',
                    fontSize: 12
                  }
                }}
              />
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--border))" 
                strokeWidth={2}
                strokeOpacity={0.8}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              />
              <Bar
                dataKey="savings"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                data={data}
                shape={(props) => {
                  const { x, y, width, height, savings } = props;
                  const isNegative = savings < 0;
                  return (
                    <rect
                      x={x}
                      y={isNegative ? y + height : y}
                      width={width}
                      height={Math.abs(height)}
                      fill={`url(#${isNegative ? 'negativeGradient' : 'positiveGradient'})`}
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      rx={6}
                      ry={6}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center p-5 bg-muted/30 rounded-xl border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isPositiveSavings ? 'bg-green-100' : 'bg-red-100'}`}>
              <PiggyBank className={`h-6 w-6 ${isPositiveSavings ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">סה״כ חיסכון שנתי</p>
              <p className={`text-2xl font-bold ${isPositiveSavings ? 'text-green-600' : 'text-red-600'}`}>
                ₪{Math.abs(totalYearlySavings).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 