import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock,
  Zap,
  Receipt,
  ArrowLeft,
  Repeat,
  Smartphone,
  Camera,
  FileCheck,
  Bot,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TimeSavingsBenefits() {
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
          <h1 className="text-4xl font-bold mb-4">חיסכון בזמן יקר</h1>
          <p className="text-xl text-muted-foreground">
            חסוך שעות יקרות בכל חודש עם כלים אוטומטיים לניהול הוצאות
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-dragonfly-600" />
                סריקת קבלות אוטומטית
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
                <Repeat className="h-6 w-6 text-dragonfly-600" />
                הוצאות חוזרות אוטומטיות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                הגדר הוצאות חוזרות פעם אחת והמערכת תתעד אותן באופן אוטומטי מדי חודש
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-dragonfly-600" />
                קטגוריזציה חכמה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                המערכת לומדת את דפוסי ההוצאות שלך ומסווגת הוצאות חדשות באופן אוטומטי
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-dragonfly-600" />
                דוחות אוטומטיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל דוחות מפורטים באופן אוטומטי בתדירות שתבחר, ללא צורך בהכנה ידנית
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-dragonfly-600" />
                תזכורות חכמות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל תזכורות אוטומטיות לתשלומים ומועדי חיוב, ללא צורך בניהול ידני
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-dragonfly-600" />
                גישה מכל מקום
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                נהל את ההוצאות שלך מכל מכשיר ובכל זמן, ללא צורך בגישה למחשב
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">יתרונות נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <Clock className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">חיסכון של שעות</h3>
              <p className="text-sm text-muted-foreground">
                חסוך עד 10 שעות בחודש בניהול הוצאות
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Receipt className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">תיעוד מסודר</h3>
              <p className="text-sm text-muted-foreground">
                שמור על כל המסמכים מסודרים ונגישים
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Zap className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">יעילות מקסימלית</h3>
              <p className="text-sm text-muted-foreground">
                תהליכים אוטומטיים לחיסכון בזמן ומאמץ
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
            התחל לחסוך זמן יקר
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