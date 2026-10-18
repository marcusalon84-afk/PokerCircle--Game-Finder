import React, { useState } from 'react';
import type { CashGame } from '../types/poker.ts';
import { isFriendlyNoRakeGame } from '../types/poker.ts';
import { 
  X, 
  MapPin, 
  Clock, 
  Coins, 
  Users, 
  ShieldCheck, 
  Info, 
  Share2, 
  Check, 
  PhoneCall, 
  MessageCircle, 
  Send,
  Coffee,
  DollarSign
} from 'lucide-react';

interface CashGameDetailsModalProps {
  game: CashGame | null;
  onClose: () => void;
}

export const CashGameDetailsModal: React.FC<CashGameDetailsModalProps> = ({ game, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!game) return null;

  const isNoRake = isFriendlyNoRakeGame(game);
  const isSharedExpenses = game.feeModel === 'shared_expenses';
  const isCommercial = game.feeModel === 'commercial_rake';

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('he-IL', {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?cash=${game.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // WhatsApp prefilled message
  const waText = encodeURIComponent(
    `היי, ראיתי ב־PokerCircle את פרטי משחק הקאש: "${game.title}" ב${game.city} (בליינדים ${game.blinds}). אשמח לשמוע פרטים ולהצטרף.`
  );
  const waUrl = game.whatsapp
    ? `https://wa.me/${game.whatsapp.replace(/\D/g, '')}?text=${waText}`
    : null;

  const tgUrl = game.telegram
    ? `https://t.me/${game.telegram.replace('@', '')}`
    : null;

  const phoneUrl = game.phone ? `tel:${game.phone}` : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header bar */}
        <div className="bg-[#123B32] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="סגור"
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D8F36A] text-[#123B32]">
              משחק קאש
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-emerald-100">
              {game.gameType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-200">
              בליינדים: {game.blinds}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {game.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-emerald-100/90">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D8F36A]" />
              <span>{game.city} ({game.region})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D8F36A]" />
              <span>{formatDateTime(game.startDateTime)}</span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Fee Model Transparency Section */}
          <div className="p-4 rounded-2xl border transition-all">
            {isNoRake ? (
              <div className="space-y-2 bg-emerald-50/70 border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-700 text-white shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    משחק חברי · ללא עמלת מארגן
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium pt-1">
                  לפי הצהרת המפרסם. סכום הכניסה לשולחן מוצג בנפרד.
                </p>
                <p className="text-[11px] text-emerald-700/90 leading-normal">
                  במשחק זה אין דמי אירוח, אין רייק או אחוז מהקופה, ואין שום תשלום לפי זמן או תשלום חובה אחר למארגן.
                </p>
              </div>
            ) : isSharedExpenses ? (
              <div className="space-y-3 bg-amber-50/70 border-amber-200 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-700 text-white shadow-xs">
                    <Coffee className="w-3.5 h-3.5" />
                    משחק חברי · השתתפות בהוצאות
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 pt-1">
                  <div>
                    <span className="font-semibold text-neutral-600 block">עבור מה נגבה הכסף:</span>
                    <span className="font-medium text-neutral-900">
                      {game.sharedExpensesDetails?.forWhat || 'כיבוד קל, שתייה והוצאות משותפות'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-600 block">סכום לאדם / חישוב:</span>
                    <span className="font-bold text-neutral-900">
                      {game.sharedExpensesDetails?.amountPerPerson !== null && game.sharedExpensesDetails?.amountPerPerson !== undefined
                        ? `${game.sharedExpensesDetails.amountPerPerson} ש״ח ${game.sharedExpensesDetails.isEstimated ? '(משוער)' : '(סופי)'}`
                        : (game.sharedExpensesDetails?.calculationMethod || 'לפי חלוקה שווה בהוצאות בפועל')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-600 block">אופי ההשתתפות:</span>
                    <span className="font-medium text-neutral-900">
                      {game.sharedExpensesDetails?.isMandatory ? 'השתתפות חובה (לכל שחקן)' : 'השתתפות רשות'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-600 block">אופן הגבייה:</span>
                    <span className="font-medium text-neutral-900">
                      הוצאות משותפות בלבד — ללא שום רווח למארגן.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-blue-50/70 border-blue-200 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-700 text-white">
                    <DollarSign className="w-3.5 h-3.5" />
                    משחק מסחרי · פירוט רייק ועמלות
                  </span>
                </div>
                <div className="text-xs text-blue-950 space-y-1 pt-1">
                  {game.commercialRakeDetails?.rakePercent && (
                    <p><strong>רייק מהקופה:</strong> {game.commercialRakeDetails.rakePercent}% {game.commercialRakeDetails.rakeCap ? `(עד תקרה של ${game.commercialRakeDetails.rakeCap} ש״ח)` : ''}</p>
                  )}
                  {game.commercialRakeDetails?.hourlyRate ? (
                    <p><strong>תשלום לפי זמן:</strong> {game.commercialRakeDetails.hourlyRate} ש״ח לשעה</p>
                  ) : null}
                  {game.commercialRakeDetails?.hostingFee ? (
                    <p><strong>דמי אירוח:</strong> {game.commercialRakeDetails.hostingFee} ש״ח</p>
                  ) : null}
                  {game.commercialRakeDetails?.description && (
                    <p className="text-[11px] text-blue-800">{game.commercialRakeDetails.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                טווח כניסה (Buy-In)
              </span>
              <span className="text-base font-black text-[#17231F]">
                {game.minBuyIn} - {game.maxBuyIn} ₪
              </span>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                בליינדים
              </span>
              <span className="text-base font-black text-[#123B32]">
                {game.blinds}
              </span>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                מושבים בשולחן
              </span>
              <span className="text-base font-black text-[#17231F]">
                {game.tableSize || 8} מקסימום
              </span>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                מקומות פנויים
              </span>
              <span className="text-base font-black text-emerald-700">
                {game.availableSeats ? `${game.availableSeats} פנויים` : 'בתיאום'}
              </span>
            </div>
          </div>

          {/* Description & Venue info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              פרטים נוספים ומקום
            </h4>
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 text-xs text-[#2F3E38] leading-relaxed space-y-2">
              {game.description && (
                <p className="whitespace-pre-line">{game.description}</p>
              )}
              {game.venueDetails && (
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 text-neutral-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>מיקום:</strong> {game.venueDetails}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold text-[#17231F] flex items-center justify-between">
              <span>יצירת קשר ותיאום הגעה מול המארגן</span>
              <button
                onClick={handleCopyLink}
                className="text-neutral-500 hover:text-neutral-800 text-[11px] font-normal flex items-center gap-1 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">קישור הועתק!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>שתף משחק</span>
                  </>
                )}
              </button>
            </h4>

            <div className="flex flex-wrap gap-2.5">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>פנייה בוואטסאפ</span>
                </a>
              )}

              {tgUrl && (
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>טלגרם</span>
                </a>
              )}

              {phoneUrl && (
                <a
                  href={phoneUrl}
                  className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>שיחת טלפון</span>
                </a>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 text-center">
              הפנייה אינה אישור הצטרפות. ההשתתפות נקבעת ישירות מול המארגן.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>PokerCircle — שקיפות מלאה במשחקי קאש</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
