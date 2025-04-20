import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Expense } from "@/types/expense";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { convertToILS } from '@/utils/currency';

interface YearlyExpenseChartProps {
  expenses: Expense[];
  onMonthSelect: (month: number | null, year: number) => void;
  selectedMonth: number | null;
  selectedYear: number;
}

// Hebrew month names
const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export const YearlyExpenseChart = ({ 
  expenses, 
  onMonthSelect, 
  selectedMonth, 
  selectedYear 
}: YearlyExpenseChartProps) => {
  const currentYear = new Date().getFullYear();
  
  // Get all available years from the expenses
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    expenses.forEach(expense => {
      const year = new Date(expense.date).getFullYear();
      years.add(year);
    });
    return [...years].sort((a, b) => b - a); // Sort years in descending order
  }, [expenses]);

  // Prepare data for the chart
  const monthlyData = useMemo(() => {
    // Initialize data array with all months
    const data = hebrewMonths.map((month, index) => ({
      name: month,
      month: index,
      amount: 0,
      expenses: [] as Expense[]
    }));

    // Filter expenses for the selected year
    const yearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === selectedYear;
    });

    // Sum expenses by month
    Promise.all(yearExpenses.map(async expense => {
      const expenseDate = new Date(expense.date);
      const month = expenseDate.getMonth();
      
      // Convert all amounts to ILS for consistency in the chart
      const amount = await convertToILS(expense.amount, expense.currency || 'ILS');
      
      data[month].amount += amount;
      data[month].expenses.push(expense);
    }));

    return data;
  }, [expenses, selectedYear]);

  const chartConfig = {
    expenses: {
      label: "הוצאות",
      color: "#8B5CF6", // Vivid Purple
    }
  };

  const handlePreviousYear = () => {
    const prevYear = availableYears.find(year => year < selectedYear);
    if (prevYear) {
      onMonthSelect(selectedMonth, prevYear);
    }
  };

  const handleNextYear = () => {
    const nextYear = availableYears.find(year => year > selectedYear);
    if (nextYear) {
      onMonthSelect(selectedMonth, nextYear);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">סקירת הוצאות שנתית</h2>
        <div className="flex items-center space-x-4 flex-row-reverse">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePreviousYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="mx-2 font-medium">{selectedYear}</span>
            <Button variant="ghost" size="icon" onClick={handleNextYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <Select 
            value={selectedMonth !== null ? selectedMonth.toString() : "all"}
            onValueChange={(value) => {
              const month = value === "all" ? null : parseInt(value);
              onMonthSelect(month, selectedYear);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="כל החודשים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל החודשים</SelectItem>
              {hebrewMonths.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {monthlyData.length > 0 ? (
        <div className="h-80 w-full">
          <ChartContainer config={chartConfig} className="h-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => selectedMonth === null ? value : hebrewMonths[index]}
              />
              <YAxis 
                width={80} 
                tickFormatter={(value) => `₪${Math.round(value)}`} 
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [`₪${Math.round(Number(value))}`, "סכום"]}
                    labelFormatter={(value) => `${value}, ${selectedYear}`}
                  />
                }
              />
              <Bar 
                dataKey="amount" 
                fill="var(--color-expenses)" 
                radius={[4, 4, 0, 0]} 
                onClick={(data) => {
                  if (selectedMonth === data.month) {
                    onMonthSelect(null, selectedYear); // Deselect if already selected
                  } else {
                    onMonthSelect(data.month, selectedYear); // Select the clicked month
                  }
                }}
                cursor="pointer"
              />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center py-12 h-60 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            אין נתונים להצגה עבור {selectedMonth !== null ? `${hebrewMonths[selectedMonth]}, ` : ""}שנת {selectedYear}
          </p>
        </div>
      )}
    </div>
  );
};
