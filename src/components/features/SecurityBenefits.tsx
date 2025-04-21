import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield,
  Lock,
  Key,
  ArrowLeft,
  Eye,
  History,
  Server,
  FileKey,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SecurityBenefits() {
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
          <h1 className="text-4xl font-bold mb-4">אבטחה ברמה הגבוהה ביותר</h1>
          <p className="text-xl text-muted-foreground">
            הגן על המידע הפיננסי שלך עם אמצעי אבטחה מתקדמים ברמה בנקאית
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-dragonfly-600" />
                הצפנה מתקדמת
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                כל המידע שלך מוצפן בתקן הגבוה ביותר (AES-256) להגנה מקסימלית
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-6 w-6 text-dragonfly-600" />
                אימות דו-שלבי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                שכבת הגנה נוספת עם אימות דו-שלבי לאבטחת החשבון שלך
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-6 w-6 text-dragonfly-600" />
                גיבוי אוטומטי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                גיבוי אוטומטי של כל המידע שלך במספר שרתים מאובטחים
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-dragonfly-600" />
                היסטוריית פעילות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                מעקב מלא אחר כל הפעולות בחשבון שלך לזיהוי פעילות חשודה
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-6 w-6 text-dragonfly-600" />
                אבטחת מסמכים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                הצפנת כל המסמכים והקבלות שלך להגנה מרבית על המידע הרגיש
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-dragonfly-600" />
                התראות אבטחה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                קבל התראות מיידיות על כל פעילות חשודה בחשבון שלך
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">אמצעי אבטחה נוספים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 text-center">
              <UserCheck className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">בקרת גישה</h3>
              <p className="text-sm text-muted-foreground">
                שליטה מלאה על הרשאות הגישה לחשבון שלך
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Eye className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">ניטור רציף</h3>
              <p className="text-sm text-muted-foreground">
                מערכות ניטור 24/7 לזיהוי ומניעת איומים
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <Shield className="h-8 w-8 text-dragonfly-600 mb-4" />
              <h3 className="font-semibold mb-2">תאימות לתקנים</h3>
              <p className="text-sm text-muted-foreground">
                עמידה בכל תקני האבטחה והפרטיות המחמירים
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
            התחל להגן על המידע שלך
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