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

export function CreateExpenseForm({ onClose, onAddExpense, selectedMonth }: CreateExpenseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "כללי",
    customCategory: "",
    currency: "ILS",
    payment_method: 'credit_card' as PaymentMethod,
    notes: '',
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
        // For recurring expenses, create entries for all months up to the end of the current year
        const currentDate = new Date();
        const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // December 31st of current year
        const monthsToCreate = [];
        let monthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), recurringDay);
        
        while (monthDate <= endOfYear) {
          monthsToCreate.push(new Date(monthDate));
          monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, recurringDay);
        }
        
        // Create all recurring expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .insert(
            monthsToCreate.map(monthDate => ({
              name: formData.name,
              amount: amount,
              date: monthDate.toISOString(),
              category: finalCategory,
              currency: selectedCurrency.value,
              user_id: user.id,
              is_recurring: true,
              recurring_day: recurringDay,
              recurring_frequency: 'monthly' as const,
              payment_method: formData.payment_method,
              notes: formData.notes,
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
              recurring_frequency: 'monthly' as const,
            }
          ]);
        
        if (recurringError) throw recurringError;
        
        // Add all created expenses to the state
        expensesData.forEach(expense => onAddExpense({
          ...expense,
          payment_method: expense.payment_method as PaymentMethod,
        }));
      } else {
        // For non-recurring expenses, create a single entry
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .insert([
            {
              name: formData.name,
              amount: amount,
              date: date.toISOString(),
              category: finalCategory,
              currency: selectedCurrency.value,
              user_id: user.id,
              is_recurring: false,
              payment_method: formData.payment_method,
              notes: formData.notes,
            }
          ])
          .select()
          .single();
        
        if (expenseError) throw expenseError;
        onAddExpense({
          ...expenseData,
          payment_method: expenseData.payment_method as PaymentMethod,
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
                      variant="outline"
                      className="w-full justify-start text-right"
                      disabled={isRecurring}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {isRecurring 
                        ? `יום ${recurringDay} בכל חודש`
                        : date ? format(date, "dd/MM/yyyy") : "בחר תאריך"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      disabled={isRecurring}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>הוצאה חוזרת חודשית</Label>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked);
                      if (checked) {
                        setDate(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), recurringDay));
                      }
                    }}
                  />
                </div>
                
                {isRecurring && (
                  <div>
                    <Label htmlFor="recurringDay">יום בחודש לחיוב</Label>
                    <Input
                      id="recurringDay"
                      type="number"
                      min="1"
                      max="31"
                      value={recurringDay}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        setRecurringDay(day);
                        setDate(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day));
                      }}
                      required={isRecurring}
                    />
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
