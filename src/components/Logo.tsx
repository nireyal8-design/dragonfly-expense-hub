import { Wallet, TrendingUp } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

export function Logo({ size = "medium", withText = true }: LogoProps) {
  const sizes = {
    small: { icon: 20, text: "text-lg", trendingSize: 10 },
    medium: { icon: 28, text: "text-2xl", trendingSize: 14 },
    large: { icon: 40, text: "text-4xl", trendingSize: 20 },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Wallet
          className="text-dragonfly-500"
          size={sizes[size].icon}
          strokeWidth={2.5}
        />
        <TrendingUp
          className="text-green-500 absolute -top-2 -right-2"
          size={sizes[size].trendingSize}
          strokeWidth={2.5}
        />
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
      </div>
      {withText && (
        <span className={`font-bold ${sizes[size].text} text-dragonfly-700`}>
          WiseSpend
        </span>
      )}
    </div>
  );
}
