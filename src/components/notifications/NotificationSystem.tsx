import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Database } from '@/types/database';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];

interface Notification {
  id: string;
  expense: ExpenseRow;
  message: string;
  date: Date;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUpcomingExpenses();
    // Check every hour for new notifications
    const interval = setInterval(checkUpcomingExpenses, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkUpcomingExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('has_reminder', true)
        .gte('date', today.toISOString())
        .lte('date', tomorrow.toISOString());

      if (error) throw error;

      const newNotifications = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          const daysUntilExpense = Math.ceil((expenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpense === expense.reminder_days_before;
        })
        .map(expense => ({
          id: expense.id,
          expense,
          message: `תזכורת: הוצאה "${expense.name}" בסכום ${expense.amount} ${expense.currency} תתבצע מחר`,
          date: new Date(expense.date)
        }));

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error checking upcoming expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (isLoading || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            "bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-sm",
            "border-l-4 border-yellow-500"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Bell className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(notification.date, 'dd/MM/yyyy', { locale: he })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 