import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard,
  Receipt,
  Tag,
  ArrowLeft,
  PieChart,
  Filter,
  Camera,
  Calculator,
  Search,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ExpenseTrackingBenefits() {
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
          <h1 className="text-4xl font-bold mb-4">מעקב הוצאות חכם</h1>
          <p className="text-xl text-muted-foreground">
            נהל את ההוצאות שלך בקלות עם כלים חכמים וניתוח מתקדם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-dragonfly-600" />
                סריקת קבלות חכמה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                סרוק קבלות באמצעות המצלמה והמערכת תמלא את כל הפרטים באופן אוטומטי
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-6 w-6 text-dragonfly-600" />
                קטגוריזציה אוטומטית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                המערכת מסווגת הוצאות באופן אוטומטי לקטגוריות המתאימות
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-dragonfly-600" />
                ניתוח מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל תובנות מעמיקות על דפוסי ההוצאות שלך עם גרפים וניתוחים מתקדמים
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-6 w-6 text-dragonfly-600" />
                חיפוש מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                מצא הוצאות במהירות עם חיפוש חכם לפי קטגוריות, תאריכים וסכומים
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-dragonfly-600" />
                חישובים אוטומטיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                חישוב אוטומטי של סיכומים, ממוצעים ומגמות בהוצאות שלך
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-dragonfly-600" />
                ייצוא נתונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ייצא את הנתונים שלך בפורמטים שונים לניתוח נוסף או גיבוי
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">יתרונות נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <Receipt className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">תיעוד מסודר</h3>
              <p className="text-sm text-muted-foreground">
                שמירה מסודרת של כל ההוצאות והקבלות שלך
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Filter className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">סינון מתקדם</h3>
              <p className="text-sm text-muted-foreground">
                מצא בקלות את ההוצאות שאתה מחפש
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <CreditCard className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">מעקב אמצעי תשלום</h3>
              <p className="text-sm text-muted-foreground">
                עקוב אחר הוצאות לפי אמצעי תשלום שונים
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
            התחל לנהל את ההוצאות שלך
          </Button>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © 2025 SpendWise כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  );
} 