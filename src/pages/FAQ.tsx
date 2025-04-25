import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "מה זה מטרות כספיות?",
    answer: "מטרות כספיות הן יעדים כלכליים שאתה מציב לעצמך, כמו חיסכון לדירה, רכישת רכב, או חופשה. המערכת עוקבת אחר ההתקדמות שלך בכל מטרה ומציגה לך את אחוז ההתקדמות, הזמן שנותר, והסכום שנותר לחסוך."
  },
  {
    question: "מה זה תקציב חודשי ולמה הוא חשוב?",
    answer: "התקציב החודשי הוא הסכום הכולל שאתה מקצה להוצאות שלך בכל חודש. המערכת משתמשת בתקציב החודשי כדי לחשב את ההתקדמות במטרות הכספיות שלך, לעקוב אחר ההוצאות שלך, ולעזור לך לנהל את הכסף שלך בצורה יעילה. התקציב מאפשר לך לראות כמה כסף נשאר לך בכל חודש לאחר ההוצאות, וכך לעזור לך להשיג את המטרות הכספיות שלך."
  },
  {
    question: "איך אני יוצר מטרה חדשה?",
    answer: "כדי ליצור מטרה חדשה, עבור ללשונית 'קביעת מטרות ויעדים' בהגדרות. שם תוכל להגדיר את שם המטרה, סכום היעד, עדיפות, תאריך יעד (אופציונלי), והערות נוספות. המערכת תעקוב אחר ההתקדמות שלך ותציג לך את הנתונים בדף הבית."
  },
  {
    question: "איך מחושב ההתקדמות במטרות?",
    answer: "ההתקדמות במטרות מחושבת על ידי השוואת הסכום שנחסך עד כה לסכום היעד הכולל. המערכת לוקחת בחשבון את התקציב החודשי שלך ואת ההוצאות שלך כדי לחשב את ההתקדמות. אתה יכול לראות את ההתקדמות שלך בדף הבית, כולל אחוז ההתקדמות והזמן שנותר."
  },
  {
    question: "איך אני מעדכן או מוחק מטרה?",
    answer: "אתה יכול לעדכן או למחוק מטרה בלשונית 'קביעת מטרות ויעדים' בהגדרות. לחץ על המטרה שברצונך לעדכן או למחוק, ובצע את השינויים הרצויים. שים לב שמחיקת מטרה היא פעולה בלתי הפיכה."
  },
  {
    question: "מה זה עדיפות במטרה?",
    answer: "עדיפות במטרה (1-5) מאפשרת לך לסדר את המטרות שלך לפי חשיבות. מטרה עם עדיפות 1 היא החשובה ביותר. המערכת מציגה את המטרות שלך בסדר העדיפויות שקבעת, כך שתוכל להתמקד במטרות החשובות ביותר."
  },
  {
    question: "האם אני יכול להוסיף הערות למטרה?",
    answer: "כן, אתה יכול להוסיף הערות לכל מטרה. ההערות יכולות לכלול פרטים נוספים על המטרה, תזכורות, או כל מידע אחר שיעזור לך לעקוב אחר ההתקדמות שלך."
  }
];

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">שאלות נפוצות</h1>
      
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{item.question}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleItem(index)}
                >
                  {expandedItems.includes(index) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {expandedItems.includes(index) && (
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 