import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footer: ReactNode;
  hebrewContent?: ReactNode;
}

export function AuthLayout({ children, title, description, footer, hebrewContent }: AuthLayoutProps) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-dragonfly-600 to-purple-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link to="/">
            <Logo size="large" />
          </Link>
        </div>
        <div className="relative z-20 mt-auto space-y-4" dir="rtl">
          {hebrewContent || (
            <>
              <h1 className="text-4xl font-bold">SpendWise</h1>
              <p className="text-lg text-dragonfly-100">
                פשט את ניהול הכספים שלך, עקוב אחר הוצאות בקלות, וקבל תובנות בעלות ערך. הצטרף לאלפי משתמשים ששינו את ניהול הכספים שלהם עם SpendWise.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mb-4 flex justify-center lg:hidden">
              <Link to="/">
                <Logo size="large" />
              </Link>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
          <div className="text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
