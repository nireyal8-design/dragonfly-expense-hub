import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function HelpSupport() {
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("משתמש לא מחובר");
        return;
      }

      // Debug log
      console.log('Sending request with:', {
        userId: user.id,
        subject: contactForm.subject,
        messageLength: contactForm.message.length
      });

      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: {
          userId: user.id,
          subject: contactForm.subject,
          message: contactForm.message
        }
      });

      // Debug log
      console.log('Response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error occurred');
      }

      toast.success("פנייתך נשלחה בהצלחה");
      setContactForm({ subject: "", message: "" });
    } catch (error) {
      console.error('Full error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`שגיאה בשליחת הפנייה: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>עזרה ותמיכה</CardTitle>
        <CardDescription>שאלות נפוצות ויצירת קשר</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>איך אני מוסיף הוצאה חדשה?</AccordionTrigger>
            <AccordionContent>
              לחץ על כפתור "הוסף הוצאה" בדף הראשי, מלא את הפרטים הנדרשים ולחץ על "שמור".
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>איך אני מגדיר תקציב חודשי?</AccordionTrigger>
            <AccordionContent>
              בדף הראשי, מצא את אזור "תקציב חודשי" והזן את הסכום הרצוי.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>איך אני מייצא את הנתונים שלי?</AccordionTrigger>
            <AccordionContent>
              עבור להגדרות מתקדמות, בחר את פורמט הייצוא הרצוי ולחץ על "ייצא נתונים".
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="recurring">
            <AccordionTrigger>איך אני מגדיר הוצאות חוזרות?</AccordionTrigger>
            <AccordionContent>
              <p>כדי להגדיר הוצאה חוזרת:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>בעת הוספת הוצאה חדשה, בחר באפשרות "הוצאה חוזרת חודשית"</li>
                <li>בחר את יום החיוב החודשי</li>
                <li>אם תשנה את יום החיוב בהוצאה קיימת, השינוי יתעדכן אוטומטית בכל ההוצאות העתידיות שכבר קיימות במערכת</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="currency">
            <AccordionTrigger>איך המערכת ממירה בין מטבעות?</AccordionTrigger>
            <AccordionContent>
              <p>המערכת תומכת בשלושה מטבעות: שקל (ILS), דולר (USD) ואירו (EUR).</p>
              <ul className="list-disc list-inside space-y-2">
                <li>המטבעות מומרים אוטומטית לשקלים באמצעות שערי חליפין עדכניים</li>
                <li>המערכת מסנכרנת את שערי החליפין באופן אוטומטי מדי יום מול מקורות מידע חיצוניים, כדי להבטיח הצגת נתונים עדכניים</li>
                <li>אם אין אפשרות להתחבר לאינטרנט, המערכת תשתמש בשערים קבועים (3.6 ₪ לדולר, 3.9 ₪ לאירו)</li>
                <li>כל החישובים והגרפים במערכת מוצגים בשקלים</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>איך אני מקבל התראות על חריגה מהתקציב?</AccordionTrigger>
            <AccordionContent>
              עבור לדף ההגדרות, בחר בלשונית "התראות" והפעל את האפשרות "התראות אימייל". תוכל לבחור את תדירות קבלת ההתראות ולהפעיל התראות על חריגה מהתקציב.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>איך אני יכול לערוך או למחוק הוצאה קיימת?</AccordionTrigger>
            <AccordionContent>
              בדף הראשי, מצא את ההוצאה ברשימת ההוצאות. לחץ על כפתור העריכה (סמל עיפרון) לעריכה או על כפתור המחיקה (סמל פח) למחיקת ההוצאה.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>האם אפשר לשנות את המטבע של ההוצאות?</AccordionTrigger>
            <AccordionContent>
              כן, בעת הוספת או עריכת הוצאה תוכל לבחור בין שקל (₪), דולר ($) או יורו (€). המערכת תבצע המרה אוטומטית לשקלים בחישוב התקציב החודשי.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger>איך אני יכול לראות ניתוח של ההוצאות שלי?</AccordionTrigger>
            <AccordionContent>
              בדף הראשי תמצא גרפים וניתוחים שונים של ההוצאות שלך, כולל התפלגות לפי קטגוריות, השוואה חודשית, והוצאות מובילות. בנוסף, תוכל ליצור דוחות מותאמים אישית בהגדרות המתקדמות.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-9">
            <AccordionTrigger>איך אני מעדכן את פרטי המשתמש שלי?</AccordionTrigger>
            <AccordionContent>
              עבור לדף ההגדרות ובחר בלשונית "פרופיל". שם תוכל לעדכן את השם הפרטי, שם המשפחה, כתובת האימייל והסיסמה שלך.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-10">
            <AccordionTrigger>האם אפשר לקבל סיכום חודשי של ההוצאות?</AccordionTrigger>
            <AccordionContent>
              כן, עבור להגדרות התראות והפעל את האפשרות "סיכום חודשי". בסוף כל חודש תקבל דוח מפורט של ההוצאות שלך, כולל:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>סיכום ההוצאות לפי קטגוריות</li>
                <li>השוואה להוצאות החודש הקודם</li>
                <li>נתוני התקציב החודשי</li>
                <li>הוצאות חריגות מהממוצע</li>
                <li>טיפים לחיסכון</li>
              </ul>
              הדוח נשלח אוטומטית לכתובת הדוא"ל שלך ביום האחרון של כל חודש.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-11">
            <AccordionTrigger>איך אני יכול לייבא את דוח כרטיס האשראי ישירות להוצאות?</AccordionTrigger>
            <AccordionContent>
              עבור להגדרות ובחר בלשונית "טעינת הוצאות מכרטיס אשראי". שם תוכל לגרור ולשחרר את קובץ ה-PDF של דוח כרטיס האשראי שלך (ישראכרט או ויזה). המערכת תזהה אוטומטית את העסקאות, הקטגוריות והסכומים, ותוסיף אותן לרשימת ההוצאות שלך.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="monthly-summary">
            <AccordionTrigger>איך אני יכול לראות סיכום חודשי של ההוצאות?</AccordionTrigger>
            <AccordionContent>
              כן, עבור להגדרות התראות והפעל את האפשרות "סיכום חודשי". בסוף כל חודש תקבל דוח מפורט של ההוצאות שלך, כולל:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>סיכום ההוצאות לפי קטגוריות</li>
                <li>השוואה להוצאות החודש הקודם</li>
                <li>נתוני התקציב החודשי</li>
                <li>הוצאות חריגות מהממוצע</li>
                <li>טיפים לחיסכון</li>
              </ul>
              הדוח נשלח אוטומטית לכתובת הדוא"ל שלך ביום האחרון של כל חודש.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">צור קשר</h3>
          <form onSubmit={handleSubmitSupport} className="space-y-4">
            <div>
              <Input
                placeholder="נושא הפנייה"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="תוכן ההודעה"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
                className="min-h-[150px]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  שלח פנייה
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
} 