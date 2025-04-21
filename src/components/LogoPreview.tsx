import { 
  Wallet,
  PiggyBank,
  LineChart,
  TrendingUp,
  BarChart4,
  CircleDollarSign,
  CreditCard // Current icon for comparison
} from "lucide-react";
import { Card } from "@/components/ui/card";

const LogoVariant = ({ Icon, name }: { Icon: any; name: string }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Icon
            className="text-dragonfly-500"
            size={28}
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        </div>
        <span className="font-bold text-2xl text-dragonfly-700">
          SpendWise
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{name}</p>
    </Card>
  );
};

// Combined logo variant with small trending up icon
const CombinedLogoVariant = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Wallet
            className="text-dragonfly-500"
            size={28}
            strokeWidth={2.5}
          />
          <TrendingUp
            className="text-green-500 absolute -top-2 -right-2"
            size={14}
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        </div>
        <span className="font-bold text-2xl text-dragonfly-700">
          SpendWise
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Wallet + Trending Up Combination</p>
    </Card>
  );
};

export function LogoPreview() {
  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">בחר לוגו חדש ל-SpendWise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LogoVariant Icon={CreditCard} name="Current Logo (Credit Card)" />
        <LogoVariant Icon={Wallet} name="Wallet" />
        <LogoVariant Icon={PiggyBank} name="Piggy Bank" />
        <LogoVariant Icon={LineChart} name="Line Chart" />
        <LogoVariant Icon={TrendingUp} name="Trending Up" />
        <LogoVariant Icon={BarChart4} name="Bar Chart" />
        <LogoVariant Icon={CircleDollarSign} name="Circle Dollar" />
        <CombinedLogoVariant />
      </div>
    </div>
  );
} 