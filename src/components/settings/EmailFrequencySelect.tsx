import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailFrequencySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EmailFrequencySelect({ value, onChange, disabled }: EmailFrequencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="בחר תדירות" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="immediately">מיידי</SelectItem>
        <SelectItem value="daily">פעם ביום</SelectItem>
        <SelectItem value="weekly">פעם בשבוע</SelectItem>
      </SelectContent>
    </Select>
  );
} 