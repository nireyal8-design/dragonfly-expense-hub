import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
import { addMonths, format } from 'date-fns';
import { Database } from '../../types/supabase';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Singleton for worker initialization
let workerInitialized = false;

const initializeWorker = () => {
  if (workerInitialized) return;
  
  console.log('PDF.js version:', pdfjsLib.version);
  console.log('Initializing PDF.js worker...');
  workerInitialized = true;
};

// Initialize worker at module level
initializeWorker();

type Transaction = {
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'Domestic' | 'Foreign';
  paymentDetails: string | null;
};

type CreditCardImportData = {
  report_name: string;
  report_date: string;
  user_id: string;
};

type Expense = Database['public']['Tables']['expenses']['Insert'];

async function extractTransactionsFromPDF(file: File): Promise<{ 
  transactions: Transaction[]; 
  reportMonth: number; 
  reportYear: number;
  reportDate: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  console.log('Extracted text from PDF:', fullText);
  
  // Extract report date
  const reportDateMatch = fullText.match(/פרוט פעולותיך לתאריך:\s*(\d{2}\/\d{2}\/\d{2})/);
  const reportDateStr = reportDateMatch?.[1];
  if (!reportDateStr) {
    throw new Error('לא נמצא תאריך בדוח');
  }
  
  // Parse the date for month and year calculations (DD/MM/YY format)
  const [day, month, year] = reportDateStr.split('/');
  const reportMonth = parseInt(month, 10); // Month is already in 1-12 format
  const reportYear = parseInt(year, 10) + 2000;
  
  // Format the date as YYYY-MM-DD
  const reportDate = `${reportYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  return {
    transactions: parseTransactions(fullText),
    reportMonth,
    reportYear,
    reportDate
  };
}

function parseTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = [];

  // Extract report date
  const reportDateMatch = text.match(/פרוט פעולותיך לתאריך:\s*(\d{2}\/\d{2}\/\d{2})/);
  console.log('Report date match:', reportDateMatch);
  const reportDateStr = reportDateMatch?.[1]; // e.g., 02/04/25
  const reportMonth = parseInt(reportDateStr?.split('/')[1] ?? '1', 10);
  const transactionMonth = reportMonth - 1 === 0 ? 12 : reportMonth - 1;
  const transactionYear = reportMonth === 1 ? 2024 : 2025;
  console.log('Report date:', { reportDateStr, reportMonth, transactionMonth, transactionYear });

  // --- FOREIGN TRANSACTIONS SECTION ---
  const foreignSectionMatch = text.match(/רכישות בחו"ל([\s\S]+?)סה"?כ חיוב לתאריך/);
  console.log('Foreign section match:', foreignSectionMatch ? 'Found' : 'Not found');
  
  if (foreignSectionMatch) {
    const foreignSection = foreignSectionMatch[1];
    const lines = foreignSection.split(/\n| {2,}/).map(line => line.trim()).filter(Boolean);
    console.log('Foreign section lines:', lines);

    for (let i = 0; i < lines.length - 2; i++) {
      const dateLine = lines[i];
      const phoneOrSub = lines[i + 1]; // Usually not useful
      const amountLine = lines[i + 2];

      const dateMatch = dateLine.match(/(\d{2})\/(\d{2})\/(\d{2})/);
      const amountMatch = amountLine.match(/([\d,.]+)\s*₪/);

      if (dateMatch && amountMatch) {
        const [_, day, month, year] = dateMatch;
        const date = `20${year}-${month}-${day}`;
        const name = dateLine.replace(dateMatch[0], '').trim();
        const amount = parseFloat(amountMatch[1].replace(',', ''));

        transactions.push({
          date,
          name,
          category: 'Foreign',
          type: 'Foreign',
          paymentDetails: null,
          amount,
        });

        console.log("✅ Added foreign transaction:", { date, name, amount });
        i += 2; // Skip next 2 lines
      }
    }
  }

  // --- DOMESTIC TRANSACTIONS SECTION ---
  const domesticSectionMatch = text.match(/עסקות שחויבו \/ זוכו - בארץ([\s\S]+?)סה"?כ חיוב לתאריך/);
  console.log('Domestic section match:', domesticSectionMatch ? 'Found' : 'Not found');
  
  if (domesticSectionMatch) {
    const domesticSection = domesticSectionMatch[1];
    const lines = domesticSection.split(/\n| {2,}/).map(line => line.trim()).filter(Boolean);
    console.log('Domestic section lines:', lines);
    
    let current: Partial<Transaction> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log("🔍 Processing domestic line:", line);

      const dateMatch = line.match(/(\d{2})\/(\d{2})\/(\d{2})/);
      const amountMatch = line.match(/([\d,]+\.\d{2})/g);
      const paymentMatch = line.match(/(\d+ מתוך \d+ תשלום)/);

      if (dateMatch && amountMatch) {
        const [_, day, month, year] = dateMatch;
        const date = `20${year}-${month}-${day}`;
        const amount = parseFloat(amountMatch[amountMatch.length - 1].replace(',', ''));

        // Clean the line from dates, amounts, and payment info
        let cleanLine = line
          .replace(dateMatch[0], '')
          .replace(/([\d,]+\.\d{2})/g, '')
          .replace(/(\d+ מתוך \d+ תשלום)/, '')
          .trim();

        // List of known categories
        const knownCategories = [
          'מזון', 'דיור', 'תחבורה', 'בילויים', 'קניות', 'חשבונות',
          'בריאות', 'חינוך', 'ביטוח', 'תקשורת', 'ספורט', 'בידור',
          'מתנות', 'ביגוד והנעלה', 'טיפוח', 'חיות מחמד', 'תרומות',
          'השקעות', 'חופשה', 'ריהוט', 'מכשירי חשמל', 'תחזוקת הבית',
          'תש\' רשויות', 'תשלומי רשויות', 'חינוך', 'ביטוח', 'תחבורה',
          'מחשבים', 'שונות', 'תוכנה', 'אלקטרוניקה', 'ציוד משרדי',
          'בניה/שיפוץ', 'שירותי רכב', 'דלק', 'מעדניות', 'מסעדות/קפה',
          'נופש ותיור'
        ];

        // Split the line into parts and look for category
        const parts = cleanLine.split(' ');
        let category = 'אחר';
        let name = cleanLine;

        // First try to find a category at the end of the line
        for (let i = parts.length - 1; i >= 0; i--) {
          const potentialCategory = parts[i];
          if (knownCategories.includes(potentialCategory)) {
            category = potentialCategory;
            name = parts.slice(0, i).join(' ').trim();
            break;
          }
        }

        // If no category found at the end, try to find it anywhere in the line
        if (category === 'אחר') {
          for (const cat of knownCategories) {
            if (cleanLine.includes(cat)) {
              category = cat;
              name = cleanLine.replace(cat, '').trim();
              break;
            }
          }
        }

        // Special case for "לא הוצג" lines
        if (cleanLine.startsWith('לא הוצג')) {
          // Look for the next line as it might contain the business name
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (!nextLine.match(/(\d{2})\/(\d{2})\/(\d{2})/) && !nextLine.match(/([\d,]+\.\d{2})/)) {
              name = nextLine.trim();
              // Look for category in the line after the business name
              if (i + 2 < lines.length) {
                const categoryLine = lines[i + 2];
                if (knownCategories.includes(categoryLine.trim())) {
                  category = categoryLine.trim();
                }
              }
            } else {
              // If next line is not a business name, use the current line without "לא הוצג"
              name = cleanLine.replace('לא הוצג', '').trim();
            }
          } else {
            // If there's no next line, use the current line without "לא הוצג"
            name = cleanLine.replace('לא הוצג', '').trim();
          }
        } else if (cleanLine.includes('לא הוצג')) {
          // Remove "לא הוצג" from the name if it appears anywhere in the line
          name = cleanLine.replace('לא הוצג', '').trim();
        }

        transactions.push({
          date,
          name: name || 'Unknown',
          category,
          type: 'Domestic',
          paymentDetails: paymentMatch ? paymentMatch[0] : null,
          amount,
        });

        console.log("✅ Added domestic transaction:", transactions[transactions.length - 1]);
      }
    }
  }

  console.log('Total transactions found:', transactions.length);
  return transactions;
}

function expandMultiPayments(transactions: Transaction[], reportMonth: number, reportYear: number): Transaction[] {
  const expanded: Transaction[] = [];

  for (const tx of transactions) {
    const isMulti = tx.paymentDetails?.match(/(\d+) מתוך (\d+)/);
    const txDate = new Date(tx.date);
    const txMonth = txDate.getMonth() + 1;
    const txYear = txDate.getFullYear();

    if (isMulti) {
      const [, currentPaymentStr, totalPaymentsStr] = isMulti;
      const currentPayment = parseInt(currentPaymentStr, 10);
      const totalPayments = parseInt(totalPaymentsStr, 10);

      const originalDate = new Date(tx.date);
      const originalMonth = originalDate.getMonth() + 1;
      const originalYear = originalDate.getFullYear();

      // Calculate how many months back we need to go
      const monthsDiff = (reportYear - originalYear) * 12 + (reportMonth - originalMonth);
      
      // Start from the original date and go forward
      for (let i = 0; i < totalPayments; i++) {
        const paymentDate = addMonths(originalDate, i);
        const paymentMonth = paymentDate.getMonth() + 1;
        const paymentYear = paymentDate.getFullYear();

        // Include all payments up to and including the current report month
        if (paymentYear < reportYear || 
            (paymentYear === reportYear && paymentMonth <= reportMonth)) {
          expanded.push({
            ...tx,
            date: format(paymentDate, 'yyyy-MM-dd'),
            paymentDetails: `תשלום ${i + 1} מתוך ${totalPayments}`
          });
        }
      }
    } else {
      // For single payment transactions, check if they should appear in both months
      if (txYear < reportYear || (txYear === reportYear && txMonth < reportMonth)) {
        // Add the original transaction
        expanded.push(tx);
        
        // Add a copy for the report month
        const reportDate = new Date(reportYear, reportMonth - 1, txDate.getDate());
        expanded.push({
          ...tx,
          date: format(reportDate, 'yyyy-MM-dd'),
          paymentDetails: 'תשלום נוסף'
        });
      } else {
        expanded.push(tx);
      }
    }
  }

  return expanded;
}

export function CreditCardImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const verifyWorker = async () => {
      try {
        console.log('Verifying PDF.js worker...');
        // Create a minimal valid PDF document
        const minimalPDF = new Uint8Array([
          0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x33, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A,
          0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65,
          0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20,
          0x32, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A,
          0x32, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65,
          0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2F, 0x43, 0x6F, 0x75, 0x6E, 0x74, 0x20, 0x31, 0x2F,
          0x4B, 0x69, 0x64, 0x73, 0x5B, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5D, 0x3E, 0x3E, 0x0A, 0x65,
          0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x33, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C,
          0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x2F, 0x50, 0x61, 0x72,
          0x65, 0x6E, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2F, 0x52, 0x65, 0x73, 0x6F, 0x75,
          0x72, 0x63, 0x65, 0x73, 0x3C, 0x3C, 0x2F, 0x46, 0x6F, 0x6E, 0x74, 0x3C, 0x3C, 0x2F, 0x46,
          0x31, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x46, 0x6F, 0x6E, 0x74, 0x2F, 0x53,
          0x75, 0x62, 0x74, 0x79, 0x70, 0x65, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x31, 0x2F, 0x42, 0x61,
          0x73, 0x65, 0x46, 0x6F, 0x6E, 0x74, 0x2F, 0x48, 0x65, 0x6C, 0x76, 0x65, 0x74, 0x69, 0x63,
          0x61, 0x3E, 0x3E, 0x3E, 0x3E, 0x2F, 0x50, 0x72, 0x6F, 0x63, 0x53, 0x65, 0x74, 0x5B, 0x2F,
          0x50, 0x44, 0x46, 0x2F, 0x54, 0x65, 0x78, 0x74, 0x5D, 0x2F, 0x43, 0x6F, 0x6E, 0x74, 0x65,
          0x6E, 0x74, 0x73, 0x20, 0x34, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64,
          0x6F, 0x62, 0x6A, 0x0A, 0x34, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F,
          0x4C, 0x65, 0x6E, 0x67, 0x74, 0x68, 0x20, 0x31, 0x35, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x72,
          0x65, 0x61, 0x6D, 0x0A, 0x42, 0x54, 0x0A, 0x2F, 0x46, 0x31, 0x20, 0x31, 0x32, 0x20, 0x54,
          0x66, 0x0A, 0x31, 0x30, 0x30, 0x20, 0x37, 0x30, 0x30, 0x20, 0x54, 0x64, 0x0A, 0x28, 0x48,
          0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x29, 0x20, 0x54, 0x6A, 0x0A,
          0x45, 0x54, 0x0A, 0x65, 0x6E, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x65, 0x6E,
          0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A, 0x30,
          0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35,
          0x20, 0x66, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x37, 0x32, 0x20, 0x30,
          0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32,
          0x32, 0x38, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30,
          0x30, 0x30, 0x30, 0x33, 0x30, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A,
          0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x33, 0x35, 0x32, 0x20, 0x30, 0x30, 0x30, 0x30,
          0x30, 0x20, 0x6E, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, 0x3C, 0x3C, 0x2F,
          0x53, 0x69, 0x7A, 0x65, 0x20, 0x35, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30,
          0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A,
          0x33, 0x38, 0x34, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46
        ]);

        // Try to load the minimal PDF
        const pdf = await getDocument({ data: minimalPDF }).promise;
        const numPages = pdf.numPages;
        console.log('PDF.js worker verified successfully, document has', numPages, 'pages');
        setIsWorkerReady(true);
      } catch (error) {
        console.error('Error verifying PDF.js worker:', error);
        toast.error('שגיאה באתחול מערכת עיבוד PDF');
      }
    };

    verifyWorker();
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        toast.error('נא לבחור קובץ PDF בלבד');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('נא לבחור קובץ PDF בלבד');
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('נא לבחור קובץ PDF');
      return;
    }

    if (!isWorkerReady) {
      toast.error('מערכת עיבוד PDF לא אותחלה כראוי');
      return;
    }

    setIsLoading(true);
    try {
      const { transactions, reportMonth, reportYear, reportDate } = await extractTransactionsFromPDF(file);
      
      // Save the report data
      const reportData = {
        report_name: `Credit Card Report ${reportMonth}/${reportYear}`,
        report_date: reportDate,
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
      };
      
      const { data: importData, error: importError } = await supabase
        .from('credit_cardimport_data' as any)
        .insert(reportData)
        .select()
        .single();
        
      if (importError) throw importError;
      
      // Save the transactions
      const expenses = transactions.map(transaction => ({
        name: transaction.name,
        amount: transaction.amount,
        date: reportDate,
        transaction_date: transaction.date,
        category: transaction.category,
        currency: 'ILS',
        payment_method: 'credit',
        user_id: reportData.user_id,
        is_recurring: false,
        notes: transaction.paymentDetails || null
      }));
      
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(expenses);
        
      if (expensesError) throw expensesError;
      
      console.log('Successfully imported transactions:', transactions);
      toast.success(`נטענו ${transactions.length} הוצאות בהצלחה`);
      setFile(null);
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error(error instanceof Error ? error.message : 'שגיאה בעיבוד דוח כרטיס האשראי');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isWorkerReady) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            טעינת דוח כרטיס אשראי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          טעינת דוח כרטיס אשראי
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
              טען את דוח כרטיס האשראי שלך כדי להוסיף אוטומטית את העסקאות להוצאות שלך.
            </p>
            <p className="text-xs text-muted-foreground">
              התמיכה היא עבור קבצי PDF בלבד מחברת ישראכרט וויזה.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {file ? file.name : 'גרור ושחרר קובץ PDF לכאן'}
                </p>
                <p className="text-xs text-muted-foreground">
                  או לחץ כדי לבחור קובץ
                </p>
              </div>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                בחר קובץ
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  מעבד את הדוח...
                </>
              ) : (
                <>
            <Upload className="h-4 w-4 mr-2" />
                  טען דוח PDF
                </>
              )}
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 