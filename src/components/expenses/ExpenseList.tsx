import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Expense } from "@/types/expense";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, RefreshCw, Edit2, ArrowUpDown, Search, Pencil, ChevronDown, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

type SortField = 'name' | 'category' | 'date' | 'amount' | 'payment_method' | 'is_recurring';
type SortDirection = 'asc' | 'desc';
type PaymentMethod = 'cash' | 'credit' | 'bank_transfer' | 'standing_order';

export const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
      case "USD": return "$";
      case "EUR": return "€";
      case "ILS": 
      default: return "₪";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedExpenses = useMemo(() => {
    // First, filter the expenses
    let result = expenses.filter(expense => {
      const searchLower = searchTerm.toLowerCase();
      return (
        expense.name.toLowerCase().includes(searchLower) ||
        (expense.category?.toLowerCase() || '').includes(searchLower) ||
        expense.amount.toString().includes(searchTerm)
      );
    });

    // Then, sort the filtered expenses
    return result.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'category':
          return multiplier * ((a.category || '').localeCompare(b.category || ''));
        case 'amount':
          return multiplier * (a.amount - b.amount);
        case 'date':
          // Use transaction_date for sorting if available, otherwise fall back to date
          const dateA = a.transaction_date || a.date;
          const dateB = b.transaction_date || b.date;
          return multiplier * (new Date(dateA).getTime() - new Date(dateB).getTime());
        case 'payment_method':
          return multiplier * ((a.payment_method || '').localeCompare(b.payment_method || ''));
        case 'is_recurring':
          return multiplier * (Number(a.is_recurring) - Number(b.is_recurring));
        default:
          return 0;
      }
    });
  }, [expenses, searchTerm, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return (
      <ArrowUpDown 
        className={`h-4 w-4 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} 
      />
    );
  };

  const toggleRow = (expenseId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(expenseId)) {
      newExpandedRows.delete(expenseId);
    } else {
      newExpandedRows.add(expenseId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const methods = {
      cash: 'מזומן',
      credit: 'כרטיס אשראי',
      standing_order: 'הוראת קבע',
      bank_transfer: 'העברה בנקאית'
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש הוצאות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select
          value={sortField}
          onValueChange={(value) => handleSort(value as SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="מיין לפי" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">תאריך</SelectItem>
            <SelectItem value="name">שם הוצאה</SelectItem>
            <SelectItem value="category">קטגוריה</SelectItem>
            <SelectItem value="amount">סכום</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown 
            className={`h-4 w-4 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} 
          />
        </Button>
      </div>

      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow className="flex flex-row-reverse">
              <TableHead className="text-right flex-1">פעולות</TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('is_recurring')}
                  className="hover:bg-transparent w-full"
                >
                  הוצאה חודשית חוזרת {getSortIcon('is_recurring')}
                </Button>
              </TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('payment_method')}
                  className="hover:bg-transparent w-full"
                >
                  אמצעי תשלום {getSortIcon('payment_method')}
                </Button>
              </TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('amount')}
                  className="hover:bg-transparent w-full"
                >
                  סכום {getSortIcon('amount')}
                </Button>
              </TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('date')}
                  className="hover:bg-transparent w-full"
                >
                  תאריך {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('category')}
                  className="hover:bg-transparent w-full"
                >
                  קטגוריה {getSortIcon('category')}
                </Button>
              </TableHead>
              <TableHead className="text-right flex-1">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="hover:bg-transparent w-full"
                >
                  הוצאה {getSortIcon('name')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'לא נמצאו הוצאות התואמות את החיפוש' : 'אין הוצאות להצגה'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedExpenses.map((expense) => (
                <TableRow 
                  key={expense.id}
                  className="flex flex-row-reverse hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell className="text-center flex-1">
                    <div className="flex gap-2 justify-center">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(expense);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(expense.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex-1">
                    {expense.is_recurring ? `כן (יום ${expense.recurring_day})` : 'לא'}
                  </TableCell>
                  <TableCell className="text-right flex-1">
                    {expense.payment_method ? getPaymentMethodLabel(expense.payment_method as PaymentMethod) : '-'}
                  </TableCell>
                  <TableCell className="text-right flex-1">
                    {expense.amount.toLocaleString()} {getCurrencySymbol(expense.currency)}
                  </TableCell>
                  <TableCell className="text-right flex-1">
                    {format(new Date(expense.transaction_date || expense.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right flex-1">{expense.category}</TableCell>
                  <TableCell className="text-right flex-1">{expense.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
