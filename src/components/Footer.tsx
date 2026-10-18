import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'tournaments' | 'clubs' | 'admin' | 'transparency') => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenContact }) => {
  return (
    <footer className="bg-[#123B32] text-white border-t border-[#1b5044] mt-20 pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#D8F36A] text-[#123B32] flex items-center justify-center font-black text-base">
                ♠
              </span>
              <span className="text-xl font-bold tracking-tight">PokerCircle</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-md">
              פלטפורמת Game Finder לאיתור טורנירי פוקר חיים בישראל ומועדוני אונליין ב־ClubGG עם שקיפות מחירים מוחלטת והיכרות ישירה עם המארגנים.
            </p>
            <div className="text-[11px] text-emerald-200/70 font-mono">
              דומיין רשמי: pokercircleIL.com
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-white block mb-2">ניווט מהיר</span>
            <div>
              <button 
                onClick={() => onNavigate('tournaments')}
                className="text-emerald-100/80 hover:text-white transition-colors"
              >
                טורנירים חיים
              </button>
            </div>
            <div>
              <button 
                onClick={() => onNavigate('clubs')}
                className="text-emerald-100/80 hover:text-white transition-colors"
              >
                מועדוני אונליין ClubGG
              </button>
            </div>
            <div>
              <button 
                onClick={() => onNavigate('transparency')}
                className="text-emerald-100/80 hover:text-white transition-colors"
              >
                מדריך שקיפות מחיר
              </button>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-white block mb-2">יצירת קשר</span>
            <div>
              <button 
                onClick={onOpenContact}
                className="text-emerald-100/80 hover:text-white transition-colors"
              >
                מעוניין לפרסם אירוע / מועדון
              </button>
            </div>
            <div>
              <button 
                onClick={onOpenContact}
                className="text-emerald-100/80 hover:text-white transition-colors"
              >
                פניות ושאלות כלליות
              </button>
            </div>
            <div className="text-emerald-200/80 pt-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Mail className="w-3.5 h-3.5" />
              <span>alon.pokercircle@gmail.com</span>
            </div>
          </div>

        </div>

        {/* Disclaimer & Legal */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-200/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D8F36A]" />
            <span>
              מיועד לבגירים מגיל 18 ומעלה בלבד. האתר משמש כלוח מידע וגילוי עבור שחקנים ומארגנים ואינו מפעיל משחקים בעצמו.
            </span>
          </div>

          <div>
            © {new Date().getFullYear()} PokerCircle. כל הזכויות שמורות.
          </div>
        </div>

      </div>
    </footer>
  );
};
