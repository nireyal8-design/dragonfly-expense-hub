import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, Calendar, Tag, AlertCircle, PiggyBank, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface SpendingInsightsProps {
  expenses: any[];
  monthlyBudget: number;
  selectedMonth: number | null;
  selectedYear: number;
}

interface Insight {
  type: 'savings' | 'spending' | 'categories' | 'forecast' | 'highest';
  icon: React.ReactNode;
  title: string;
  message: string;
}

export function SpendingInsights({ expenses, monthlyBudget, selectedMonth, selectedYear }: SpendingInsightsProps) {
  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && 
             expenseDate.getFullYear() === year;
    });
  };

  const getMonthlySavings = (month: number, year: number) => {
    const monthlyExpenses = getMonthlyExpenses(month, year);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    return monthlyBudget - totalExpenses;
  };

  const getInsights = () => {
    if (selectedMonth === null) return { insights: [] };

    // Filter expenses for current month
    const currentMonthExpenses = getMonthlyExpenses(selectedMonth, selectedYear);
    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentSavings = getMonthlySavings(selectedMonth, selectedYear);

    // Calculate savings for all months
    const savingsByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      year: selectedYear,
      savings: getMonthlySavings(i, selectedYear)
    }));

    const maxSavingsMonth = savingsByMonth.reduce((max, current) => 
      current.savings > max.savings ? current : max
    );
    const minSavingsMonth = savingsByMonth.reduce((min, current) => 
      current.savings < min.savings ? current : min
    );

    // Filter expenses for last 3 months
    const lastThreeMonthsExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const monthDiff = (selectedYear - expenseDate.getFullYear()) * 12 + 
                       (selectedMonth - expenseDate.getMonth());
      return monthDiff >= 0 && monthDiff < 3;
    });

    // Calculate average spending for last 3 months
    const lastThreeMonthsTotal = lastThreeMonthsExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastThreeMonthsAverage = lastThreeMonthsTotal / 3;
    const isSpendingHigher = currentMonthTotal > lastThreeMonthsAverage;

    // Find day with highest spending
    const dailySpending = currentMonthExpenses.reduce((acc, expense) => {
      const day = new Date(expense.date).getDate();
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<number, number>);

    const highestSpendingDay = Object.entries(dailySpending)
      .reduce((max, [day, amount]) => (amount as number) > max.amount ? { day: Number(day), amount: amount as number } : max, { day: 0, amount: 0 });

    // Calculate category changes
    const categoryChanges = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Find new categories this month
    const allCategories = new Set(expenses.map(e => e.category));
    const currentMonthCategories = new Set(currentMonthExpenses.map(e => e.category));
    const newCategories = Array.from(currentMonthCategories)
      .filter(category => !allCategories.has(category));

    // Calculate forecast
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const dailyAverage = currentMonthTotal / currentDay;
    const forecastTotal = dailyAverage * daysInMonth;

    const insights: Insight[] = [];

    // Add savings insights
    if (currentSavings > 0) {
      insights.push({
        type: 'savings',
        icon: <PiggyBank className="h-5 w-5 text-green-500" />,
        title: 'חיסכון חודשי נוכחי',
        message: `₪${Math.round(currentSavings)}`
      });
    }

    if (maxSavingsMonth.savings > 0) {
      const monthName = new Date(maxSavingsMonth.year, maxSavingsMonth.month).toLocaleString('he-IL', { month: 'long' });
      insights.push({
        type: 'savings',
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        title: 'חודש עם החיסכון הגבוה ביותר',
        message: `${monthName} (₪${Math.round(maxSavingsMonth.savings)})`
      });
    }

    if (minSavingsMonth.savings < 0) {
      const monthName = new Date(minSavingsMonth.year, minSavingsMonth.month).toLocaleString('he-IL', { month: 'long' });
      insights.push({
        type: 'savings',
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        title: 'חודש עם החיסכון הנמוך ביותר',
        message: `${monthName} (₪${Math.round(minSavingsMonth.savings)})`
      });
    }

    // Add spending insights
    insights.push({
      type: 'spending',
      icon: <TrendingUp className="h-5 w-5 text-dragonfly-600" />,
      title: isSpendingHigher ? 'הוצאות גבוהות מהממוצע' : 'הוצאות נמוכות מהממוצע',
      message: `ההוצאות החודשיות ${isSpendingHigher ? 'גבוהות' : 'נמוכות'} ב-₪${Math.abs(currentMonthTotal - lastThreeMonthsAverage).toLocaleString()} מהממוצע של 3 החודשים האחרונים`
    });

    if (newCategories.length > 0) {
      insights.push({
        type: 'categories',
        icon: <Tag className="h-5 w-5 text-dragonfly-600" />,
        title: 'קטגוריות חדשות החודש',
        message: newCategories.join(', ')
      });
    }

    insights.push({
      type: 'forecast',
      icon: <Calendar className="h-5 w-5 text-dragonfly-600" />,
      title: 'תחזית סוף חודש',
      message: `לפי הקצב הנוכחי, ההוצאות החודשיות צפויות להגיע ל-₪${forecastTotal.toLocaleString()}`
    });

    insights.push({
      type: 'highest',
      icon: <AlertCircle className="h-5 w-5 text-dragonfly-600" />,
      title: 'יום ההוצאות הגבוה ביותר',
      message: `${format(new Date(selectedYear, selectedMonth, highestSpendingDay.day), 'd בMMMM', { locale: he })} עם הוצאות של ₪${highestSpendingDay.amount.toLocaleString()}`
    });

    return { insights };
  };

  const { insights } = getInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          תובנות הוצאות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              {insight.icon}
              <div>
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין תובנות להצגה כרגע
          </p>
        )}
      </CardContent>
    </Card>
  );
} 