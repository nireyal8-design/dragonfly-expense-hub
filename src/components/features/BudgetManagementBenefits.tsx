import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp,
  AlertCircle,
  PieChart,
  Target,
  ArrowLeft,
  Wallet,
  LineChart,
  Bell,
  Calendar,
  Banknote
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BudgetManagementBenefits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ניהול תקציב חכם</h1>
          <p className="text-xl text-muted-foreground">
            קבל שליטה מלאה על ההוצאות שלך עם כלים חכמים לניהול תקציב והתראות בזמן אמת
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* הגדרת תקציב */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-dragonfly-600" />
                הגדרת תקציב מותאם אישית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                הגדר תקציבים לקטגוריות שונות בהתאם לצרכים שלך, עם אפשרות לתקציבים חודשיים או שנתיים
              </p>
            </CardContent>
          </Card>

          {/* מעקב בזמן אמת */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-dragonfly-600" />
                מעקב בזמן אמת
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                עקוב אחר ההוצאות שלך בזמן אמת וראה כמה נשאר לך מהתקציב בכל קטגוריה
              </p>
            </CardContent>
          </Card>

          {/* התראות חריגה */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-dragonfly-600" />
                התראות חריגה מתקציב
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל התראות כשאתה מתקרב או חורג מהתקציב שהגדרת, כדי לשמור על המסגרת התקציבית
              </p>
            </CardContent>
          </Card>

          {/* ניתוח תקציבי */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-dragonfly-600" />
                ניתוח תקציבי מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל תובנות מעמיקות על דפוסי ההוצאות שלך וזהה הזדמנויות לחיסכון
              </p>
            </CardContent>
          </Card>

          {/* תקציב גמיש */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-dragonfly-600" />
                תקציב גמיש
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                התאם את התקציב שלך בקלות בהתאם לשינויים בהכנסות או בהוצאות
              </p>
            </CardContent>
          </Card>

          {/* תזכורות תשלומים */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-dragonfly-600" />
                תזכורות תשלומים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל תזכורות לתשלומים קבועים כדי להימנע מחריגות לא צפויות
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">יתרונות נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <Calendar className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">תכנון עתידי</h3>
              <p className="text-sm text-muted-foreground">
                תכנן את התקציב שלך מראש ובנה תוכנית פיננסית ארוכת טווח
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <TrendingUp className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">מגמות והשוואות</h3>
              <p className="text-sm text-muted-foreground">
                השווה את הביצועים התקציביים שלך לאורך זמן וזהה מגמות
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Banknote className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">יעדי חיסכון</h3>
              <p className="text-sm text-muted-foreground">
                הגדר יעדי חיסכון ועקוב אחר ההתקדמות שלך לקראתם
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="bg-dragonfly-600 hover:bg-dragonfly-700"
            onClick={() => navigate("/dashboard")}
          >
            התחל לנהל את התקציב שלך
          </Button>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © 2025 WiseSpend כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  );
} 