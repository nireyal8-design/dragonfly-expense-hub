import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface TopExpensesChartProps {
  expenses: Expense[];
  selectedMonth: number | null;
  selectedYear: number;
}

interface TopExpense {
  name: string;
  amount: number;
  category?: string;
  month?: number;
}

export function TopExpensesChart({ expenses, selectedMonth, selectedYear }: TopExpensesChartProps) {
  const hebrewMonths = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];

  const getTopExpenses = (): TopExpense[] => {
    if (selectedMonth === null) {
      // Show top 3 expenses for each month
      const monthlyTopExpenses: TopExpense[] = [];
      
      for (let month = 0; month < 12; month++) {
        const monthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === month && 
                 expenseDate.getFullYear() === selectedYear;
        });

        const sortedExpenses = monthExpenses
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);

        monthlyTopExpenses.push(...sortedExpenses.map(expense => ({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          month: month
        })));
      }

      return monthlyTopExpenses;
    } else {
      // Show top 5 expenses for selected month
      return expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === selectedMonth && 
                 expenseDate.getFullYear() === selectedYear;
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(expense => ({
          name: expense.name,
          amount: expense.amount,
          category: expense.category
        }));
    }
  };

  const topExpenses = getTopExpenses();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-bold">{data.name}</p>
        <p>{`סכום: ${data.amount.toLocaleString()} ₪`}</p>
        {data.category && <p>{`קטגוריה: ${data.category}`}</p>}
        {data.month !== undefined && (
          <p>{`חודש: ${hebrewMonths[data.month]}`}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>
          {selectedMonth === null 
            ? "הוצאות מובילות לפי חודש" 
            : `הוצאות מובילות - ${hebrewMonths[selectedMonth]} ${selectedYear}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {topExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExpenses} dir="rtl">
                <XAxis 
                  dataKey="name"
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              אין הוצאות להצגה בתקופה זו
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 