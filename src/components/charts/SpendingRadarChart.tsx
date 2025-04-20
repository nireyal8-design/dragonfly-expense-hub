import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Expense } from "@/types/expense";

interface SpendingRadarChartProps {
  expenses: Expense[];
}

export function SpendingRadarChart({ expenses }: SpendingRadarChartProps) {
  const { t } = useTranslation();

  // Calculate total spending per category
  const categorySpending = expenses.reduce((acc, expense) => {
    const category = expense.category || t("expenses.uncategorized");
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for the chart
  const data = Object.entries(categorySpending).map(([category, amount]) => ({
    category,
    amount,
  }));

  // Sort by amount in descending order
  data.sort((a, b) => b.amount - a.amount);

  // Take top 6 categories
  const topCategories = data.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.spendingPatterns")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topCategories}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis />
              <Radar
                name="Spending"
                dataKey="amount"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 