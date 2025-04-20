import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Expense } from "@/types/expense";
import { useState } from "react";

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

interface CategoryTrendsChartProps {
  expenses: Expense[];
  selectedMonth: Date;
}

export function CategoryTrendsChart({ expenses, selectedMonth }: CategoryTrendsChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Get the last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(selectedMonth);
    date.setMonth(date.getMonth() - i);
    return date;
  }).reverse();

  // Get all unique categories
  const categories = Array.from(new Set(expenses.map(expense => expense.category)));

  // Prepare data for the chart
  const chartData = months.map(month => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month.getMonth() &&
             expenseDate.getFullYear() === month.getFullYear();
    });

    const categoryTotals = categories.reduce((acc, category) => {
      const categoryExpenses = monthExpenses.filter(expense => expense.category === category);
      const total = categoryExpenses.reduce((sum, expense) => {
        let amount = expense.amount;
        if (expense.currency === "USD") {
          amount *= 3.6;
        } else if (expense.currency === "EUR") {
          amount *= 3.9;
        }
        return sum + amount;
      }, 0);
      acc[category] = Math.round(total);
      return acc;
    }, {} as Record<string, number>);

    return {
      name: format(month, 'MMM yyyy', { locale: he }),
      ...categoryTotals
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₪{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1">
          <span className="text-xl">מגמות הוצאות לפי קטגוריה</span>
          <span className="text-base text-muted-foreground">
            השוואת הוצאות בקטגוריות שונות לאורך זמן
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 20,
              }}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'חודש', 
                  position: 'insideBottom', 
                  offset: -10,
                  fontSize: 12
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: '₪', 
                  angle: -90, 
                  position: 'insideLeft',
                  fontSize: 12
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                onMouseEnter={(data) => setHoveredCategory(data.value)}
                onMouseLeave={() => setHoveredCategory(null)}
                formatter={(value: string) => (
                  <span className={`text-sm ${hoveredCategory === value ? 'font-bold' : ''}`}>
                    {value}
                  </span>
                )}
              />
              {categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={hoveredCategory === category ? 3 : 2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 