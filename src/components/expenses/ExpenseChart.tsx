
import React from "react";
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

interface ExpenseChartProps {
  expenses: Expense[];
}

export const ExpenseChart = ({ expenses }: ExpenseChartProps) => {
  // Sort expenses by amount in descending order
  const sortedExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .map(expense => ({
      name: expense.name,
      amount: expense.amount
    }));

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: "#8B5CF6", // Vivid Purple
    }
  };

  return (
    <div className="h-80 w-full">
      <ChartContainer config={chartConfig} className="h-full">
        <BarChart data={sortedExpenses}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis width={80} tickFormatter={(value) => `$${value}`} />
          <ChartTooltip
            content={
              <ChartTooltipContent 
                formatter={(value) => [`$${value}`, "Amount"]}
              />
            }
          />
          <Bar dataKey="amount" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
