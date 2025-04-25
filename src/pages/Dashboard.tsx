import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { CreateExpenseForm } from "@/components/expenses/CreateExpenseForm";
import { EditExpenseForm } from "@/components/expenses/EditExpenseForm";
import { supabase } from "@/integrations/supabase/client";
import { Expense, PaymentMethod } from "@/types/expense";
import { toast } from "sonner";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { List, Plus, Settings, DollarSign, Calendar, BarChart2, PieChart, Wallet, X, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyExpensesChart } from "@/components/charts/MonthlyExpensesChart";
import { CategoryExpensesChart } from "@/components/charts/CategoryExpensesChart";
import { CategoryTrendsChart } from "@/components/charts/CategoryTrendsChart";
import { MonthlyBudgetForm } from "@/components/budget/MonthlyBudgetForm";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { MonthFilter } from "@/components/expenses/MonthFilter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { YearlySavingsChart } from "@/components/charts/YearlySavingsChart";
import { SpendingInsights } from "@/components/insights/SpendingInsights";
import { GoalsStatus } from "@/components/dashboard/GoalsStatus";
import { Database } from '@/types/database';
import { convertToILS } from '@/utils/currency';
import { Logo } from "@/components/Logo";
import { BudgetExpenseTrendChart } from '@/components/charts/BudgetExpenseTrendChart';
import { SavingsBreakdown } from '@/components/dashboard/SavingsBreakdown';
import { ReminderSection } from '@/components/reminders/ReminderSection';
import { useUser } from '@supabase/auth-helpers-react';

type Goal = Database['public']['Tables']['goals']['Row'] & {
  current_amount: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const handleMonthChange = (month: number | null, year: number) => {
    if (month === null) {
      setSelectedMonth(new Date(year, 0, 1));
    } else {
      setSelectedMonth(new Date(year, month, 1));
    }
    setSelectedYear(year);
  };
  
  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const typedExpenses: Expense[] = data.map(expense => ({
        ...expense,
        payment_method: expense.payment_method ? (expense.payment_method as PaymentMethod) : undefined
      }));
      
      setExpenses(typedExpenses);
      
      // Calculate total expenses for the selected month
      const monthExpenses = typedExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedMonth.getMonth() &&
               expenseDate.getFullYear() === selectedMonth.getFullYear();
      });
      
      // Convert all amounts to ILS for consistency
      const total = await Promise.all(monthExpenses.map(async expense => {
        return await convertToILS(expense.amount, expense.currency || 'ILS');
      })).then(amounts => amounts.reduce((sum, amount) => sum + amount, 0));
      
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('שגיאה בטעינת ההוצאות');
    }
  };
  
  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setIsFormOpen(false);
    fetchExpenses();
  };
  
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };
  
  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
    setEditingExpense(null);
    fetchExpenses();
  };
  
  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success("ההוצאה נמחקה בהצלחה");
      fetchExpenses();
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast.error("שגיאה במחיקת ההוצאה");
    }
  };

  const handleUpdateBudget = async (newBudget: number) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    
    const { error } = await supabase
      .from("monthly_budgets")
      .upsert({
        user_id: currentUser.id,
        year: selectedYear,
        month: selectedMonth.getMonth() + 1,
        budget: newBudget,
      }, {
        onConflict: 'user_id,year,month'
      });

    if (error) {
      console.error("Error updating budget:", error);
      toast.error("שגיאה בעדכון התקציב");
      return;
    }

    setMonthlyBudget(newBudget);
    toast.success(`התקציב החודשי שלך הוגדר ל-₪${newBudget}`);
  };
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("שגיאה בהתנתקות");
    } else {
      navigate("/");
    }
  };

  const fetchUserBudget = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('budget')
        .eq('user_id', userId)
        .eq('year', selectedMonth.getFullYear())
        .eq('month', selectedMonth.getMonth() + 1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user budget:', error);
        toast.error('שגיאה בטעינת התקציב החודשי');
        setMonthlyBudget(null);
        return;
      }
      
      setMonthlyBudget(data?.budget ?? null);
    } catch (error) {
      console.error('Error fetching user budget:', error);
      toast.error('שגיאה בטעינת התקציב החודשי');
      setMonthlyBudget(null);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('allocation_percentage', { ascending: false });

      if (error) throw error;

      // Get monthly budgets
      const { data: monthlyBudgets } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      console.log('Monthly Budgets:', monthlyBudgets);

      // Get all expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id);

      console.log('Expenses:', expenses);

      // Group expenses by month
      const expensesByMonth = expenses?.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[key] = (acc[key] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('Expenses by Month:', expensesByMonth);

      // Calculate current amount for each goal
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
          let totalSavings = 0;

          console.log('Processing goal:', goal.name);

          // Calculate savings for each month that has a budget
          for (const budget of monthlyBudgets || []) {
            const budgetKey = `${budget.year}-${budget.month}`;
            const monthExpenses = expensesByMonth[budgetKey] || 0;
            const monthSavings = Math.max(0, budget.budget - monthExpenses);

            console.log(`Month ${budgetKey}:`, {
              budget: budget.budget,
              expenses: monthExpenses,
              savings: monthSavings,
              allocated: monthSavings * (goal.allocation_percentage / 100)
            });

            if (monthSavings > 0) {
              // Apply allocation percentage to savings
              const allocatedSavings = monthSavings * (goal.allocation_percentage / 100);
              totalSavings += allocatedSavings;
            }
          }

          console.log('Total savings for goal:', goal.name, totalSavings);

          return {
            ...goal,
            current_amount: Math.min(totalSavings, goal.target_amount)
          };
        })
      );

      setGoals(goalsWithProgress);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('שגיאה בטעינת המטרות');
    }
  };

  const handleReminderRemoved = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId ? { ...expense, has_reminder: false } : expense
    ));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('first_name')
            .eq('id', user.id as any)
            .single();
          
          if (profile?.first_name) {
            setUserName(profile.first_name);
          } else {
            // Fallback to metadata if not in users table
            const firstName = user.user_metadata?.first_name || '';
            setUserName(firstName);
          }

          await fetchExpenses();
          await fetchUserBudget(user.id);
          await fetchGoals();
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("שגיאה בטעינת נתוני המשתמש");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [selectedMonth]);

  useEffect(() => {
    console.log('Dashboard user:', user);
  }, [user]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">טוען...</div>;
  }

  const remainingBudget = monthlyBudget !== null ? monthlyBudget - totalExpenses : null;
  const budgetProgress = monthlyBudget !== null ? (totalExpenses / monthlyBudget) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress < 50) return "bg-green-500";
    if (progress < 100) return "bg-blue-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {userName ? `שלום ${userName}!` : 'שלום!'}
              </h1>
              <Logo size="large" />
            </div>
            <div className="flex justify-between items-center">
              <MonthFilter 
                selectedMonth={selectedMonth.getMonth()} 
                selectedYear={selectedYear}
                onMonthSelect={handleMonthChange}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsBudgetFormOpen(true)}>
                  <Wallet className="h-4 w-4 mr-2" />
                  {monthlyBudget === null ? 'הגדר תקציב' : 'עדכן תקציב'}
                </Button>
                <Button variant="outline" onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  הגדרות
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  התנתק
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  תקציב חודשי
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyBudget !== null ? `₪${monthlyBudget.toLocaleString()}` : 'לא הוגדר'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {format(selectedMonth, 'MMMM yyyy', { locale: he })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  הוצאות החודש
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪{totalExpenses.toLocaleString()}</div>
                {monthlyBudget !== null && (
                <div className="mt-2">
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full ${getProgressColor(budgetProgress)}`}
                      style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {budgetProgress.toFixed(1)}% מהתקציב
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  יתרה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-2xl font-bold",
                  remainingBudget !== null && remainingBudget < 0 ? "text-red-500" : "text-green-500"
                )}>
                  {remainingBudget !== null ? `₪${remainingBudget.toLocaleString()}` : 'לא הוגדר'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {remainingBudget !== null 
                    ? (remainingBudget < 0 ? 'עברת את התקציב' : 'נשאר מהתקציב')
                    : 'הגדר תקציב חודשי'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={cn(
            isFormOpen && "opacity-50 pointer-events-none"
          )}>
            <div className="space-y-8">
              {/* Reminders Section */}
              <ReminderSection onReminderRemoved={handleReminderRemoved} />

              {/* Financial Goals Section - Only show if user has goals */}
              {goals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">מטרות כספיות</h2>
                  <GoalsStatus goals={goals} />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">פירוט חיסכון</h2>
                <SavingsBreakdown />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">הוצאות</h2>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף הוצאה
                  </Button>
                </div>

                <ExpenseList
                  expenses={expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === selectedMonth.getMonth() &&
                           expenseDate.getFullYear() === selectedMonth.getFullYear();
                  })}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">מגמת תקציב והוצאות</h2>
                <BudgetExpenseTrendChart />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">חיסכון שנתי</h2>
                <YearlySavingsChart 
                  expenses={expenses}
                  monthlyBudget={monthlyBudget}
                  selectedMonth={selectedMonth}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">ניתוח חודשי</h2>
                <MonthlyExpensesChart 
                  expenses={expenses}
                  selectedMonth={selectedMonth}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">מגמות הוצאות</h2>
                <CategoryTrendsChart 
                  expenses={expenses}
                  selectedMonth={selectedMonth}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">ניתוח קטגוריות</h2>
                <CategoryExpensesChart 
                  expenses={expenses}
                  selectedMonth={selectedMonth}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">תובנות הוצאות</h2>
                <SpendingInsights 
                  expenses={expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === selectedMonth.getMonth() &&
                           expenseDate.getFullYear() === selectedMonth.getFullYear();
                  })} 
                  selectedMonth={selectedMonth.getMonth()}
                  selectedYear={selectedYear}
                  monthlyBudget={monthlyBudget || 0}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {editingExpense && (
        <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center">
          <div className="bg-background w-full max-w-2xl mx-4 rounded-lg shadow-lg transform-none">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">ערוך הוצאה</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingExpense(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EditExpenseForm
                expense={editingExpense}
                onClose={() => setEditingExpense(null)}
                onUpdateExpense={handleUpdateExpense}
              />
            </div>
          </div>
        </div>
      )}

      <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הגדר תקציב חודשי</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <MonthlyBudgetForm
              initialBudget={monthlyBudget}
              onUpdateBudget={handleUpdateBudget}
              onClose={() => setIsBudgetFormOpen(false)}
              selectedMonth={selectedMonth}
            />
          </div>
        </DialogContent>
      </Dialog>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center">
          <div className="bg-background w-full max-w-2xl mx-4 rounded-lg shadow-lg transform-none">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">הוסף הוצאה חדשה</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFormOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CreateExpenseForm 
                onClose={() => setIsFormOpen(false)}
                onAddExpense={handleAddExpense}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
