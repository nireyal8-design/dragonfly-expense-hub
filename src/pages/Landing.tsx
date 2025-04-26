import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { CardHover } from "@/components/ui/card-hover";
import { CreditCard, PieChart, TrendingUp, Zap, Shield, Clock } from "lucide-react";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Landing component rendering...');
  console.log('User state:', user);
  console.log('Loading state:', loading);

  useEffect(() => {
    console.log('Landing useEffect running...');
    if (!loading && user) {
      console.log('User is authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Landing: Still loading auth state...');
    return <div>Loading...</div>;
  }

  if (user) {
    console.log('Landing: User is authenticated, showing loading state...');
    return <div>Redirecting to dashboard...</div>;
  }

  console.log('Landing: Rendering landing page content...');
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="medium" />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm">התחברות</Button>
            </Link>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-dragonfly-500 hover:bg-dragonfly-600 text-white"
              >
                התחל עכשיו
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 -z-10" />
          <div className="container pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-dragonfly-600">פשט</span> את ניהול ההוצאות שלך
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
              עקוב אחר הוצאות, הפק דוחות, וקבל תובנות על דפוסי ההוצאות שלך עם SpendWise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-dragonfly-600 hover:bg-dragonfly-700 min-w-40">
                  התחל בחינם
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="min-w-40">
                צפה בהדגמה
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">למה לבחור ב-SpendWise?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              פתרון ניהול ההוצאות שלנו מתוכנן להפוך את המעקב הפיננסי לפשוט, יעיל ומלא תובנות.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/expense-tracking-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<CreditCard size={20} />}
                title="מעקב הוצאות"
                description="עקוב אחר כל ההוצאות שלך במקום אחד בקלות עם קטגוריזציה אוטומטית וסריקת קבלות."
              />
            </Link>
            
            <Link to="/reports-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<PieChart size={20} />}
                title="דוחות מלאי תובנות"
                description="הפק דוחות מפורטים וויזואליזציות כדי להבין את דפוסי ההוצאות שלך ולזהות הזדמנויות חיסכון."
              />
            </Link>
            
            <Link to="/budget-management-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<TrendingUp size={20} />}
                title="ניהול תקציב"
                description="קבע תקציבים לקטגוריות שונות וקבל התראות כאשר אתה מתקרב למגבלות שלך."
              />
            </Link>
            
            <Link to="/time-savings-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<Clock size={20} />}
                title="חיסכון בזמן"
                description="אוטומציה של מעקב הוצאות ודיווח, חוסכת לך שעות של עבודה ידנית בכל חודש."
              />
            </Link>
            
            <Link to="/security-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<Shield size={20} />}
                title="אבטחה"
                description="אבטחה ברמת בנק מבטיחה שהנתונים הפיננסיים שלך תמיד מוגנים ופרטיים."
              />
            </Link>
            
            <Link to="/cloud-sync-benefits" className="block hover:no-underline">
              <CardHover 
                icon={<Zap size={20} />}
                title="סנכרון בענן"
                description="גש לנתוני ההוצאות שלך בכל מקום, בכל זמן, בכל המכשירים שלך עם סנכרון חלק בענן."
              />
            </Link>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-dragonfly-600 text-white py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">כל ההוצאות שלך, במקום אחד – פשוט. ברור. בשליטה.</h2>
            <p className="text-dragonfly-100 mb-8 max-w-2xl mx-auto">
              הצטרף לאלפי משתמשים ששינו את הניהול הפיננסי שלהם עם SpendWise.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-dragonfly-700 hover:bg-gray-100">
                צור חשבון חינמי
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size="small" />
            <span className="text-sm text-muted-foreground">© 2025 SpendWise. כל הזכויות שמורות.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-dragonfly-600 transition-colors">
              מדיניות פרטיות
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-dragonfly-600 transition-colors">
              תנאי שירות
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-dragonfly-600 transition-colors">
              צור קשר
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
