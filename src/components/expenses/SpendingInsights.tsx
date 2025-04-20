import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { AlertCircle, TrendingUp, TrendingDown, Info, PiggyBank } from "lucide-react";

interface SpendingInsightsProps {
  expenses: Expense[];
  selectedMonth: number | null;
  selectedYear: number;
  monthlyBudget?: number;
}

interface CategoryChange {
  category: string;
  change: number;
  currentAmount: number;
  previousAmount: number;
}

export function SpendingInsights({ expenses, selectedMonth, selectedYear, monthlyBudget }: SpendingInsightsProps) {
  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const getCategoryChanges = (): CategoryChange[] => {
    if (selectedMonth === null) return [];
    
    const currentMonthExpenses = getMonthlyExpenses(selectedMonth, selectedYear);
    const previousMonthExpenses = getMonthlyExpenses(
      selectedMonth === 0 ? 11 : selectedMonth - 1,
      selectedMonth === 0 ? selectedYear - 1 : selectedYear
    );

    const categories = new Set([
      ...currentMonthExpenses.map(e => e.category || 'אחר'),
      ...previousMonthExpenses.map(e => e.category || 'אחר')
    ]);

    return Array.from(categories).map(category => {
      const currentAmount = currentMonthExpenses
        .filter(e => (e.category || 'אחר') === category)
        .reduce((sum, e) => sum + e.amount, 0);

      const previousAmount = previousMonthExpenses
        .filter(e => (e.category || 'אחר') === category)
        .reduce((sum, e) => sum + e.amount, 0);

      const change = previousAmount === 0 
        ? 100 
        : ((currentAmount - previousAmount) / previousAmount) * 100;

      return { category, change, currentAmount, previousAmount };
    });
  };

  const getAverageLastThreeMonths = () => {
    if (selectedMonth === null) return 0;
    
    let total = 0;
    let count = 0;
    
    for (let i = 0; i < 3; i++) {
      const month = selectedMonth - i < 0 ? 12 + (selectedMonth - i) : selectedMonth - i;
      const year = selectedMonth - i < 0 ? selectedYear - 1 : selectedYear;
      
      const monthlyExpenses = getMonthlyExpenses(month, year);
      const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      total += monthlyTotal;
      count++;
    }
    
    return total / count;
  };

  const getEndOfMonthForecast = () => {
    if (selectedMonth === null) return 0;
    
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    const currentMonthExpenses = getMonthlyExpenses(selectedMonth, selectedYear);
    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return (currentTotal / currentDay) * daysInMonth;
  };

  const getNewCategories = () => {
    if (selectedMonth === null) return [];
    
    const currentMonthExpenses = getMonthlyExpenses(selectedMonth, selectedYear);
    const previousMonthsExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() !== selectedMonth || date.getFullYear() !== selectedYear;
    });

    const currentCategories = new Set(currentMonthExpenses.map(e => e.category || 'אחר'));
    const previousCategories = new Set(previousMonthsExpenses.map(e => e.category || 'אחר'));

    return Array.from(currentCategories).filter(category => !previousCategories.has(category));
  };

  const getMonthlySavings = (month: number, year: number) => {
    const monthlyExpenses = getMonthlyExpenses(month, year);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    return monthlyBudget ? monthlyBudget - totalExpenses : 0;
  };

  const getSavingsInsights = () => {
    if (selectedMonth === null || !monthlyBudget) return [];

    const currentSavings = getMonthlySavings(selectedMonth, selectedYear);
    const savingsByMonth = Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const year = selectedYear;
      return {
        month,
        year,
        savings: getMonthlySavings(month, year)
      };
    });

    const maxSavingsMonth = savingsByMonth.reduce((max, current) => 
      current.savings > max.savings ? current : max
    );
    const minSavingsMonth = savingsByMonth.reduce((min, current) => 
      current.savings < min.savings ? current : min
    );

    const insights = [];

    if (currentSavings > 0) {
      insights.push({
        type: 'savings',
        icon: <PiggyBank className="h-5 w-5 text-green-500" />,
        message: `החיסכון החודשי הנוכחי: ₪${Math.round(currentSavings)}`
      });
    }

    if (maxSavingsMonth.savings > 0) {
      const monthName = new Date(maxSavingsMonth.year, maxSavingsMonth.month).toLocaleString('he-IL', { month: 'long' });
      insights.push({
        type: 'savings',
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        message: `החודש עם החיסכון הגבוה ביותר: ${monthName} (₪${Math.round(maxSavingsMonth.savings)})`
      });
    }

    if (minSavingsMonth.savings < 0) {
      const monthName = new Date(minSavingsMonth.year, minSavingsMonth.month).toLocaleString('he-IL', { month: 'long' });
      insights.push({
        type: 'savings',
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        message: `החודש עם החיסכון הנמוך ביותר: ${monthName} (₪${Math.round(minSavingsMonth.savings)})`
      });
    }

    return insights;
  };

  const categoryChanges = getCategoryChanges();
  const averageLastThreeMonths = getAverageLastThreeMonths();
  const endOfMonthForecast = getEndOfMonthForecast();
  const newCategories = getNewCategories();
  const savingsInsights = getSavingsInsights();
  const currentMonthTotal = expenses
    .filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const insights = [];

  // Add savings insights first
  insights.push(...savingsInsights);

  // Compare with last 3 months average
  if (currentMonthTotal > averageLastThreeMonths * 1.1) {
    insights.push({
      type: 'warning',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      message: `ההוצאות החודשיות גבוהות ב-${Math.round(((currentMonthTotal - averageLastThreeMonths) / averageLastThreeMonths) * 100)}% מהממוצע של שלושת החודשים האחרונים`
    });
  }

  // End of month forecast
  if (endOfMonthForecast > currentMonthTotal * 1.2) {
    insights.push({
      type: 'info',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      message: `על פי הקצב הנוכחי, ההוצאות החודשיות צפויות להגיע ל-₪${Math.round(endOfMonthForecast)}`
    });
  }

  // New categories
  if (newCategories.length > 0) {
    insights.push({
      type: 'info',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      message: `קטגוריות חדשות החודש: ${newCategories.join(', ')}`
    });
  }

  // Significant category changes
  categoryChanges.forEach(({ category, change, currentAmount }) => {
    if (Math.abs(change) > 20 && currentAmount > 100) {
      insights.push({
        type: change > 0 ? 'increase' : 'decrease',
        icon: change > 0 
          ? <TrendingUp className="h-5 w-5 text-red-500" /> 
          : <TrendingDown className="h-5 w-5 text-green-500" />,
        message: `ההוצאות על ${category} ${change > 0 ? 'עלו' : 'ירדו'} ב-${Math.abs(Math.round(change))}% לעומת החודש שעבר`
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          תובנות הוצאות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {insight.icon}
                <p className="text-sm">{insight.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              אין תובנות להצגה כרגע
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 