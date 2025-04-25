import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Expense } from "@/types/expense";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, RefreshCw, Edit2, ArrowUpDown, Search, Pencil, ChevronDown, CreditCard, MessageSquare, Filter, ChevronRight, X, Calendar, Currency, Tag, CheckSquare, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import hebrewFont from '@/fonts/NotoSansHebrew-Regular.ttf';
import logo from '@/logo.png';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

type SortField = 'name' | 'category' | 'date' | 'amount' | 'payment_method' | 'is_recurring';
type SortDirection = 'asc' | 'desc';
type PaymentMethod = 'cash' | 'credit' | 'bank_transfer' | 'standing_order';

// Helper functions
const getCurrencySymbol = (currency?: string) => {
  switch (currency) {
    case "USD": return "$";
    case "EUR": return "€";
    case "ILS": 
    default: return "₪";
  }
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

// Register Hebrew font
Font.register({
  family: 'Noto Sans Hebrew',
  src: hebrewFont
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Noto Sans Hebrew',
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
    objectFit: 'contain',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5f7a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  expenseCard: {
    marginBottom: 25,
    padding: 20,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    textAlign: 'right',
  },
  expenseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 12,
    color: '#1e293b',
    textAlign: 'right',
    marginRight: 5,
  },
  notesSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
  },
  notesLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  notesText: {
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 1.5,
    textAlign: 'right',
  },
  summary: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
    color: '#1e293b',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    border: '1px solid #e5e7eb',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#0f766e',
    borderRadius: 4,
  },
  summaryTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 15,
  },
});

// Create PDF document component
const MyDocument = ({ expenses }: { expenses: Expense[] }) => {
  // Calculate totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'אחר';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src={logo}
            style={styles.logo}
          />
          <View>
            <Text style={styles.title}>דוח הוצאות</Text>
            <Text style={styles.subtitle}>
              תאריך הפקה: {new Date().toLocaleDateString('he-IL')}
            </Text>
          </View>
        </View>

        {expenses.map((expense, index) => (
          <View key={index} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseAmount}>
                {expense.currency === 'ILS' ? 
                  `₪${new Intl.NumberFormat('he-IL', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(expense.amount)}` :
                  new Intl.NumberFormat('he-IL', {
                    style: 'currency',
                    currency: expense.currency || 'ILS',
                    currencyDisplay: 'narrowSymbol',
                  }).format(expense.amount)
                }
              </Text>
              <Text style={styles.expenseTitle}>{expense.name}</Text>
            </View>

            <View style={styles.expenseDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>
                  {new Date(expense.date).toLocaleDateString('he-IL')}
                </Text>
                <Text style={styles.detailLabel}>:חויב בתאריך</Text>
              </View>

              {expense.transaction_date && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>
                    {new Date(expense.transaction_date).toLocaleDateString('he-IL')}
                  </Text>
                  <Text style={styles.detailLabel}>:תאריך העסקה</Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>{expense.category || 'אחר'}</Text>
                <Text style={styles.detailLabel}>:קטגוריה</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>
                  {expense.is_recurring ? `כן (יום ${expense.recurring_day})` : 'לא'}
                </Text>
                <Text style={styles.detailLabel}>:הוצאה חודשית חוזרת</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>
                  {getPaymentMethodLabel(expense.payment_method as PaymentMethod)}
                </Text>
                <Text style={styles.detailLabel}>:אמצעי תשלום</Text>
              </View>

              {expense.tags && expense.tags.length > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>
                    {expense.tags.join(', ')}
                  </Text>
                  <Text style={styles.detailLabel}>:תגיות</Text>
                </View>
              )}
            </View>

            {expense.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>:הערות</Text>
                <Text style={styles.notesText}>{expense.notes}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>סיכום הוצאות לפי קטגוריה</Text>
          {Object.entries(categoryTotals).map(([category, total]) => (
            <View key={category} style={styles.summaryItem}>
              <Text style={{ textAlign: 'left', color: '#0f766e' }}>
                {`₪${new Intl.NumberFormat('he-IL', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(total)}`}
              </Text>
              <Text style={{ textAlign: 'right', color: '#1e293b' }}>{category}</Text>
            </View>
          ))}
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalText}>
              {`₪${new Intl.NumberFormat('he-IL', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(totalAmount)}`}
            </Text>
            <Text style={styles.summaryTotalText}>סה"כ</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>הופק בתאריך: {new Date().toLocaleDateString('he-IL')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    name: '',
    amount: '',
    date: '',
    category: '',
    payment_method: '',
  });
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
      // Apply search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        expense.name.toLowerCase().includes(searchLower) ||
        (expense.category?.toLowerCase() || '').includes(searchLower) ||
        expense.amount.toString().includes(searchTerm);

      // Apply column filters
      const matchesName = filters.name === '' || 
        expense.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesAmount = filters.amount === '' || 
        expense.amount.toString().includes(filters.amount);
      const matchesDate = filters.date === '' || 
        format(new Date(expense.date), 'dd/MM/yyyy').includes(filters.date);
      const matchesCategory = filters.category === '' || 
        expense.category === filters.category;
      const matchesPaymentMethod = filters.payment_method === '' || 
        expense.payment_method === filters.payment_method;

      return matchesSearch && 
             matchesName && 
             matchesAmount && 
             matchesDate && 
             matchesCategory && 
             matchesPaymentMethod;
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
          return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'payment_method':
          return multiplier * ((a.payment_method || '').localeCompare(b.payment_method || ''));
        case 'is_recurring':
          return multiplier * (Number(a.is_recurring) - Number(b.is_recurring));
        default:
          return 0;
      }
    });
  }, [expenses, searchTerm, sortField, sortDirection, filters]);

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

  const clearFilter = (filter: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filter]: '',
    });
  };

  const uniqueCategories = useMemo(() => 
    Array.from(new Set(expenses.map(e => e.category))), 
    [expenses]
  );

  const uniquePaymentMethods = useMemo(() => 
    Array.from(new Set(expenses.map(e => e.payment_method).filter(Boolean))), 
    [expenses]
  );

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const toggleExpenseDetails = (expenseId: string) => {
    setExpandedExpense(expandedExpense === expenseId ? null : expenseId);
  };

  const toggleExpenseSelection = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const handleBulkDelete = () => {
    if (onDelete) {
      selectedExpenses.forEach(id => onDelete(id));
      setSelectedExpenses(new Set());
    }
  };

  const selectedExpensesData = useMemo(() => 
    expenses.filter(expense => selectedExpenses.has(expense.id)),
    [expenses, selectedExpenses]
  );

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

      {/* Filter Indicators */}
      {Object.entries(filters).some(([_, value]) => value !== '') && (
        <div className="flex flex-wrap gap-2 items-center p-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">סינון פעיל:</span>
          {filters.name && (
            <Badge variant="secondary" className="flex items-center gap-1">
              שם: {filters.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => clearFilter('name')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.amount && (
            <Badge variant="secondary" className="flex items-center gap-1">
              סכום: {filters.amount}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => clearFilter('amount')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              תאריך: {filters.date}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => clearFilter('date')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              קטגוריה: {filters.category}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => clearFilter('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.payment_method && (
            <Badge variant="secondary" className="flex items-center gap-1">
              אמצעי תשלום: {filters.payment_method}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => clearFilter('payment_method')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-sm"
            onClick={() => {
              setFilters({
                name: '',
                amount: '',
                date: '',
                category: '',
                payment_method: '',
              });
            }}
          >
            נקה את כל הסינונים
          </Button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedExpenses.size > 0 && expenses.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              נבחרו {selectedExpenses.size} הוצאות
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExpenses(new Set())}
              className="h-8"
            >
              <X className="h-4 w-4 mr-2" />
              בטל בחירה
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <PDFDownloadLink
              document={<MyDocument expenses={selectedExpensesData} />}
              fileName={`expenses_${format(new Date(), 'dd-MM-yyyy')}.pdf`}
            >
              {({ loading }) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'טוען...' : 'ייצא ל-PDF'}
                </Button>
              )}
            </PDFDownloadLink>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  מחק נבחרים
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-right">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">מחיקת הוצאות נבחרות</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">
                    האם אתה בטוח שברצונך למחוק את {selectedExpenses.size} ההוצאות שנבחרו?
                    פעולה זו אינה ניתנת לביטול.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    מחק נבחרים
                  </AlertDialogAction>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow className="flex flex-row-reverse">
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <span>פעולות</span>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('is_recurring')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    הוצאה חודשית חוזרת {getSortIcon('is_recurring')}
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('payment_method')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    אמצעי תשלום {getSortIcon('payment_method')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {uniquePaymentMethods.map(method => (
                        <DropdownMenuItem
                          key={method}
                          onClick={() => handleFilterChange('payment_method', method)}
                        >
                          {getPaymentMethodLabel(method as PaymentMethod)}
                        </DropdownMenuItem>
                      ))}
                      {filters.payment_method && (
                        <DropdownMenuItem onClick={() => clearFilter('payment_method')}>
                          נקה סינון
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('amount')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    סכום {getSortIcon('amount')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Input
                        placeholder="חפש לפי סכום"
                        value={filters.amount}
                        onChange={(e) => handleFilterChange('amount', e.target.value)}
                        className="w-full"
                      />
                      {filters.amount && (
                        <DropdownMenuItem onClick={() => clearFilter('amount')}>
                          נקה סינון
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('date')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    תאריך {getSortIcon('date')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Input
                        placeholder="חפש לפי תאריך"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="w-full"
                      />
                      {filters.date && (
                        <DropdownMenuItem onClick={() => clearFilter('date')}>
                          נקה סינון
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('category')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    קטגוריה {getSortIcon('category')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {uniqueCategories.map(category => (
                        <DropdownMenuItem
                          key={category}
                          onClick={() => handleFilterChange('category', category)}
                        >
                          {category}
                        </DropdownMenuItem>
                      ))}
                      {filters.category && (
                        <DropdownMenuItem onClick={() => clearFilter('category')}>
                          נקה סינון
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-right flex-1">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    הוצאה {getSortIcon('name')}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Input
                        placeholder="חפש לפי שם"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        className="w-full"
                      />
                      {filters.name && (
                        <DropdownMenuItem onClick={() => clearFilter('name')}>
                          נקה סינון
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                <React.Fragment key={expense.id}>
                  <TableRow 
                    className={cn(
                      "flex flex-row-reverse hover:bg-muted/50 cursor-pointer",
                      selectedExpenses.has(expense.id) && "bg-muted/30"
                    )}
                    onClick={() => toggleExpenseDetails(expense.id)}
                  >
                    <TableCell className="text-center flex-1">
                      <div className="flex items-center justify-end gap-2">
                        {expense.has_reminder && (
                          <Bell className="h-4 w-4 text-yellow-500 mr-2" aria-label="תזכורת מוגדרת" />
                        )}
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
                        {expenses.length > 1 && (
                          <Checkbox
                            checked={selectedExpenses.has(expense.id)}
                            onCheckedChange={() => toggleExpenseSelection(expense.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
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
                      {format(new Date(expense.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right flex-1">{expense.category}</TableCell>
                    <TableCell className="text-right flex-1">{expense.name}</TableCell>
                  </TableRow>
                  {expandedExpense === expense.id && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <MessageSquare className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">הערות</h4>
                                <p className="mt-1">{expense.notes || 'אין הערות'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">אמצעי תשלום</h4>
                                <p className="mt-1">{getPaymentMethodLabel(expense.payment_method as PaymentMethod)}</p>
                              </div>
                            </div>

                            {expense.is_recurring && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                  <RefreshCw className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">הוצאה חודשית חוזרת</h4>
                                  <p className="mt-1">
                                    כן, ביום {expense.recurring_day} בכל חודש
                                    {expense.recurring_frequency && (
                                      <span className="text-muted-foreground">
                                        {' '}({expense.recurring_frequency === 'monthly' ? 'חודשי' :
                                          expense.recurring_frequency === 'bimonthly' ? 'דו-חודשי' :
                                          expense.recurring_frequency === 'quarterly' ? 'רבעוני' :
                                          expense.recurring_frequency === 'yearly' ? 'שנתי' : ''})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Details */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">תאריך עסקה</h4>
                                <p className="mt-1">{format(new Date(expense.transaction_date || expense.date), 'dd/MM/yyyy')}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Currency className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">מטבע</h4>
                                <p className="mt-1">{expense.currency || 'ILS'}</p>
                              </div>
                            </div>

                            {expense.has_reminder && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                  <Bell className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">תזכורת</h4>
                                  <div className="mt-1 space-y-1">
                                    <p>תזכורת {expense.reminder_days_before} ימים לפני התשלום</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="h-3 w-3" />
                                        {expense.reminder_notification ? 'התראה במערכת' : 'ללא התראה במערכת'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="h-3 w-3" />
                                        {expense.reminder_email ? 'התראה במייל' : 'ללא התראה במייל'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {expense.tags && expense.tags.length > 0 && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                  <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm text-muted-foreground">תגיות</h4>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {expense.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="px-2 py-1">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(expense);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              ערוך
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(expense.id);
                              }}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              מחק
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
