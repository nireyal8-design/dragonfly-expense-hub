import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceArea 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Expense } from "@/types/expense";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

interface CategoryTrendsChartProps {
  expenses: Expense[];
  selectedMonth: Date;
}

const TooltipContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
      {children}
    </div>
  );
};

export function CategoryTrendsChart({ expenses, selectedMonth }: CategoryTrendsChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Get the last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(selectedMonth);
    date.setMonth(date.getMonth() - i);
    return date;
  }).reverse();

  // Calculate total spending per category across all months
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    // Convert amount to ILS if needed
    let amount = expense.amount;
    if (expense.currency === "USD") {
      amount *= 3.6;
    } else if (expense.currency === "EUR") {
      amount *= 3.9;
    }
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by total spending and get top 10
  const top10Categories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([category]) => category);

  // Prepare data for the chart using only top 10 categories
  const chartData = months.map(month => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month.getMonth() &&
             expenseDate.getFullYear() === month.getFullYear();
    });

    const categoryTotals = top10Categories.reduce((acc, category) => {
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
      // Sort payload by value in descending order
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="absolute left-full ml-4 top-0 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border min-w-[220px]">
          <p className="font-semibold mb-2 text-foreground">{label}</p>
          <div className="space-y-2">
            {sortedPayload.map((entry: any, index: number) => (
              <p 
                key={index} 
                className={`text-sm flex items-center justify-between gap-4 ${
                  hoveredCategory === entry.name ? 'font-bold' : ''
                }`}
              >
                <span 
                  style={{ color: entry.color }}
                  className="flex items-center gap-2"
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}</span>
                </span>
                <span style={{ color: entry.color }}>
                  ₪{entry.value.toLocaleString()}
                </span>
              </p>
            ))}
          </div>
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
            10 הקטגוריות עם ההוצאות הגבוהות ביותר
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px]">
          <div className="absolute inset-0">
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                  tickFormatter={(value) => `₪${value.toLocaleString()}`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1,
                    strokeDasharray: '3 3'
                  }}
                  wrapperStyle={{ zIndex: 50 }}
                  position={{ x: 0, y: 0 }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  onMouseEnter={(data) => setHoveredCategory(data.value)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  formatter={(value: string) => (
                    <span 
                      className={`text-sm transition-all duration-200 ${
                        hoveredCategory === value 
                          ? 'font-bold scale-105 text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {value}
                    </span>
                  )}
                />
                {top10Categories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={hoveredCategory === category ? 3 : 1.5}
                    dot={false}
                    activeDot={{ 
                      r: hoveredCategory === category ? 6 : 4,
                      stroke: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                      fill: 'white'
                    }}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    opacity={hoveredCategory ? (hoveredCategory === category ? 1 : 0.3) : 1}
                    className="transition-all duration-200"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 