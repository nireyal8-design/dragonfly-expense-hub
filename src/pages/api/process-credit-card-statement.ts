import { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';

interface Transaction {
  date: string;
  name: string;
  category: string;
  type: 'Domestic' | 'Foreign';
  paymentDetails: string | null;
  amount: number;
}

async function processCreditCardStatement(pdfBuffer: Buffer): Promise<Transaction[]> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const transactions: Transaction[] = [];
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join('\n');
      const lines = text.split('\n');
      
      // Process domestic transactions section
      const domesticSectionStart = lines.findIndex(line => line.includes('בארץ - זוכו / שחויבו עסקות'));
      if (domesticSectionStart !== -1) {
        let i = domesticSectionStart + 1;
        while (i < lines.length && !lines[i].includes('בחו"ל רכישות')) {
          const line = lines[i].trim();
          if (line && !line.includes('תאריך') && !line.includes('סכום')) {
            const parts = line.split(/\s+/);
            if (parts.length >= 3) {
              const date = parts[0];
              const amount = parseFloat(parts[parts.length - 1].replace(',', ''));
              const name = parts.slice(1, -1).join(' ');
              
              transactions.push({
                date,
                name,
                category: 'אחר', // Default category, can be updated later
                type: 'Domestic',
                paymentDetails: null,
                amount
              });
            }
          }
          i++;
        }
      }
      
      // Process foreign transactions section
      const foreignSectionStart = lines.findIndex(line => line.includes('בחו"ל רכישות'));
      if (foreignSectionStart !== -1) {
        let i = foreignSectionStart + 1;
        while (i < lines.length) {
          const line = lines[i].trim();
          if (line && !line.includes('תאריך') && !line.includes('סכום')) {
            const parts = line.split(/\s+/);
            if (parts.length >= 3) {
              const date = parts[0];
              const amount = parseFloat(parts[parts.length - 1].replace(',', ''));
              const name = parts.slice(1, -1).join(' ');
              
              transactions.push({
                date,
                name,
                category: 'אחר', // Default category, can be updated later
                type: 'Foreign',
                paymentDetails: null,
                amount
              });
            }
          }
          i++;
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBuffer } = req.body;
    if (!pdfBuffer) {
      return res.status(400).json({ error: 'PDF buffer is required' });
    }

    const transactions = await processCreditCardStatement(Buffer.from(pdfBuffer));
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error processing credit card statement:', error);
    return res.status(500).json({ error: 'Failed to process credit card statement' });
  }
} 