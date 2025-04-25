import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, Calendar, Tag, AlertCircle, PiggyBank, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

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
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
      const result = await getInsights();
      setInsights(result.insights);
    };
    loadInsights();
  }, [expenses, monthlyBudget, selectedMonth, selectedYear]);

  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      // Create start and end dates for the month
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      // Check if the expense date falls within the month
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });
  };

  const getMonthlySavings = (month: number, year: number) => {
    const monthlyExpenses = getMonthlyExpenses(month, year);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // If there are no expenses, return null
    if (monthlyExpenses.length === 0) {
      return null;
    }
    
    return monthlyBudget - totalExpenses;
  };

  const getInsights = async () => {
    if (selectedMonth === null) return { insights: [] };

    // Filter expenses for current month
    const currentMonthExpenses = getMonthlyExpenses(selectedMonth, selectedYear);
    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentSavings = getMonthlySavings(selectedMonth, selectedYear);

    // Get current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate savings for all months up to current month
    const savingsByMonth = [];
    const startMonth = 0; // January
    const endMonth = selectedYear === currentYear ? currentMonth : 11; // December or current month
    
    for (let month = startMonth; month <= endMonth; month++) {
      const monthlyExpenses = getMonthlyExpenses(month, selectedYear);
      const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const savings = monthlyBudget - totalExpenses;
      
      // Include all months that have either expenses or are the current month
      if (monthlyExpenses.length > 0 || month === currentMonth) {
        savingsByMonth.push({
          month,
          year: selectedYear,
          savings
        });
      }
    }

    if (savingsByMonth.length === 0) return { insights: [] };

    // Find the month with the highest savings
    const maxSavingsMonth = savingsByMonth.reduce((max, current) => 
      current.savings > max.savings ? current : max
    );

    // Find the month with the lowest savings (biggest negative value)
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

    // Calculate weighted day-type forecasting
    const calculateDayTypeAverages = () => {
      // Get expenses from last 3 months for better averages
      const lastThreeMonthsExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const monthDiff = (selectedYear - expenseDate.getFullYear()) * 12 + 
                         (selectedMonth - expenseDate.getMonth());
        return monthDiff >= 0 && monthDiff < 3;
      });

      // Calculate weekday and weekend averages
      const weekdayExpenses: number[] = [];
      const weekendExpenses: number[] = [];

      lastThreeMonthsExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const dayOfWeek = expenseDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (isWeekend) {
          weekendExpenses.push(expense.amount);
        } else {
          weekdayExpenses.push(expense.amount);
        }
      });

      const weekdayAverage = weekdayExpenses.length > 0 
        ? weekdayExpenses.reduce((sum, amount) => sum + amount, 0) / weekdayExpenses.length 
        : 0;
      
      const weekendAverage = weekendExpenses.length > 0 
        ? weekendExpenses.reduce((sum, amount) => sum + amount, 0) / weekendExpenses.length 
        : 0;

      return { weekdayAverage, weekendAverage };
    };

    // Calculate remaining days in the month
    const getRemainingDays = () => {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const currentDay = currentDate.getDate();
      const remainingDays = daysInMonth - currentDay;
      
      let remainingWeekdays = 0;
      let remainingWeekends = 0;
      
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(selectedYear, selectedMonth, currentDay + i);
        const dayOfWeek = nextDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          remainingWeekends++;
        } else {
          remainingWeekdays++;
        }
      }
      
      return { remainingWeekdays, remainingWeekends };
    };

    // Get known upcoming expenses
    const getKnownUpcomingExpenses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        // Get the current date and end of month
        const currentDate = new Date();
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
        
        // Fetch recurring expenses
        const { data: recurringExpenses, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_recurring', true)
          .gte('date', currentDate.toISOString())
          .lte('date', endOfMonth.toISOString());

        if (error) throw error;

        // Calculate total upcoming expenses
        const totalUpcoming = recurringExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        return totalUpcoming;
      } catch (error) {
        console.error('Error fetching upcoming expenses:', error);
        return 0;
      }
    };

    // Calculate the forecast
    const { weekdayAverage, weekendAverage } = calculateDayTypeAverages();
    const { remainingWeekdays, remainingWeekends } = getRemainingDays();
    const knownUpcomingExpenses = await getKnownUpcomingExpenses();

    const dailyForecast = (weekdayAverage * remainingWeekdays) + (weekendAverage * remainingWeekends);
    const forecastTotal = currentMonthTotal + dailyForecast + knownUpcomingExpenses;

    // Calculate if we have enough data for reliable forecast
    const hasEnoughData = lastThreeMonthsExpenses.length >= 3;

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

    // Add forecast insight
    insights.push({
      type: 'forecast',
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      title: 'תחזית סוף חודש',
      message: `לפי הקצב הנוכחי, ההוצאות החודשיות צפויות להגיע ל-₪${Math.round(forecastTotal).toLocaleString()}\n⚠️ לתחזית אמינה יותר, מומלץ להזין לפחות 3 חודשים של הוצאות`
    });

    insights.push({
      type: 'highest',
      icon: <AlertCircle className="h-5 w-5 text-dragonfly-600" />,
      title: 'יום ההוצאות הגבוה ביותר',
      message: `${format(new Date(selectedYear, selectedMonth, highestSpendingDay.day), 'd בMMMM', { locale: he })} עם הוצאות של ₪${highestSpendingDay.amount.toLocaleString()}`
    });

    return { insights };
  };

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