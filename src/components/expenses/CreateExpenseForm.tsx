import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Expense } from "@/types/expense";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod } from "@/types/expense";

interface CreateExpenseFormProps {
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
  selectedMonth: Date;
}

// Hebrew expense categories
const categories = [
  { value: "מזון", label: "מזון" },
  { value: "דיור", label: "דיור" },
  { value: "תחבורה", label: "תחבורה" },
  { value: "בילויים", label: "בילויים" },
  { value: "קניות", label: "קניות" },
  { value: "חשבונות", label: "חשבונות" },
  { value: "בריאות", label: "בריאות" },
  { value: "חינוך", label: "חינוך" },
  { value: "ביטוח", label: "ביטוח" },
  { value: "תקשורת", label: "תקשורת" },
  { value: "ספורט", label: "ספורט" },
  { value: "בידור", label: "בידור" },
  { value: "מתנות", label: "מתנות" },
  { value: "ביגוד והנעלה", label: "ביגוד והנעלה" },
  { value: "טיפוח", label: "טיפוח" },
  { value: "חיות מחמד", label: "חיות מחמד" },
  { value: "תרומות", label: "תרומות" },
  { value: "השקעות", label: "השקעות" },
  { value: "חופשה", label: "חופשה" },
  { value: "ריהוט", label: "ריהוט" },
  { value: "מכשירי חשמל", label: "מכשירי חשמל" },
  { value: "תחזוקת הבית", label: "תחזוקת הבית" },
  { value: "אחר", label: "אחר" }
];

// Currency options
const currencies = [
  { value: "ILS", label: "שקל" },
  { value: "USD", label: "דולר" },
  { value: "EUR", label: "יורו" },
];

const paymentMethodOptions = [
  { value: 'credit', label: 'כרטיס אשראי' },
  { value: 'cash', label: 'מזומן' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
  { value: 'standing_order', label: 'הוראת קבע' }
];

const paymentMethods = [
  { value: '', label: 'ללא' },
  { value: 'cash', label: 'מזומן' },
  { value: 'credit_card', label: 'כרטיס אשראי' },
  { value: 'standing_order', label: 'הוראת קבע' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
] as const;

const recurringFrequencies = [
  { value: 'monthly', label: 'חודשי' },
  { value: 'bimonthly', label: 'כל חודשיים' },
  { value: 'quarterly', label: 'רבעוני' },
  { value: 'yearly', label: 'שנתי' },
] as const;

export function CreateExpenseForm({ onClose, onAddExpense, selectedMonth }: CreateExpenseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "כללי",
    customCategory: "",
    currency: "ILS",
    payment_method: 'credit_card' as PaymentMethod,
    notes: '',
    has_reminder: false,
    reminder_days_before: 0,
    reminder_notification: true,
    reminder_email: false,
  });
  const [date, setDate] = useState<Date>(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openCurrencyPopover, setOpenCurrencyPopover] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [budget, setBudget] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'bimonthly' | 'quarterly' | 'yearly'>('monthly');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) throw new Error("Invalid amount");
      
      const finalCategory = selectedCategory.value === "אחר" ? formData.customCategory : selectedCategory.value;
      
      if (isRecurring) {
        // For recurring expenses, create entries based on the selected frequency
        const currentDate = new Date();
        const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // December 31st of current year
        const monthsToCreate = [];
        let monthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), recurringDay);
        
        // Adjust for timezone offset
        monthDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        while (monthDate <= endOfYear) {
          monthsToCreate.push(new Date(monthDate));
          
          // Calculate next date based on frequency
          switch (recurringFrequency) {
            case 'monthly':
              monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, recurringDay);
              break;
            case 'bimonthly':
              monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, recurringDay);
              break;
            case 'quarterly':
              monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 3, recurringDay);
              break;
            case 'yearly':
              monthDate = new Date(monthDate.getFullYear() + 1, monthDate.getMonth(), recurringDay);
              break;
          }
          // Set to noon for each new date to avoid timezone issues
          monthDate.setHours(12, 0, 0, 0);
        }
        
        // Create all recurring expenses with reminder settings
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .insert(
            monthsToCreate.map(monthDate => ({
              name: formData.name,
              amount: amount,
              date: monthDate.toISOString(),
              transaction_date: monthDate.toISOString(),
              category: finalCategory,
              currency: selectedCurrency.value,
              user_id: user.id,
              is_recurring: true,
              recurring_day: recurringDay,
              recurring_frequency: recurringFrequency,
              payment_method: formData.payment_method,
              notes: formData.notes,
              has_reminder: formData.has_reminder,
              reminder_days_before: formData.reminder_days_before,
              reminder_notification: formData.reminder_notification,
              reminder_email: formData.reminder_email
            }))
          )
          .select();
        
        if (expensesError) throw expensesError;
        
        // Create the recurring expense template
        const { error: recurringError } = await supabase
          .from('recurring_expenses')
          .insert([
            {
              user_id: user.id,
              name: formData.name,
              amount: amount,
              category: finalCategory,
              currency: selectedCurrency.value,
              recurring_day: recurringDay,
              recurring_frequency: recurringFrequency
            }
          ]);
        
        if (recurringError) throw recurringError;
        
        // Add all created expenses to the state
        expensesData.forEach(expense => onAddExpense({
          ...expense,
          payment_method: expense.payment_method as PaymentMethod,
          has_reminder: formData.has_reminder,
          reminder_days_before: formData.reminder_days_before,
          reminder_notification: formData.reminder_notification,
          reminder_email: formData.reminder_email
        }));
      } else {
        // For non-recurring expenses, create a single entry
        const expenseDate = new Date(date);
        expenseDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .insert([
            {
              name: formData.name,
              amount: amount,
              date: expenseDate.toISOString(),
              transaction_date: expenseDate.toISOString(),
              category: finalCategory,
              currency: selectedCurrency.value,
              user_id: user.id,
              is_recurring: false,
              payment_method: formData.payment_method,
              notes: formData.notes,
              has_reminder: formData.has_reminder,
              reminder_days_before: formData.reminder_days_before,
              reminder_notification: formData.reminder_notification,
              reminder_email: formData.reminder_email,
            }
          ])
          .select()
          .single();
        
        if (expenseError) throw expenseError;
        onAddExpense({
          ...expenseData,
          payment_method: expenseData.payment_method as PaymentMethod,
          has_reminder: formData.has_reminder,
          reminder_days_before: formData.reminder_days_before,
          reminder_notification: formData.reminder_notification,
          reminder_email: formData.reminder_email,
        });
      }
      
      toast.success("ההוצאה נוספה בהצלחה!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("שגיאה בהוספת ההוצאה");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stop event propagation to prevent dialog closing
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl" onClick={handlePopoverClick}>
        <DialogHeader>
          <DialogTitle className="text-right">הוסף הוצאה חדשה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">שם ההוצאה</Label>
                <Input
                  id="name"
                  placeholder="לדוגמה: קניות במכולת"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">סכום</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="הזן סכום..."
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label>מטבע</Label>
                <Select 
                  value={selectedCurrency.value}
                  onValueChange={(value) => {
                    const currency = currencies.find(c => c.value === value);
                    if (currency) setSelectedCurrency(currency);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מטבע" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>קטגוריה</Label>
                <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryPopover}
                      className="justify-between"
                    >
                      {selectedCategory.label}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="חפש קטגוריה..." />
                      <CommandList>
                        <CommandEmpty>לא נמצאו קטגוריות</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.value}
                              value={category.value}
                              onSelect={() => {
                                setSelectedCategory(category);
                                setOpenCategoryPopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCategory.value === category.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>תאריך</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : <span>בחר תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      fromDate={new Date(2000, 0, 1)}
                      toDate={new Date(2100, 11, 31)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked);
                      if (checked) {
                        setDate(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), recurringDay));
                      }
                    }}
                  />
                  <Label htmlFor="is_recurring">הוצאה חוזרת</Label>
                </div>

                {isRecurring && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recurringDay">יום בחודש</Label>
                        <Input
                          id="recurringDay"
                          type="number"
                          min="1"
                          max="31"
                          value={recurringDay}
                          onChange={(e) => {
                            const day = parseInt(e.target.value);
                            if (day >= 1 && day <= 31) {
                              setRecurringDay(day);
                              setDate(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day));
                            }
                          }}
                          required={isRecurring}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recurring_frequency">תדירות</Label>
                        <Select
                          value={recurringFrequency}
                          onValueChange={(value) => {
                            setRecurringFrequency(value as typeof recurringFrequencies[number]['value']);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר תדירות" />
                          </SelectTrigger>
                          <SelectContent>
                            {recurringFrequencies.map((frequency) => (
                              <SelectItem key={frequency.value} value={frequency.value}>
                                {frequency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {selectedCategory.value === "אחר" && (
            <div className="grid gap-2">
              <Label htmlFor="customCategory">קטגוריה מותאמת אישית</Label>
              <Input
                id="customCategory"
                placeholder="הזן קטגוריה מותאמת אישית"
                value={formData.customCategory}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="payment_method">אמצעי תשלום</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אמצעי תשלום" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הוסף הערות נוספות..."
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>הגדר תזכורת</Label>
              <Switch
                checked={formData.has_reminder}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_reminder: checked }))}
              />
            </div>
            
            {formData.has_reminder && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div>
                  <Label htmlFor="reminder_days_before">מספר ימים לפני התשלום</Label>
                  <Input
                    id="reminder_days_before"
                    type="number"
                    min="0"
                    value={formData.reminder_days_before}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_days_before: parseInt(e.target.value) || 0 }))}
                    required={formData.has_reminder}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>אמצעי התראה</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminder_notification">התראה במערכת</Label>
                      <Switch
                        id="reminder_notification"
                        checked={formData.reminder_notification}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminder_notification: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminder_email">התראה במייל</Label>
                      <Switch
                        id="reminder_email"
                        checked={formData.reminder_email}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminder_email: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="ml-3" disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "מוסיף..." : "הוסף הוצאה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
