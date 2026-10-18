import React from 'react';
import { Eye, ShieldCheck, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';

interface TransparencyGuideProps {
  onBackToTournaments: () => void;
}

export const TransparencyGuide: React.FC<TransparencyGuideProps> = ({
  onBackToTournaments
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <button
          onClick={onBackToTournaments}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123B32] hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>חזרה ללוח הטורנירים</span>
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231F]">
          מדריך שקיפות המחירים ב־PokerCircle
        </h1>
        <p className="text-base text-[#5A6B65] leading-relaxed">
          המטרה שלנו פשוטה: לפני שאתם נוסעים לשחק, אתם יודעים בדיוק לאן הולך כל שקל מהכניסה שלכם.
        </p>
      </div>

      {/* Principle 1: Exact equation */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-[#123B32]">
          <Eye className="w-6 h-6" />
          <h2 className="text-xl font-bold">1. נוסחת הכניסה: כל העלויות על השולחן</h2>
        </div>

        <p className="text-sm text-neutral-700 leading-relaxed">
          באתר שלנו לא קיימים מספרים מעורפלים. לכל טורניר מוצג בבירור:
        </p>

        <div className="bg-[#F7F8F4] p-5 rounded-xl border border-neutral-200/80 text-sm space-y-3 font-mono">
          <div className="text-base font-bold text-[#123B32] font-sans">
            סך הכל לתשלום בכניסה = קופת פרסים + עמלת מארגן + תשלום חובה נוסף (אם קיים)
          </div>
          <div className="text-xs text-neutral-600 font-sans space-y-1">
            <div>• <strong>הסכום לקופת הפרסים:</strong> נטו הסכום שמחולק למנצחים לפי מבנה הפרסים.</div>
            <div>• <strong>עמלת המארגן / הבית:</strong> הסכום שגובה המארגן עבור ארגון, דילרים ומקום.</div>
            <div>• <strong>תשלום חובה נוסף:</strong> אם קיים (למשל צ׳יפ באונטי), חובה על המארגן לספק תיאור ברור.</div>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          * מסנן המחיר באתר משתמש תמיד בסכום הכולל לתשלום! אין אפשרות לפרסם אירוע עם עמלות נסתרות שלא נכללות במסנן.
        </p>
      </div>

      {/* Principle 2: Commercial Fairness */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-[#123B32]">
          <Scale className="w-6 h-6" />
          <h2 className="text-xl font-bold">2. הוגנות מסחרית ודירוג פרסומים</h2>
        </div>

        <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
          <p>
            כדי לשמור על אמון השחקנים, קבענו כללים נוקשים לפרסום ממומן ומודגש:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 pr-2">
            <li><strong>סינון קודם לכל:</strong> פרסום בתשלום אינו יכול לעקוף מגבלת מחיר, אזור או תאריך שהגדרתם.</li>
            <li><strong>שקיפות מלאה:</strong> אירוע ממומן מסומן תמיד בתג ברור ("אירוע ממומן" או "מודגש").</li>
            <li><strong>סדר עקבי:</strong> התוצאות ממוינות תמיד לפי בחירתכם (זמן, מרחק או מחיר).</li>
          </ul>
        </div>
      </div>

      {/* Principle 3: No Cash Games */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-[#123B32]">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="text-xl font-bold">3. למה טורנירים בלבד (ללא משחקי קאש)?</h2>
        </div>

        <p className="text-sm text-neutral-700 leading-relaxed">
          פוקר בפורמט טורניר מציע עלות כניסה מוגדרת מראש, ללא סיכונים בלתי נשלטים של קופות פתוחות. משחקי קאש מיועדים לשלב עתידי מוסדר, וגם בהם נדרוש פירוט מדויק של אחוזי רייק או תשלום לשעת ישיבה.
        </p>
      </div>

      {/* CTA back */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToTournaments}
          className="py-3 px-8 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold text-sm shadow-md transition-colors"
        >
          גלה טורנירים קרובים עכשיו
        </button>
      </div>

    </div>
  );
};
