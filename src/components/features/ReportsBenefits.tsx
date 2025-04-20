import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart2,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowLeft,
  Table
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReportsBenefits() {
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
          <h1 className="text-4xl font-bold mb-4">דוחות מלאי תובנות</h1>
          <p className="text-xl text-muted-foreground">
            קבל תמונה מקיפה של המצב הפיננסי שלך עם דוחות מותאמים אישית ותובנות מעמיקות
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ניתוח מגמות */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-dragonfly-600" />
                ניתוח מגמות מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                צפה במגמות הוצאות לאורך זמן, זהה דפוסים עונתיים, והשווה תקופות שונות בקלות
              </p>
            </CardContent>
          </Card>

          {/* דוחות מותאמים אישית */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-dragonfly-600" />
                דוחות מותאמים אישית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                צור דוחות המותאמים לצרכים שלך עם מגוון רחב של פרמטרים וסינונים
              </p>
            </CardContent>
          </Card>

          {/* ייצוא נתונים */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-6 w-6 text-dragonfly-600" />
                ייצוא נתונים מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ייצא דוחות במגוון פורמטים כולל Excel, PDF ו-CSV לניתוח מעמיק יותר
              </p>
            </CardContent>
          </Card>

          {/* ניתוח לפי קטגוריות */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-dragonfly-600" />
                ניתוח לפי קטגוריות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                הבן את התפלגות ההוצאות שלך עם תרשימים ויזואליים וניתוח מפורט לפי קטגוריות
              </p>
            </CardContent>
          </Card>

          {/* דוחות תקופתיים */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-dragonfly-600" />
                דוחות תקופתיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל דוחות אוטומטיים על בסיס יומי, שבועי, חודשי או רבעוני
              </p>
            </CardContent>
          </Card>

          {/* סינון מתקדם */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-6 w-6 text-dragonfly-600" />
                סינון מתקדם
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                סנן ומיין נתונים לפי תאריך, קטגוריה, סכום, תגיות ועוד
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">יתרונות נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <Table className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">טבלאות דינמיות</h3>
              <p className="text-sm text-muted-foreground">
                צור טבלאות דינמיות לניתוח מעמיק של הנתונים שלך
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <TrendingUp className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">תחזיות עתידיות</h3>
              <p className="text-sm text-muted-foreground">
                קבל תחזיות מבוססות על דפוסי ההוצאות ההיסטוריים שלך
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <BarChart2 className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">השוואות שנתיות</h3>
              <p className="text-sm text-muted-foreground">
                השווה ביצועים בין שנים שונות בקלות
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
            התחל להפיק דוחות עכשיו
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