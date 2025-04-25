import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Expense, PaymentMethod } from "@/types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
} from "@/components/ui/dialog";

interface RecurringExpense extends Expense {
  is_active: boolean;
}

export function RecurringExpensesSettings() {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRecurringExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Create a map to store unique recurring expenses
      const uniqueExpenses = new Map<string, RecurringExpense>();

      // Process each expense and keep only the most recent version of each recurring expense
      data?.forEach((expense: any) => {
        const key = `${expense.name}-${expense.amount}-${expense.category}-${expense.currency}-${expense.recurring_day}-${expense.recurring_frequency}`;
        
        if (!uniqueExpenses.has(key)) {
          uniqueExpenses.set(key, {
            ...expense,
            date: expense.date || new Date().toISOString(),
            payment_method: (expense.payment_method as PaymentMethod) || 'cash'
          });
        }
      });

      // Convert the map values to an array
      setRecurringExpenses(Array.from(uniqueExpenses.values()));
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      toast.error('שגיאה בטעינת הוצאות חוזרות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpense = async (expense: RecurringExpense) => {
    try {
      // First, update the current expense
      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          currency: expense.currency,
          recurring_day: expense.recurring_day,
          recurring_frequency: expense.recurring_frequency
        })
        .eq('id', expense.id);

      if (updateError) throw updateError;

      // Delete all future occurrences of this expense
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('name', expense.name)
        .eq('user_id', expense.user_id)
        .eq('is_recurring', true)
        .gt('date', expense.date);

      if (deleteError) throw deleteError;

      // Create new future expenses based on the new frequency
      const futureExpenses = [];
      const currentDate = new Date(expense.date);
      const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // December 31st of current year
      let nextDate = new Date(currentDate);
      
      // Adjust for timezone offset
      nextDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      while (nextDate <= endOfYear) {
        // Skip the current expense date
        if (nextDate.getTime() !== currentDate.getTime()) {
          futureExpenses.push({
            name: expense.name,
            amount: expense.amount,
            user_id: expense.user_id,
            date: nextDate.toISOString(),
            transaction_date: nextDate.toISOString(),
            is_recurring: true,
            recurring_day: expense.recurring_day,
            recurring_frequency: expense.recurring_frequency,
            category: expense.category,
            currency: expense.currency,
            payment_method: expense.payment_method,
            notes: expense.notes
          });
        }
        
        // Calculate next date based on frequency
        switch (expense.recurring_frequency) {
          case 'monthly':
            nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, expense.recurring_day);
            break;
          case 'bimonthly':
            nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 2, expense.recurring_day);
            break;
          case 'quarterly':
            nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 3, expense.recurring_day);
            break;
          case 'yearly':
            nextDate = new Date(nextDate.getFullYear() + 1, nextDate.getMonth(), expense.recurring_day);
            break;
        }
        // Set to noon for each new date to avoid timezone issues
        nextDate.setHours(12, 0, 0, 0);
      }

      // Insert all new future expenses
      if (futureExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert(futureExpenses);
        
        if (insertError) throw insertError;
      }

      // Update the recurring expense template
      const { error: recurringError } = await supabase
        .from('recurring_expenses')
        .upsert([
          {
            user_id: expense.user_id,
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            currency: expense.currency,
            recurring_day: expense.recurring_day,
            recurring_frequency: expense.recurring_frequency,
          }
        ]);
      
      if (recurringError) throw recurringError;

      setRecurringExpenses(prev => 
        prev.map(e => e.id === expense.id ? expense : e)
      );

      toast.success('ההוצאה החוזרת עודכנה בהצלחה');
      setIsDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating recurring expense:', error);
      toast.error('שגיאה בעדכון ההוצאה החוזרת');
    }
  };

  const handleDeleteExpense = async (expense: RecurringExpense) => {
    try {
      // Delete all future occurrences of this expense
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('name', expense.name)
        .eq('user_id', expense.user_id)
        .eq('is_recurring', true)
        .gt('date', expense.date);

      if (deleteError) throw deleteError;

      // Update the current expense to mark it as non-recurring
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ is_recurring: false })
        .eq('id', expense.id);

      if (updateError) throw updateError;

      // Delete the recurring expense template
      const { error: deleteTemplateError } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('name', expense.name)
        .eq('user_id', expense.user_id);

      if (deleteTemplateError) throw deleteTemplateError;

      setRecurringExpenses(prev => prev.filter(e => e.id !== expense.id));
      toast.success('ההוצאה החוזרת נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      toast.error('שגיאה במחיקת ההוצאה החוזרת');
    }
  };

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>הוצאות חוזרות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recurringExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                אין הוצאות חוזרות להצגה
              </p>
            ) : (
              recurringExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{expense.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        (₪{expense.amount})
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expense.category && <span>קטגוריה: {expense.category}</span>}
                      {expense.category && expense.currency && <span> • </span>}
                      {expense.currency && <span>מטבע: {expense.currency}</span>}
                      <span> • יום בחודש: {expense.recurring_day}</span>
                      {expense.recurring_frequency && (
                        <span> • תדירות: {
                          expense.recurring_frequency === 'monthly' ? 'חודשי' :
                          expense.recurring_frequency === 'bimonthly' ? 'כל חודשיים' :
                          expense.recurring_frequency === 'quarterly' ? 'רבעוני' :
                          'שנתי'
                        }</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingExpense(expense);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת הוצאה חוזרת</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">שם</label>
                <Input
                  value={editingExpense.name}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium">סכום</label>
                <Input
                  type="number"
                  value={editingExpense.amount}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium">קטגוריה</label>
                <Input
                  value={editingExpense.category || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium">מטבע</label>
                <Input
                  value={editingExpense.currency || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium">יום בחודש</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={editingExpense.recurring_day}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      recurring_day: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">תדירות</label>
                <Select
                  value={editingExpense.recurring_frequency || 'monthly'}
                  onValueChange={(value) =>
                    setEditingExpense({
                      ...editingExpense,
                      recurring_frequency: value as 'monthly' | 'bimonthly' | 'quarterly' | 'yearly',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תדירות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">חודשי</SelectItem>
                    <SelectItem value="bimonthly">כל חודשיים</SelectItem>
                    <SelectItem value="quarterly">רבעוני</SelectItem>
                    <SelectItem value="yearly">שנתי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingExpense(null);
                  }}
                >
                  ביטול
                </Button>
                <Button onClick={() => handleUpdateExpense(editingExpense)}>
                  שמור שינויים
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 