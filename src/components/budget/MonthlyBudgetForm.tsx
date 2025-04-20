import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface MonthlyBudgetFormProps {
  initialBudget: number | null;
  onUpdateBudget: (newBudget: number) => Promise<void>;
  onClose: () => void;
  selectedMonth: Date;
}

export function MonthlyBudgetForm({ initialBudget, onUpdateBudget, onClose, selectedMonth }: MonthlyBudgetFormProps) {
  const [budget, setBudget] = useState(initialBudget?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newBudget = parseFloat(budget);
      if (isNaN(newBudget)) {
        throw new Error('Invalid budget amount');
      }
      await onUpdateBudget(newBudget);
      onClose();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את התקציב. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>הגדר תקציב חודשי</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedMonth, 'MMMM yyyy', { locale: he })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">סכום התקציב</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="הזן סכום"
              required
              min="0"
              step="0.01"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "מעדכן..." : "שמור תקציב"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 