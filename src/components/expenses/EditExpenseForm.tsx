import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod } from "@/types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditExpenseFormProps {
  expense: Expense;
  onClose: () => void;
  onUpdateExpense: (updatedExpense: Expense) => void;
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

const paymentMethods = [
  { value: 'cash', label: 'מזומן' },
  { value: 'credit', label: 'כרטיס אשראי' },
  { value: 'standing_order', label: 'הוראת קבע' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
] as const;

const recurringFrequencies = [
  { value: 'monthly', label: 'חודשי' },
  { value: 'bimonthly', label: 'כל חודשיים' },
  { value: 'quarterly', label: 'רבעוני' },
  { value: 'yearly', label: 'שנתי' },
] as const;

interface FormData {
  name: string;
  amount: string;
  category: string;
  customCategory: string;
  currency: string;
  payment_method: PaymentMethod;
  notes: string;
  date: string;
  is_recurring: boolean;
  recurring_day: number;
  has_reminder: boolean;
  reminder_days_before: number;
  reminder_notification: boolean;
  reminder_email: boolean;
}

export function EditExpenseForm({ expense, onClose, onUpdateExpense }: EditExpenseFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: expense.name,
    amount: expense.amount.toString(),
    category: expense.category || '',
    customCategory: '',
    currency: expense.currency,
    payment_method: expense.payment_method,
    notes: expense.notes || '',
    date: expense.date,
    is_recurring: expense.is_recurring,
    recurring_day: expense.recurring_day || 1,
    has_reminder: expense.has_reminder || false,
    reminder_days_before: expense.reminder_days_before || 0,
    reminder_notification: expense.reminder_notification || true,
    reminder_email: expense.reminder_email || false
  });
  const [date, setDate] = useState<Date>(new Date(expense.date));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openCurrencyPopover, setOpenCurrencyPopover] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find(c => c.value === expense.category) || categories[0]
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    currencies.find(c => c.value === expense.currency) || currencies[0]
  );

  useEffect(() => {
    if (expense.category && !categories.some(c => c.value === expense.category)) {
      setSelectedCategory(categories.find(c => c.value === "אחר") || categories[0]);
      setFormData(prev => ({ ...prev, customCategory: expense.category || "" }));
    }
  }, [expense.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(formData.amount) || 0;
      
      const finalCategory = selectedCategory.value === "אחר" && formData.customCategory
        ? formData.customCategory
        : selectedCategory.value;
      
      const isRecurring = formData.is_recurring;
      const recurringDay = formData.recurring_day;
      
      const { data, error } = await supabase
        .from('expenses')
        .update({
          name: formData.name,
          amount: amount,
          category: finalCategory,
          date: date.toISOString(),
          currency: selectedCurrency.value,
          payment_method: formData.payment_method as PaymentMethod,
          notes: formData.notes,
          is_recurring: isRecurring,
          recurring_day: isRecurring ? recurringDay : null,
          has_reminder: formData.has_reminder,
          reminder_days_before: formData.reminder_days_before,
          reminder_notification: formData.reminder_notification,
          reminder_email: formData.reminder_email,
        })
        .eq('id', expense.id)
        .select()
        .single();
      
      if (error) throw error;

      const updatedExpense: Expense = {
        ...data,
        is_recurring: isRecurring,
        recurring_day: isRecurring ? recurringDay : null,
        has_reminder: formData.has_reminder,
        reminder_days_before: formData.reminder_days_before,
        reminder_notification: formData.reminder_notification,
        reminder_email: formData.reminder_email,
        payment_method: formData.payment_method as PaymentMethod
      };
      
      onUpdateExpense(updatedExpense);
      onClose();
      toast.success("ההוצאה עודכנה בהצלחה!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה בעדכון ההוצאה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">ערוך הוצאה</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div className="grid gap-2">
            <Label htmlFor="name">שם ההוצאה</Label>
            <Input
              id="name"
              placeholder="לדוגמה: קניות במכולת"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
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
            
            <div className="grid gap-2">
              <Label>מטבע</Label>
              <Popover open={openCurrencyPopover} onOpenChange={setOpenCurrencyPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCurrencyPopover}
                    className="justify-between"
                  >
                    {selectedCurrency.label}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {currencies.map((currency) => (
                          <CommandItem
                            key={currency.value}
                            value={currency.value}
                            onSelect={() => {
                              setSelectedCurrency(currency);
                              setFormData(prev => ({ ...prev, currency: currency.value }));
                              setOpenCurrencyPopover(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCurrency.value === currency.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {currency.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid gap-2">
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
                />
              </PopoverContent>
            </Popover>
          </div>
          
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
          
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, is_recurring: checked }));
                }}
              />
              <Label htmlFor="is_recurring">הוצאה חוזרת</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurring_day">יום בחודש</Label>
                    <Input
                      id="recurring_day"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.recurring_day}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day >= 1 && day <= 31) {
                          setFormData(prev => ({ ...prev, recurring_day: day }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="payment_method">אמצעי תשלום</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) =>
                setFormData(prev => ({ ...prev, payment_method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אמצעי תשלום" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              {isSubmitting ? "מעדכן..." : "עדכן הוצאה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
