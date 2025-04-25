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
              <p>התקציב החודשי הוא כלי חשוב לניהול הכספים שלך. הנה מה שצריך לדעת:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>התקציב החודשי הוא הסכום הכולל שאתה מקצה להוצאות שלך בכל חודש</li>
                <li>המערכת משתמשת בתקציב כדי לחשב את ההתקדמות במטרות הכספיות שלך</li>
                <li>התקציב מאפשר לך לראות כמה כסף נשאר לך בכל חודש לאחר ההוצאות</li>
                <li>תוכל לקבל התראות כאשר אתה מתקרב לחריגה מהתקציב</li>
                <li>התקציב מסייע לך לתכנן את החיסכון למטרות העתידיות שלך</li>
              </ul>
              <p className="mt-2">כדי להגדיר תקציב חודשי:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>עבור לדף הראשי</li>
                <li>מצא את אזור "תקציב חודשי"</li>
                <li>הזן את הסכום הרצוי</li>
                <li>המערכת תעדכן אוטומטית את כל החישובים והניתוחים</li>
              </ul>
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

          <AccordionItem value="item-9">
            <AccordionTrigger>איך אני מעדכן את פרטי המשתמש שלי?</AccordionTrigger>
            <AccordionContent>
              עבור לדף ההגדרות ובחר בלשונית "פרופיל". שם תוכל לעדכן את השם הפרטי, שם המשפחה, כתובת האימייל והסיסמה שלך.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-12">
            <AccordionTrigger>מדוע אני לא יכול לעדכן את פרטי המשתמש שלי?</AccordionTrigger>
            <AccordionContent>
              <p>אם אתה משתמש שהתחבר באמצעות חשבון Google, פרטי המשתמש שלך (כולל שם, אימייל וסיסמה) מנוהלים על ידי Google. מסיבות אבטחה, לא ניתן לעדכן פרטים אלה ישירות דרך האפליקציה.</p>
              <p className="mt-2">כדי לעדכן את פרטי המשתמש שלך:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>עבור לחשבון Google שלך</li>
                <li>עדכן את הפרטים הרצויים</li>
                <li>השינויים יתעדכנו אוטומטית באפליקציה</li>
              </ul>
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
                <li className="text-muted-foreground">* המערכת תוסיף את ההוצאה החוזרת לכל החודשים עד סוף השנה הנוכחית. כדי לשמור על דיוק, יש להזין מחדש את ההוצאות החוזרות בתחילת כל שנה</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="edit-recurring">
            <AccordionTrigger>איך אני עורך הוצאה חוזרת מהדף הגדרות?</AccordionTrigger>
            <AccordionContent>
              <p>כדי לערוך הוצאה חוזרת מהדף הגדרות:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>עבור לדף הגדרות ובחר בלשונית "הוצאות חוזרות"</li>
                <li>מצא את ההוצאה החוזרת שברצונך לערוך</li>
                <li>לחץ על כפתור העריכה (סמל עיפרון)</li>
                <li>בחלון העריכה תוכל לשנות:</li>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>יום החיוב החודשי</li>
                  <li>תדירות החיוב (חודשי, דו-חודשי, רבעוני)</li>
                </ul>
                <li>לחץ על "שמור" כדי לעדכן את ההוצאה</li>
                <li>השינויים יתעדכנו אוטומטית בכל ההוצאות העתידיות</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reminders">
            <AccordionTrigger>איך אני מגדיר תזכורות להוצאות?</AccordionTrigger>
            <AccordionContent>
              <p>המערכת מאפשרת לך להגדיר תזכורות להוצאות כדי שלא תשכח לשלם אותן. הנה איך זה עובד:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>בעת הוספת או עריכת הוצאה, סמן את האפשרות "הפעל תזכורת"</li>
                <li>בחר כמה ימים לפני מועד התשלום לקבל את התזכורת</li>
                <li>בחר את סוגי ההתראות הרצויים:
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>התראות במערכת (יופיעו בדף הבית)</li>
                    <li>התראות במייל</li>
                  </ul>
                </li>
                <li>התזכורות יופיעו בדף הבית שלך עם הודעה: "תשלום עבור הוצאה [שם ההוצאה] בסכום [סכום ההוצאה] יש לבצע עד מחר"</li>
                <li>לאחר ששילמת את ההוצאה, תוכל לסמן אותה כ"שולמה" והתזכורת תיעלם</li>
              </ul>
              
              <p className="mt-4 font-semibold">תזכורות להוצאות חוזרות:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>כאשר מגדירים תזכורת להוצאה חוזרת, היא תופעל אוטומטית עבור כל המופעים העתידיים של ההוצאה</li>
                <li>התזכורת תופיע מספר ימים לפני כל מועד תשלום של ההוצאה החוזרת</li>
                <li>אם תבטל את התזכורת, היא תבוטל עבור כל המופעים העתידיים של ההוצאה</li>
                <li>המערכת בודקת תזכורות חדשות כל דקה, כך שתקבל התראות בזמן</li>
                <li>תזכורות להוצאות חוזרות נשמרות גם אם תעבור בין דפים שונים באפליקציה</li>
              </ul>
              
              <p className="mt-4 font-semibold">טיפים לשימוש בתזכורות:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>הגדר תזכורות מספר ימים לפני מועד התשלום כדי שיהיה לך מספיק זמן להעביר את הכסף</li>
                <li>השתמש בהתראות במייל עבור הוצאות חשובות במיוחד</li>
                <li>סמן הוצאות כ"שולמו" כדי לשמור על סדר וניקיון בממשק</li>
                <li>בדוק את דף הבית באופן קבוע כדי לראות את כל התזכורות הפעילות</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>איך אני מקבל התראות על חריגה מהתקציב?</AccordionTrigger>
            <AccordionContent>
              עבור לדף ההגדרות, בחר בלשונית "התראות" והפעל את האפשרות "התראות אימייל". תוכל לבחור את תדירות קבלת ההתראות ולהפעיל התראות על חריגה מהתקציב.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>איך אני יכול לראות ניתוח של ההוצאות שלי?</AccordionTrigger>
            <AccordionContent>
              בדף הראשי תמצא גרפים וניתוחים שונים של ההוצאות שלך, כולל התפלגות לפי קטגוריות, השוואה חודשית, והוצאות מובילות. בנוסף, תוכל ליצור דוחות מותאמים אישית בהגדרות המתקדמות.
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

          <AccordionItem value="goals">
            <AccordionTrigger>איך אני מגדיר ומנהל מטרות כספיות?</AccordionTrigger>
            <AccordionContent>
              <p>מטרות כספיות הן כלי עזר חשוב לניהול התקציב שלך. הנה כל מה שצריך לדעת:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>יצירת מטרה חדשה:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>עבור ללשונית "קביעת מטרות ויעדים" בהגדרות</li>
                    <li>הזן שם למטרה (למשל: חיסכון לדירה, רכישת רכב)</li>
                    <li>הגדר את סכום היעד הסופי</li>
                    <li>קבע עדיפות (1-5, כאשר 1 היא הגבוהה ביותר)</li>
                    <li>אם רלוונטי, הגדר תאריך יעד</li>
                    <li>הוסף הערות או פרטים נוספים</li>
                  </ul>
                </li>
                <li>
                  <strong>מעקב אחר התקדמות:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>המערכת מחשבת אוטומטית את אחוז ההתקדמות</li>
                    <li>תוכל לראות את הזמן שנותר להשגת המטרה</li>
                    <li>המטרות מוצגות בסדר העדיפויות שקבעת</li>
                    <li>התקדמות המטרות מוצגת גם בדף הבית</li>
                  </ul>
                </li>
                <li>
                  <strong>עדכון ומחיקה:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>ניתן לעדכן את פרטי המטרה בכל עת</li>
                    <li>אפשר למחוק מטרה שהשלמת או שאינך מעוניין בה עוד</li>
                    <li>שינויים במטרה מתעדכנים אוטומטית בכל המערכת</li>
                  </ul>
                </li>
                <li>
                  <strong>טיפים להצלחה:</strong>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>הגדר מטרות ריאליות וניתנות להשגה</li>
                    <li>השתמש בתאריך יעד כדי ליצור תחושת דחיפות</li>
                    <li>קבע עדיפויות ברורות בין המטרות השונות</li>
                    <li>עקוב אחר ההתקדמות באופן קבוע</li>
                  </ul>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11">
            <AccordionTrigger>איך אני יכול לייבא את דוח כרטיס האשראי ישירות להוצאות?</AccordionTrigger>
            <AccordionContent>
              עבור להגדרות ובחר בלשונית "טעינת הוצאות מכרטיס אשראי". שם תוכל לגרור ולשחרר את קובץ ה-PDF של דוח כרטיס האשראי שלך (ישראכרט או ויזה). המערכת תזהה אוטומטית את העסקאות, הקטגוריות והסכומים, ותוסיף אותן לרשימת ההוצאות שלך.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-13">
            <AccordionTrigger>מדוע הוצאה בדוח שלי מופיעה בתאריך מחוץ לטווח התאריכים שבחרתי?</AccordionTrigger>
            <AccordionContent>
              <p>במקרים מסוימים, ייתכן שתראה הוצאה בתאריך שמחוץ לטווח התאריכים שבחרת בדוח. זה קורה כאשר ההוצאה יובאה מדוח כרטיס אשראי, והתאריך המוצג הוא תאריך הרכישה בפועל - ולא תאריך החיוב.</p>
              <p className="mt-2">חברות כרטיסי אשראי בדרך כלל מחייבות את ההוצאות האלה בתחילת החודש הבא, מה שעלול לגרום לחוסר התאמה בין תאריך העסקה לתאריך הדוח.</p>
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