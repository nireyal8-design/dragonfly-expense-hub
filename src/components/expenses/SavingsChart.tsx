import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Expense } from "@/types/expense";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { convertToILS } from '@/utils/currency';
import { CardContent } from "@/components/ui/card";

interface MonthlyBudget {
  year: number;
  month: number;
  budget: number;
}

interface SavingsChartProps {
  expenses: Expense[];
  monthlyBudgets: MonthlyBudget[];
  selectedYear: number;
}

interface ChartData {
  name: string;
  month: number;
  savings: number;
  budget: number;
  expenses: number;
  savingsPercentage: number;
  color: string;
}

const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

// Custom bar component for dynamic color
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isNegative = payload.savings < 0;

  return (
    <rect
      x={x}
      y={isNegative ? y + height : y}
      width={width}
      height={Math.abs(height)}
      fill={isNegative ? '#ef4444' : '#22c55e'}
      rx={10}
      ry={10}
    />
  );
};

export const SavingsChart = ({ expenses, monthlyBudgets, selectedYear }: SavingsChartProps) => {
  const [convertedData, setConvertedData] = useState<ChartData[]>([]);

  useEffect(() => {
    let isMounted = true;

    const convertAndUpdateData = async () => {
      const data: ChartData[] = hebrewMonths.map((month, index) => ({
        name: month,
        month: index,
        savings: 0,
        budget: 0,
        expenses: 0,
        savingsPercentage: 0,
        color: '#22c55e'
      }));

      // Add budgets
      monthlyBudgets.forEach(budget => {
        if (budget.year === selectedYear) {
          data[budget.month].budget = budget.budget;
        }
      });

      // Convert expenses
      await Promise.all(expenses.map(async expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getFullYear() === selectedYear) {
          const month = expenseDate.getMonth();
          const amount = await convertToILS(expense.amount, expense.currency || 'ILS');
          data[month].expenses += amount;
          console.log(`Converted ${expense.amount} ${expense.currency} to ${amount} ILS`);
        }
      }));

      // Calculate savings and color
      data.forEach(monthData => {
        monthData.savings = monthData.budget - monthData.expenses;
        monthData.savingsPercentage = monthData.budget > 0 
          ? (monthData.savings / monthData.budget) * 100 
          : 0;
        monthData.color = monthData.savings >= 0 ? '#22c55e' : '#ef4444';
      });

      if (isMounted) {
        console.log("Updated chart data:", data);
        setConvertedData(data);
      }
    };

    convertAndUpdateData();

    return () => {
      isMounted = false;
    };
  }, [expenses, monthlyBudgets, selectedYear]);

  const domain = useMemo(() => {
    const values = convertedData.map(d => d.savings);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(Math.abs(min), Math.abs(max)) * 0.1;
    return [min - padding, max + padding] as [number, number];
  }, [convertedData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          ניתוח חסכונות חודשי - {selectedYear}
        </h2>
      </div>

      <CardContent className="p-6 shadow-md rounded-2xl bg-white">
        <div className="w-full" style={{ height: '800px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={convertedData}
              margin={{ top: 30, right: 40, left: 50, bottom: 40 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'חודש', 
                  position: 'insideBottom', 
                  offset: -25,
                  fontSize: 16,
                  fill: 'hsl(var(--foreground))'
                }}
                padding={{ left: 15, right: 15 }}
              />
              <YAxis 
                tick={{ fontSize: 14, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: '₪', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -25,
                  fontSize: 16,
                  fill: 'hsl(var(--foreground))'
                }}
                tickFormatter={(value) => `₪${value.toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 text-sm space-y-1">
                        <p className="font-bold text-lg">{label}</p>
                        <p className="text-base">תקציב: ₪{data.budget.toLocaleString()}</p>
                        <p className="text-base">הוצאות: ₪{data.expenses.toLocaleString()}</p>
                        <p className={`text-base font-bold ${data.savings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {data.savings >= 0 ? 'חסכון' : 'חריגה'}: ₪{Math.abs(data.savings).toLocaleString()}
                        </p>
                        {data.budget > 0 && (
                          <p className="text-base">
                            {data.savings >= 0 ? 'אחוז חיסכון' : 'אחוז חריגה'}: 
                            {Math.abs(data.savingsPercentage).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#666" />
              <Bar 
                dataKey="savings"
                shape={<CustomBar />}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      {/* Summary section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">חודש עם החיסכון הגבוה ביותר</h3>
          {(() => {
            const bestMonth = convertedData.reduce((prev, curr) => 
              (curr.savings > prev.savings) ? curr : prev
            );
            return (
              <div>
                <p className="text-lg font-bold text-green-600">
                  ₪{Math.max(0, bestMonth.savings).toLocaleString()}
                </p>
                <p className="text-sm">{bestMonth.name}</p>
              </div>
            );
          })()}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">חודש עם החריגה הגבוהה ביותר</h3>
          {(() => {
            const worstMonth = convertedData.reduce((prev, curr) => 
              (curr.savings < prev.savings) ? curr : prev
            );
            return (
              <div>
                <p className="text-lg font-bold text-red-500">
                  ₪{Math.abs(Math.min(0, worstMonth.savings)).toLocaleString()}
                </p>
                <p className="text-sm">{worstMonth.name}</p>
              </div>
            );
          })()}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">סה"כ חסכונות השנה</h3>
          {(() => {
            const totalSavings = convertedData.reduce((sum, month) => sum + month.savings, 0);
            return (
              <div>
                <p className={`text-lg font-bold ${totalSavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ₪{totalSavings.toLocaleString()}
                </p>
                <p className="text-sm">
                  {totalSavings >= 0 ? 'נחסכו' : 'חריגה'} השנה
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}; 