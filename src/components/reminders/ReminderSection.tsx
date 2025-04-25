import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Expense } from '@/types/expense';

interface Reminder {
  expense: Expense;
  isRead: boolean;
}

interface ReminderSectionProps {
  onReminderRemoved?: (expenseId: string) => void;
}

export const ReminderSection = ({ onReminderRemoved }: ReminderSectionProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) return;

      try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Set time to start of day for accurate date comparison
        now.setHours(0, 0, 0, 0);
        thirtyDaysFromNow.setHours(23, 59, 59, 999);

        console.log('Fetching reminders for period:', {
          from: now.toISOString(),
          to: thirtyDaysFromNow.toISOString()
        });

        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .eq('has_reminder', true)
          .gte('date', now.toISOString())
          .lte('date', thirtyDaysFromNow.toISOString())
          .order('date', { ascending: true });

        if (expensesError) throw expensesError;

        console.log('Found expenses with reminders:', expenses);

        // Filter expenses to only show those that are within their reminder period
        const filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          expenseDate.setHours(0, 0, 0, 0);
          
          const reminderDate = new Date(expenseDate);
          reminderDate.setDate(expenseDate.getDate() - (expense.reminder_days_before || 0));
          reminderDate.setHours(0, 0, 0, 0);
          
          const shouldShow = now >= reminderDate && now <= expenseDate;
          
          console.log('Checking expense:', {
            name: expense.name,
            expenseDate: expenseDate.toISOString(),
            reminderDate: reminderDate.toISOString(),
            currentDate: now.toISOString(),
            daysBefore: expense.reminder_days_before,
            isRecurring: expense.is_recurring,
            recurringFrequency: expense.recurring_frequency,
            shouldShow
          });
          
          return shouldShow;
        });

        console.log('Filtered expenses:', filteredExpenses);

        // Only fetch read status if we have expenses
        let readStatus = [];
        if (filteredExpenses.length > 0) {
          const { data: statusData, error: statusError } = await supabase
            .from('reminder_status')
            .select('expense_id, is_read')
            .in('expense_id', filteredExpenses.map(e => e.id));

          if (statusError) {
            console.error('Error fetching reminder status:', statusError);
            throw statusError;
          }
          readStatus = statusData || [];
        }

        console.log('Read status:', readStatus);

        const readStatusMap = new Map(
          readStatus.map(status => [status.expense_id, { 
            isRead: status.is_read
          }])
        );

        const remindersWithStatus = filteredExpenses
          .map(expense => ({
            expense,
            isRead: readStatusMap.get(expense.id)?.isRead || false
          }));

        console.log('Final reminders:', remindersWithStatus);

        setReminders(remindersWithStatus);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchReminders();

    // Set up polling interval (every 1 minute)
    const intervalId = setInterval(fetchReminders, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [user, supabase]);

  const markAsRead = async (expenseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminder_status')
        .upsert({
          expense_id: expenseId,
          user_id: user.id,
          is_read: true
        });

      if (error) throw error;

      setReminders(prev =>
        prev.map(reminder =>
          reminder.expense.id === expenseId
            ? { ...reminder, isRead: true }
            : reminder
        )
      );
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  };

  const removeReminder = async (expenseId: string) => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Removing reminder for expense:', expenseId);
      
      // First, try to delete the reminder status
      const { error: deleteError } = await supabase
        .from('reminder_status')
        .delete()
        .eq('expense_id', expenseId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting reminder status:', deleteError);
        throw deleteError;
      }

      // Update the expense to remove the reminder flag
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({ has_reminder: false })
        .eq('id', expenseId);

      if (expenseError) {
        console.error('Error updating expense:', expenseError);
        throw expenseError;
      }

      console.log('Successfully removed reminder and updated expense');

      // Update local state to remove this reminder
      setReminders(prev => prev.filter(reminder => reminder.expense.id !== expenseId));

      // Notify parent component to update the expense list
      if (onReminderRemoved) {
        onReminderRemoved(expenseId);
      }
    } catch (error) {
      console.error('Error in removeReminder:', error);
    }
  };

  if (!user) return null;
  if (loading) return <div>טוען תזכורות...</div>;
  if (reminders.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          תזכורות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.expense.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                reminder.isRead
                  ? 'bg-muted/30 border border-muted-foreground/10'
                  : 'bg-primary/5 border border-primary/20 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-full ${
                  reminder.isRead
                    ? 'bg-muted-foreground/10 text-muted-foreground'
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className={`font-medium ${
                    reminder.isRead ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {reminder.expense.name}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>תאריך:</span>
                    {format(new Date(reminder.expense.date), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!reminder.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(reminder.expense.id)}
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReminder(reminder.expense.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 