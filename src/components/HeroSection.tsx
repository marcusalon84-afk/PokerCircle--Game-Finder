import React from 'react';
import { ShieldCheck, Eye, MessageCircle, Trophy } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenTransparency: () => void;
  onOpenAddEvent?: () => void;
  onOpenOrganizerContact?: () => void;
  onNavigateOrganizers: () => void;
  totalTournaments: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onOpenTransparency,
  onOpenAddEvent,
  onOpenOrganizerContact,
  onNavigateOrganizers,
  totalTournaments
}) => {
  return (
    <div className="relative bg-gradient-to-b from-[#123B32] to-[#0d2a24] text-white pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Subtle decorative geometric background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D8F36A] blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Anti-slop: unboxed quiet eyebrow metadata */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D8F36A] mb-4">
          <span>פלטפורמת הפוקר של ישראל</span>
          <span aria-hidden="true">·</span>
          <span>pokercircleIL.com</span>
          <span aria-hidden="true">·</span>
          <span>טורנירים חיים בלבד</span>
        </div>

        {/* Core required headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          מוצאים טורניר. <span className="text-[#D8F36A]">יודעים על מה משלמים.</span>
        </h1>

        {/* Required secondary subtext */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8 leading-relaxed">
          טורנירים קרובים, כל העלויות על השולחן. בוחרים איפה לשחק ומדברים ישירות עם המארגן.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={onExploreClick}
            className="px-6 py-3 rounded-xl bg-[#D8F36A] text-[#123B32] font-bold text-sm sm:text-base hover:bg-[#c8e359] transition-all shadow-md active:scale-95"
          >
            חפש טורניר קרוב ({totalTournaments} זמינים)
          </button>

          <button
            onClick={onNavigateOrganizers}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm sm:text-base transition-colors border border-white/10"
          >
            דירוגי מארגנים וביקורות
          </button>

          <button
            onClick={onOpenOrganizerContact || onOpenAddEvent}
            className="px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 font-semibold text-sm transition-colors border border-emerald-600/40 flex items-center justify-center gap-1.5"
          >
            <span>מארגן? פרסם את הטורניר שלך ←</span>
          </button>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right pt-6 border-t border-emerald-900/60 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2 text-[#D8F36A]">
              <Eye className="w-5 h-5" />
              <span className="font-bold text-sm text-white">שקיפות מחיר מלאה</span>
            </div>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              הפרדה ברורה בין הסכום לקופת הפרסים לבין עמלת המארגן. ללא הפתעות בכניסה.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2 text-[#D8F36A]">
              <Trophy className="w-5 h-5" />
              <span className="font-bold text-sm text-white">טורנירים בלבד</span>
            </div>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              ממוקד אך ורק בטורנירים תחרותיים. משחקי קאש מיועדים לשלב עתידי.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2 text-[#D8F36A]">
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold text-sm text-white">קשר ישיר למארגן</span>
            </div>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              לחיצה אחת לפתיחת שיחת WhatsApp או Telegram עם המארגן לקבלת הכתובת המדויקת.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
