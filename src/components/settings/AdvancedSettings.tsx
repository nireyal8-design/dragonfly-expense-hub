import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, Table, Calendar, Save, Trash2, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { addDays } from "date-fns";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Label } from "@/components/ui/label";
import html2canvas from 'html2canvas';
import { PaymentMethod, Expense } from "@/types/expense";
import { DateRange } from "react-day-picker";
import { CheckedState } from "@radix-ui/react-checkbox";

// Types
interface ExportSettings {
  dateRange: { from: Date; to: Date } | null;
  categories: string[];
  groupBy: "category" | "month" | "none";
  minAmount: number;
  maxAmount: number;
  includeTags: boolean;
  includeNotes: boolean;
  includePaymentMethod: boolean;
}

interface CustomReport {
  id: string;
  name: string;
  sections: ReportSection[];
  schedule: "none" | "daily" | "weekly" | "monthly";
  scheduleTime?: string; // For daily reports
  scheduleDay?: number; // 0-6 for weekly (Sunday-Saturday), 1-31 for monthly
  recipientEmail?: string;
}

interface ReportSection {
  id: string;
  type: "total" | "chart" | "table";
  title: string;
  config: {
    dateRange?: {
      from: Date;
      to: Date;
    };
    filters?: {
      categories?: string[];
      paymentMethods?: PaymentMethod[];
      minAmount?: number;
      maxAmount?: number;
      currencies?: string[];
    };
    columns?: {
      date: boolean;
      name: boolean;
      amount: boolean;
      category: boolean;
      currency: boolean;
      paymentMethod: boolean;
      notes: boolean;
    };
    groupBy?: "none" | "category" | "paymentMethod" | "currency" | "month";
    sortBy?: "date" | "amount" | "name";
    sortOrder?: "asc" | "desc";
  };
  enabled: boolean;
}

interface TableColumns {
  paymentMethod?: boolean;
  notes?: boolean;
}

const paymentMethods = [
  { value: 'cash', label: 'מזומן' },
  { value: 'credit', label: 'כרטיס אשראי' },
  { value: 'standing_order', label: 'הוראת קבע' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
] as const;

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'ILS':
      return '₪';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency;
  }
}

// Add this at the top of your file, outside any function
const formatHebrewText = (text: string) => {
  const parts = text.split(/(\d+)/);
  return parts.map((part, index) => {
    if (index % 2 === 1) return part;
    return [...part].reverse().join('');
  }).join('');
};

// Add this at the top of your file
const logoHtml = `
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
    <div style="position: relative; width: 28px; height: 28px;">
      <!-- Wallet Icon -->
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a5f7a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
      <!-- Trending Up Icon -->
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: -8px; right: -8px;">
        <path d="m23 6-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
    </div>
    <span style="font-size: 24px; font-weight: bold; color: #1a5f7a;">SpendWise</span>
  </div>
`;

const getColumnLabel = (key: string): string => {
  const labels: Record<string, string> = {
    date: "תאריך",
    name: "שם",
    amount: "סכום",
    category: "קטגוריה",
    currency: "מטבע",
    paymentMethod: "אמצעי תשלום",
    notes: "הערות"
  };
  return labels[key] || key;
};

const handleDateRangeChange = (dateRange: DateRange) => {
  if (!dateRange.from || !dateRange.to) return;
  return { from: dateRange.from, to: dateRange.to };
};

const handleCheckboxChange = (checked: CheckedState): boolean => {
  return checked === true;
};

interface DatePickerWithRangeProps {
  date?: {
    from: Date;
    to: Date;
  };
  onDateChange: (date: { from: Date; to: Date }) => void;
}

export function AdvancedSettings() {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [customFileName, setCustomFileName] = useState("");
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
    categories: [],
    groupBy: "none",
    minAmount: 0,
    maxAmount: Infinity,
    includeTags: true,
    includeNotes: true,
    includePaymentMethod: true,
  });
  const [savedReports, setSavedReports] = useState<CustomReport[]>(() => {
    const saved = localStorage.getItem('savedReports');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  useEffect(() => {
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
  }, [savedReports]);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      // Fetch expenses with filters
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      if (dateRange.from && dateRange.to) {
        query = query
          .gte('date', dateRange.from.toISOString())
          .lte('date', dateRange.to.toISOString());
      }

      const { data: expenses, error: expensesError } = await query;

      if (expensesError) throw expensesError;

      // Filter out recurring expenses that are outside the date range
      const filteredExpenses = expenses.filter(expense => {
        if (!expense.is_recurring) return true;
        
        const expenseDate = new Date(expense.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        
        // For recurring expenses, only include them if their date falls within the range
        return expenseDate >= fromDate && expenseDate <= toDate;
      });

      // Cast the expenses data to the Expense type
      const typedExpenses = filteredExpenses as Expense[];

      if (exportFormat === "csv") {
        // Add BOM for UTF-8 encoding
        const BOM = '\ufeff';
        
        // Define headers
        const headers = ["תאריך", "שם", "סכום", "קטגוריה", "מטבע"];
        if (exportSettings.includeTags) headers.push("תגיות");
        if (exportSettings.includeNotes) headers.push("הערות");
        if (exportSettings.includePaymentMethod) headers.push("אמצעי תשלום");

        // Process data with proper escaping
        const csvData = typedExpenses.map((expense: any) => {
          // Ensure amount is treated as a single value
          const amount = typeof expense.amount === 'string' ? 
            parseFloat(expense.amount.replace(/,/g, '')) : 
            expense.amount;

          // Format each field and handle potential commas in text
          const row = [
            `"${new Date(expense.date).toLocaleDateString('he-IL')}"`,
            `"${(expense.name || '').replace(/"/g, '""')}"`,
            `"${amount.toLocaleString('he-IL')}"`,
            `"${(expense.category || '').replace(/"/g, '""')}"`,
            `"${expense.currency || 'ILS'}"`,
          ];

          // Add optional columns
          if (exportSettings.includeTags) {
            const tags = Array.isArray(expense.tags) ? expense.tags.join(', ') : '';
            row.push(`"${tags.replace(/"/g, '""')}"`);
          }
          if (exportSettings.includeNotes) {
            row.push(`"${(expense.notes || '').replace(/"/g, '""')}"`);
          }
          if (exportSettings.includePaymentMethod) {
            const paymentMethodLabel = paymentMethods.find(
              pm => pm.value === expense.payment_method
            )?.label || '';
            row.push(`"${paymentMethodLabel.replace(/"/g, '""')}"`);
          }

          return row;
        });

        // Create CSV content with proper line endings
        const csvContent = BOM + 
          headers.map(header => `"${header}"`).join(',') + '\r\n' +
          csvData.map(row => row.join(',')).join('\r\n');

        // Create and download file
        const blob = new Blob([csvContent], { 
          type: 'text/csv;charset=utf-8' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = customFileName || 
          `expenses_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.csv`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("הנתונים יוצאו בהצלחה");
      } else {
        // Create a temporary div for HTML content
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '800px';
        tempDiv.style.padding = '20px';
        tempDiv.dir = 'rtl';

        // Generate HTML content
        let htmlContent = `
          <html dir="rtl">
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
              
              body {
                font-family: 'Heebo', sans-serif;
                direction: rtl;
                padding: 20px;
              }
              
              .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
              }
              
              .report-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #1a1a1a;
              }
              
              .date-range {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                direction: rtl;
              }
              
              th {
                background-color: #22c55e;
                color: white;
                padding: 12px 8px;
                text-align: right;
                font-weight: bold;
                font-size: 14px;
              }
              
              td {
                padding: 10px 8px;
                border: 1px solid #ddd;
                text-align: right;
                font-size: 13px;
              }
              
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              
              .amount {
                text-align: left;
                direction: ltr;
                font-family: 'Arial', sans-serif;
              }
              
              .summary {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border: 1px solid #e9ecef;
              }
              
              .summary-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              
              .summary-item {
                margin: 5px 0;
                display: flex;
                justify-content: space-between;
              }
              
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #666;
                text-align: right;
                border-top: 1px solid #e9ecef;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              ${logoHtml}
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #666;">
                  תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}
                </div>
              </div>
            </div>
            <div class="report-title">דוח הוצאות</div>
        `;

        // Add date range if selected
        if (dateRange.from && dateRange.to) {
          htmlContent += `
            <div class="date-range">
              טווח תאריכים: ${dateRange.from.toLocaleDateString('he-IL')} - ${dateRange.to.toLocaleDateString('he-IL')}
            </div>
          `;
        }

        // Add expenses table
        htmlContent += `
          <table>
            <thead>
              <tr>
                <th>תאריך</th>
                <th>שם</th>
                <th>סכום</th>
                <th>קטגוריה</th>
                <th>מטבע</th>
              </tr>
            </thead>
            <tbody>
        `;

        // Group expenses by month
        const expensesByMonth = typedExpenses.reduce((acc, expense) => {
          const date = new Date(expense.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (!acc[monthKey]) {
            acc[monthKey] = [];
          }
          acc[monthKey].push(expense);
          return acc;
        }, {} as { [key: string]: Expense[] });

        // Sort months in descending order
        const sortedMonths = Object.keys(expensesByMonth).sort((a, b) => b.localeCompare(a));

        // Calculate totals while adding rows
        const categoryTotals: { [key: string]: number } = {};
        let totalAmount = 0;

        // Add expenses grouped by month
        sortedMonths.forEach(monthKey => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month)).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
          
          // Add month header
          htmlContent += `
            <div style="margin-top: 20px; margin-bottom: 10px;">
              <h2 style="font-size: 18px; font-weight: bold; color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
                ${monthName}
              </h2>
            </div>
          `;

          // Add table for this month
          htmlContent += `
            <table style="width: 100%; margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="text-align: right; padding: 8px; background-color: #f3f4f6;">תאריך</th>
                  <th style="text-align: right; padding: 8px; background-color: #f3f4f6;">שם</th>
                  <th style="text-align: right; padding: 8px; background-color: #f3f4f6;">סכום</th>
                  <th style="text-align: right; padding: 8px; background-color: #f3f4f6;">קטגוריה</th>
                  <th style="text-align: right; padding: 8px; background-color: #f3f4f6;">מטבע</th>
                </tr>
              </thead>
              <tbody>
          `;

          // Add expenses for this month
          expensesByMonth[monthKey].forEach(expense => {
            const date = new Date(expense.date).toLocaleDateString('he-IL');
            const amount = new Intl.NumberFormat('he-IL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(expense.amount);

            // Update totals
            const category = expense.category || 'אחר';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
            totalAmount += expense.amount;

            htmlContent += `
              <tr>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${date}</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${expense.name}</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;" class="amount">${amount} ${expense.currency || 'ILS'}</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${category}</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;">${expense.currency || 'ILS'}</td>
              </tr>
            `;
          });

          // Add monthly total
          const monthTotal = expensesByMonth[monthKey].reduce((sum, expense) => sum + expense.amount, 0);
          const formattedMonthTotal = new Intl.NumberFormat('he-IL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(monthTotal);

          htmlContent += `
              </tbody>
              <tfoot>
                <tr style="background-color: #f3f4f6;">
                  <td colspan="2" style="text-align: right; padding: 8px; font-weight: bold;">
                    סה"כ לחודש:
                  </td>
                  <td style="text-align: right; padding: 8px; font-weight: bold;" class="amount">
                    ${formattedMonthTotal} ${expensesByMonth[monthKey][0].currency || 'ILS'}
                  </td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;

        // Add summary section
        htmlContent += `
          <div class="summary">
            <div class="summary-title">סיכום הוצאות לפי קטגוריה</div>
        `;

        Object.entries(categoryTotals).forEach(([category, total]) => {
          const formattedTotal = new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
          }).format(total);

          htmlContent += `
            <div class="summary-item">
              <span>${category}</span>
              <span class="amount">${formattedTotal}</span>
            </div>
          `;
        });

        // Add total
        const formattedTotal = new Intl.NumberFormat('he-IL', {
          style: 'currency',
          currency: 'ILS'
        }).format(totalAmount);

        htmlContent += `
            <div class="summary-item" style="margin-top: 10px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
              <span>סה"כ</span>
              <span class="amount">${formattedTotal}</span>
            </div>
          </div>
        `;

        // Add footer
        htmlContent += `
            <div class="footer">
              הופק בתאריך: ${new Date().toLocaleDateString('he-IL')}
            </div>
          </body>
          </html>
        `;

        // Set the HTML content
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv);

        // Convert to PDF
        try {
          const canvas = await html2canvas(tempDiv, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            windowWidth: tempDiv.scrollWidth,
            windowHeight: tempDiv.scrollHeight
          });

          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          
          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = canvas.height * imgWidth / canvas.width;
          
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          let heightLeft = imgHeight;
          let position = 0;
          
          // Add image to PDF
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add new pages if content is longer than one page
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Save the PDF
          const filename = customFileName || 
            `expenses_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.pdf`;
          doc.save(filename);
          toast.success("הנתונים יוצאו בהצלחה");
        } finally {
          // Clean up
          document.body.removeChild(tempDiv);
        }
      }
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(`שגיאה בייצוא הנתונים: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveReport = () => {
    if (!selectedReport) return;
    
    const updatedReports = savedReports.map(report =>
      report.id === selectedReport.id ? selectedReport : report
    );
    
    setSavedReports(updatedReports);
    toast.success("הדוח נשמר בהצלחה");
  };

  const handleRunReport = async () => {
    if (!selectedReport) return;
    
    try {
      setIsExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Filter out recurring expenses that are outside the date range
      const filteredExpenses = expenses.filter(expense => {
        if (!expense.is_recurring) return true;
        
        const expenseDate = new Date(expense.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        
        // For recurring expenses, only include them if their date falls within the range
        return expenseDate >= fromDate && expenseDate <= toDate;
      });

      // Cast the expenses data to the Expense type
      const typedExpenses = filteredExpenses as Expense[];

      // Create a temporary div to hold our HTML content
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '800px'; // Fixed width for better PDF conversion
      tempDiv.style.padding = '20px';
      tempDiv.dir = 'rtl'; // Set RTL direction

      // Generate HTML content
      let htmlContent = `
        <html dir="rtl">
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
            
            body {
              font-family: 'Heebo', sans-serif;
              direction: rtl;
              padding: 20px;
            }
            
            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #1a1a1a;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin: 15px 0;
              color: #2c2c2c;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              direction: rtl;
            }
            
            th {
              background-color: #22c55e;
              color: white;
              padding: 10px;
              text-align: right;
              font-weight: bold;
            }
            
            td {
              padding: 8px;
              border: 1px solid #ddd;
              text-align: right;
            }
            
            .amount {
              text-align: left;
              direction: ltr;
            }
            
            .category-summary {
              margin: 15px 0;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 4px;
            }
            
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            ${logoHtml}
            <div style="text-align: left;">
              <div style="font-size: 12px; color: #666;">
                תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}
              </div>
            </div>
          </div>
          <div class="report-title">${selectedReport.name}</div>
      `;

      // Generate sections
      for (const section of selectedReport.sections) {
        if (section.enabled === false) continue;

        htmlContent += `<div class="section-title">${section.title}</div>`;

        if (section.type === "table") {
          // Get the selected columns from the section config
          const selectedColumns = section.config.columns as TableColumns || {};
          
          htmlContent += `
            <table>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>שם</th>
                  <th>סכום</th>
                  <th>קטגוריה</th>
                  <th>מטבע</th>
                  ${selectedColumns.paymentMethod ? '<th>אמצעי תשלום</th>' : ''}
                  ${selectedColumns.notes ? '<th>הערות</th>' : ''}
                </tr>
              </thead>
              <tbody>
          `;

          typedExpenses.forEach(expense => {
            // Format the date to show the actual transaction date
            const date = new Date(expense.date).toLocaleDateString('he-IL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            const amount = new Intl.NumberFormat('he-IL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(expense.amount);

            // Get payment method label
            const paymentMethodLabel = paymentMethods.find(
              pm => pm.value === expense.payment_method
            )?.label || '';

            htmlContent += `
              <tr>
                <td>${date}</td>
                <td>${expense.name}</td>
                <td class="amount">${amount} ${expense.currency || 'ILS'}</td>
                <td>${expense.category || ''}</td>
                <td>${expense.currency || 'ILS'}</td>
                ${selectedColumns.paymentMethod ? `<td>${paymentMethodLabel}</td>` : ''}
                ${selectedColumns.notes ? `<td>${expense.notes || ''}</td>` : ''}
              </tr>
            `;
          });

          htmlContent += `
              </tbody>
            </table>
          `;
        }

        if (section.type === "chart") {
          const categoryTotals = typedExpenses.reduce((acc: { [key: string]: number }, expense: any) => {
            const category = expense.category || 'אחר';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
          }, {});

          // Sort categories by total amount in descending order
          const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

          htmlContent += `<div class="category-summary">`;
          sortedCategories.forEach(([category, total]) => {
            const formattedTotal = new Intl.NumberFormat('he-IL', {
              style: 'currency',
              currency: 'ILS'
            }).format(total);

            htmlContent += `
              <div style="margin: 5px 0;">
                ${category}: ${formattedTotal}
              </div>
            `;
          });
          htmlContent += `</div>`;
        }
      }

      // Add footer
      htmlContent += `
          <div class="footer">
            הופק בתאריך: ${new Date().toLocaleDateString('he-IL')}
          </div>
        </body>
        </html>
      `;

      // Set the HTML content
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // Convert to PDF
      try {
        const canvas = await html2canvas(tempDiv, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          windowWidth: tempDiv.scrollWidth,
          windowHeight: tempDiv.scrollHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        let heightLeft = imgHeight;
        let position = 0;
        
        // Add image to PDF
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add new pages if content is longer than one page
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Save the PDF
        const filename = `${selectedReport.name}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.pdf`;
        doc.save(filename);
        toast.success('הדוח נוצר בהצלחה');
      } finally {
        // Clean up
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      console.error('Error running report:', error);
      toast.error('שגיאה בהפעלת הדוח');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast.error("נא להזין שם לדוח");
      return;
    }

    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: newReportName,
      schedule: "none",
      sections: [
        {
          id: "1",
          type: "table",
          title: "טבלת הוצאות",
          enabled: true,
          config: {
            dateRange: {
              from: addDays(new Date(), -30),
              to: new Date(),
            },
            filters: {
              categories: [],
              paymentMethods: [],
              minAmount: 0,
              maxAmount: Infinity,
              currencies: [],
            },
            columns: {
              date: true,
              name: true,
              amount: true,
              category: true,
              currency: true,
              paymentMethod: true,
              notes: true,
            },
            groupBy: "none",
            sortBy: "date",
            sortOrder: "desc",
          },
        },
        {
          id: "2",
          type: "chart",
          title: "תרשים הוצאות",
          enabled: true,
          config: {
            dateRange: {
              from: addDays(new Date(), -30),
              to: new Date(),
            },
            filters: {
              categories: [],
              paymentMethods: [],
              minAmount: 0,
              maxAmount: Infinity,
              currencies: [],
            },
            groupBy: "category",
          },
        }
      ]
    };

    setSavedReports([...savedReports, newReport]);
    setSelectedReport(newReport);
    setNewReportName("");
    setIsCreatingReport(false);
    localStorage.setItem('savedReports', JSON.stringify([...savedReports, newReport]));
    toast.success("הדוח נוצר בהצלחה");
  };

  const handleDeleteReport = (reportId: string) => {
    try {
      const updatedReports = savedReports.filter(report => report.id !== reportId);
      setSavedReports(updatedReports);
      localStorage.setItem('savedReports', JSON.stringify(updatedReports));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      toast.success('הדוח נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('שגיאה במחיקת הדוח');
    }
  };

  return (
    <Tabs defaultValue="export" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="export">ייצוא נתונים</TabsTrigger>
        <TabsTrigger value="reports">דוחות מותאמים אישית</TabsTrigger>
      </TabsList>

      <TabsContent value="export">
        <Card>
          <CardHeader>
            <CardTitle>ייצוא נתונים</CardTitle>
            <CardDescription>ייצא את הנתונים שלך בפורמט הרצוי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">הגדרות ייצוא</h3>
                <Select
                  value={exportFormat}
                  onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר פורמט" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center">
                        <Table className="mr-2 h-4 w-4" />
                        CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>טווח תאריכים</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">כלול בדוח</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeTags"
                        checked={exportSettings.includeTags}
                        onCheckedChange={(checked) =>
                          setExportSettings({ ...exportSettings, includeTags: !!checked })
                        }
                      />
                      <Label htmlFor="includeTags">תגיות - תוספת תגיות שהוגדרו להוצאה</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeNotes"
                        checked={exportSettings.includeNotes}
                        onCheckedChange={(checked) =>
                          setExportSettings({ ...exportSettings, includeNotes: !!checked })
                        }
                      />
                      <Label htmlFor="includeNotes">הערות - הערות נוספות שנכתבו להוצאה</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePaymentMethod"
                        checked={exportSettings.includePaymentMethod}
                        onCheckedChange={(checked) =>
                          setExportSettings({ ...exportSettings, includePaymentMethod: !!checked })
                        }
                      />
                      <Label htmlFor="includePaymentMethod">אמצעי תשלום - שיטת התשלום שנבחרה</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">שם קובץ מותאם אישית</h3>
                <Input
                  placeholder="הזן שם קובץ"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                />
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "מייצא..." : "ייצא נתונים"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>דוחות מותאמים אישית</CardTitle>
            <CardDescription>צור ושמור דוחות מותאמים אישית</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">דוחות שמורים</h3>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingReport(true)}
                >
                  דוח חדש
                </Button>
              </div>

              {isCreatingReport && (
                <div className="space-y-2">
                  <Input
                    placeholder="שם הדוח"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateReport}>
                      צור דוח
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingReport(false);
                        setNewReportName("");
                      }}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              )}

              <Select
                value={selectedReport?.id}
                onValueChange={(value) => {
                  const report = savedReports.find(r => r.id === value);
                  setSelectedReport(report || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר דוח" />
                </SelectTrigger>
                <SelectContent>
                  {savedReports.map(report => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedReport && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{selectedReport.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm(`האם אתה בטוח שברצונך למחוק את הדוח "${selectedReport.name}"?`)) {
                            handleDeleteReport(selectedReport.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        מחק דוח
                      </Button>
                      <Button
                        onClick={handleRunReport}
                        disabled={!selectedReport}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        הפעל דוח
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedReport.sections.map((section) => (
                      <div key={section.id} className="space-y-4 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{section.title}</h4>
                          <Checkbox
                            checked={section.enabled}
                            onCheckedChange={(checked: CheckedState) => {
                              const updatedSections = selectedReport.sections.map(s =>
                                s.id === section.id ? { ...s, enabled: handleCheckboxChange(checked) } : s
                              );
                              setSelectedReport({
                                ...selectedReport,
                                sections: updatedSections
                              });
                            }}
                          />
                        </div>

                        {section.enabled && (
                          <div className="space-y-4">
                            <div>
                              <Label>טווח תאריכים</Label>
                              <DatePickerWithRange
                                date={section.config.dateRange}
                                onDateChange={(dateRange: { from: Date; to: Date }) => {
                                  const updatedSections = selectedReport.sections.map(s =>
                                    s.id === section.id ? {
                                      ...s,
                                      config: { ...s.config, dateRange }
                                    } : s
                                  );
                                  setSelectedReport({
                                    ...selectedReport,
                                    sections: updatedSections
                                  });
                                }}
                              />
                            </div>

                            {section.type === "table" && (
                              <>
                                <div>
                                  <Label>עמודות</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(section.config.columns || {}).map(([key, value]) => (
                                      <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={value}
                                          onCheckedChange={(checked) => {
                                            const updatedSections = selectedReport.sections.map(s =>
                                              s.id === section.id ? {
                                                ...s,
                                                config: {
                                                  ...s.config,
                                                  columns: {
                                                    ...s.config.columns,
                                                    [key]: checked
                                                  }
                                                }
                                              } : s
                                            );
                                            setSelectedReport({
                                              ...selectedReport,
                                              sections: updatedSections
                                            });
                                          }}
                                        />
                                        <Label>{getColumnLabel(key)}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label>מיון</Label>
                                  <div className="grid grid-cols-2 gap-4">
                                    <Select
                                      value={section.config.sortBy}
                                      onValueChange={(value: "date" | "amount" | "name") => {
                                        const updatedSections = selectedReport.sections.map(s =>
                                          s.id === section.id ? {
                                            ...s,
                                            config: { ...s.config, sortBy: value }
                                          } : s
                                        );
                                        setSelectedReport({
                                          ...selectedReport,
                                          sections: updatedSections
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="מיין לפי" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="date">תאריך</SelectItem>
                                        <SelectItem value="amount">סכום</SelectItem>
                                        <SelectItem value="name">שם</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={section.config.sortOrder}
                                      onValueChange={(value: "asc" | "desc") => {
                                        const updatedSections = selectedReport.sections.map(s =>
                                          s.id === section.id ? {
                                            ...s,
                                            config: { ...s.config, sortOrder: value }
                                          } : s
                                        );
                                        setSelectedReport({
                                          ...selectedReport,
                                          sections: updatedSections
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="סדר מיון" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="asc">עולה</SelectItem>
                                        <SelectItem value="desc">יורד</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </>
                            )}

                            <div>
                              <Label>קיבוץ</Label>
                              <Select
                                value={section.config.groupBy}
                                onValueChange={(value: "none" | "category" | "paymentMethod" | "currency" | "month") => {
                                  const updatedSections = selectedReport.sections.map(s =>
                                    s.id === section.id ? {
                                      ...s,
                                      config: { ...s.config, groupBy: value }
                                    } : s
                                  );
                                  setSelectedReport({
                                    ...selectedReport,
                                    sections: updatedSections
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="קובץ לפי" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">ללא קיבוץ</SelectItem>
                                  <SelectItem value="category">קטגוריה</SelectItem>
                                  <SelectItem value="paymentMethod">אמצעי תשלום</SelectItem>
                                  <SelectItem value="currency">מטבע</SelectItem>
                                  <SelectItem value="month">חודש</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div>
                        <Label>תזמון דוח</Label>
                        <Select
                          value={selectedReport.schedule}
                          onValueChange={(value: "none" | "daily" | "weekly" | "monthly") => {
                            setSelectedReport({
                              ...selectedReport,
                              schedule: value,
                              scheduleTime: value === "daily" ? "09:00" : undefined,
                              scheduleDay: value === "weekly" ? 1 : value === "monthly" ? 1 : undefined
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר תזמון" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">ללא תזמון</SelectItem>
                            <SelectItem value="daily">יומי</SelectItem>
                            <SelectItem value="weekly">שבועי</SelectItem>
                            <SelectItem value="monthly">חודשי</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedReport.schedule !== "none" && (
                        <>
                          {selectedReport.schedule === "daily" && (
                            <div>
                              <Label>שעת שליחה</Label>
                              <Input
                                type="time"
                                value={selectedReport.scheduleTime || "09:00"}
                                onChange={(e) => {
                                  setSelectedReport({
                                    ...selectedReport,
                                    scheduleTime: e.target.value
                                  });
                                }}
                              />
                            </div>
                          )}

                          {selectedReport.schedule === "weekly" && (
                            <div>
                              <Label>יום בשבוע</Label>
                              <Select
                                value={String(selectedReport.scheduleDay || 0)}
                                onValueChange={(value) => {
                                  setSelectedReport({
                                    ...selectedReport,
                                    scheduleDay: parseInt(value)
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר יום" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">ראשון</SelectItem>
                                  <SelectItem value="1">שני</SelectItem>
                                  <SelectItem value="2">שלישי</SelectItem>
                                  <SelectItem value="3">רביעי</SelectItem>
                                  <SelectItem value="4">חמישי</SelectItem>
                                  <SelectItem value="5">שישי</SelectItem>
                                  <SelectItem value="6">שבת</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedReport.schedule === "monthly" && (
                            <div>
                              <Label>יום בחודש</Label>
                              <Select
                                value={String(selectedReport.scheduleDay || 1)}
                                onValueChange={(value) => {
                                  setSelectedReport({
                                    ...selectedReport,
                                    scheduleDay: parseInt(value)
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר יום" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div>
                            <Label>כתובת אימייל לקבלת הדוח</Label>
                            <Input
                              type="email"
                              value={selectedReport.recipientEmail || ""}
                              onChange={(e) => {
                                setSelectedReport({
                                  ...selectedReport,
                                  recipientEmail: e.target.value
                                });
                              }}
                              placeholder="הזן כתובת אימייל"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 