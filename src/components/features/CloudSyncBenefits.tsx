import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap,
  Cloud,
  Smartphone,
  ArrowLeft,
  Laptop,
  RefreshCw,
  Globe,
  Share2,
  Wifi,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CloudSyncBenefits() {
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
          <h1 className="text-4xl font-bold mb-4">סנכרון בענן חכם</h1>
          <p className="text-xl text-muted-foreground">
            גש למידע שלך מכל מקום ובכל זמן עם סנכרון אוטומטי בין כל המכשירים
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-dragonfly-600" />
                סנכרון אוטומטי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                כל השינויים מסונכרנים באופן אוטומטי בין כל המכשירים שלך
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-dragonfly-600" />
                גישה מכל מכשיר
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                גש לנתונים שלך מהטלפון, טאבלט או מחשב בממשק מותאם לכל מכשיר
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-6 w-6 text-dragonfly-600" />
                עבודה לא מקוונת
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                המשך לעבוד גם ללא חיבור לאינטרנט, הנתונים יסונכרנו אוטומטית כשהחיבור יחזור
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6 text-dragonfly-600" />
                שיתוף מידע
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                שתף נתונים ודוחות בקלות עם רואה החשבון או שותפים לעסק
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-dragonfly-600" />
                גיבוי אוטומטי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                כל המידע שלך מגובה באופן אוטומטי בענן לשמירה על הנתונים שלך
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-dragonfly-600" />
                גישה גלובלית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                גש לנתונים שלך מכל מקום בעולם עם חיבור לאינטרנט
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">יתרונות נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <Cloud className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">אחסון בטוח</h3>
              <p className="text-sm text-muted-foreground">
                אחסון מאובטח של כל הנתונים בענן
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Laptop className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">חוויה אחידה</h3>
              <p className="text-sm text-muted-foreground">
                ממשק משתמש עקבי בכל המכשירים
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Zap className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">ביצועים מהירים</h3>
              <p className="text-sm text-muted-foreground">
                סנכרון מהיר ויעיל של כל הנתונים
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
            התחל לסנכרן את הנתונים שלך
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