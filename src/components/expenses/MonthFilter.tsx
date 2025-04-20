import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthSelect: (month: number | null, year: number) => void;
}

const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export function MonthFilter({ selectedMonth, selectedYear, onMonthSelect }: MonthFilterProps) {
  const handlePreviousYear = () => {
    onMonthSelect(selectedMonth, selectedYear - 1);
  };

  const handleNextYear = () => {
    onMonthSelect(selectedMonth, selectedYear + 1);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={handlePreviousYear}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="mx-2 font-medium">{selectedYear}</span>
        <Button variant="ghost" size="icon" onClick={handleNextYear}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <Select
        value={selectedMonth.toString()}
        onValueChange={(value) => {
          onMonthSelect(parseInt(value), selectedYear);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="בחר חודש" />
        </SelectTrigger>
        <SelectContent>
          {hebrewMonths.map((month, index) => (
            <SelectItem key={index} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 