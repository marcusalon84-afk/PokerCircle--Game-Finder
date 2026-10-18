import React, { useState, useEffect, useMemo } from 'react';
import type { TournamentEvent } from '../types/poker.ts';
import { formatFullJerusalemDate } from '../utils/date.ts';
import { api } from '../utils/api.ts';
import { 
  X, 
  MapPin, 
  Clock, 
  Layers, 
  Timer, 
  RefreshCw, 
  FileText, 
  Star, 
  Share2, 
  Check, 
  AlertCircle,
  Camera,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Images
} from 'lucide-react';

interface TournamentDetailsModalProps {
  event: TournamentEvent | null;
  onClose: () => void;
  onOpenOrganizer: (organizerId: string) => void;
  onOpenShare: (event: TournamentEvent) => void;
  onOpenSubmitReview?: (target: { type: 'organizer' | 'club'; id: string; name: string }) => void;
}

export const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  event,
  onClose,
  onOpenOrganizer,
  onOpenShare,
  onOpenSubmitReview
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Gather all unique event images (cover + gallery) unconditionally using useMemo
  const allImages = useMemo(() => {
    if (!event) return [];
    const list: string[] = [];
    if (event.coverImageUrl && event.coverImageUrl.trim()) {
      list.push(event.coverImageUrl.trim());
    }
    if (event.galleryImages && Array.isArray(event.galleryImages)) {
      event.galleryImages.forEach((img) => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  }, [event]);

  // Keyboard navigation for lightbox called unconditionally before early return
  useEffect(() => {
    if (lightboxIndex === null || allImages.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        // In RTL, right arrow navigates to previous or wrap around
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allImages]);

  if (!event) return null;

  const org = event.organizer;
  const isExpired = event.status !== 'active' || new Date(event.publicationExpiresAt) < new Date();

  const handleWhatsApp = () => {
    api.logInteraction({
      actionType: 'whatsapp_click',
      targetType: 'event',
      targetId: event.id,
      channel: 'whatsapp'
    });
    const phone = org?.whatsapp || '972501234567';
    const msg = encodeURIComponent(
      `שלום, ראיתי את הטורניר "${event.title}" ב-PokerCircle (תאריך: ${formatFullJerusalemDate(event.startDateTime)}). אשמח לקבל פרטים וכתובת הגעה.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleTelegram = () => {
    api.logInteraction({
      actionType: 'telegram_click',
      targetType: 'event',
      targetId: event.id,
      channel: 'telegram'
    });
    const user = org?.telegram || 'PokerCircleIL';
    window.open(`https://t.me/${user}`, '_blank');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?event=${event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="tournament-details-title"
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
        >
          
          {/* Header Bar */}
          <div className="bg-[#123B32] text-white p-5 sm:p-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-200 mb-1.5 font-medium">
                <span>{event.city}</span>
                <span aria-hidden="true">·</span>
                <span>{formatFullJerusalemDate(event.startDateTime)}</span>
                {event.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#D8F36A] font-mono text-[10px]">נתוני הדגמה</span>
                  </>
                )}
              </div>
              <h2 id="tournament-details-title" className="text-xl sm:text-2xl font-bold leading-tight">
                {event.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              aria-label="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cover Hero Banner with Quick Gallery Access if images exist */}
          {allImages.length > 0 && (
            <div className="relative h-48 sm:h-56 w-full bg-neutral-900 overflow-hidden shrink-0 group">
              <img 
                src={allImages[0]} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Camera className="w-4 h-4 text-[#D8F36A]" />
                  <span>צפה בגלריית האירוע ({allImages.length} תמונות)</span>
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
                </button>

                <span className="text-[11px] text-white/80 bg-black/50 px-2 py-1 rounded-md backdrop-blur-xs hidden sm:inline-block">
                  תמונת נושא · מקום האירוע
                </span>
              </div>
            </div>
          )}

          {/* Expired warning if applicable */}
          {isExpired && (
            <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>אירוע זה הסתיים, הוסתר או שפג תוקף פרסומו. המידע מוצג לעיון היסטורי בלבד.</span>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Organizer Lockup */}
          <div className="bg-[#F7F8F4] rounded-xl p-4 border border-neutral-200/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-neutral-500 block mb-0.5">מארגן האירוע:</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrganizer(event.organizerId);
                }}
                className="text-base font-bold text-[#123B32] hover:underline"
              >
                {org?.name || 'מארגן מאומת'}
              </button>
              <span className="text-xs text-neutral-500 block mt-0.5">
                {org?.city} · {org?.type === 'club' ? 'מועדון פוקר קבוע' : 'מארגן טורנירים עצמאי'}
              </span>
            </div>

            {org && (
              <div className="flex flex-wrap items-center gap-2">
                {(org.reviewCount ?? 0) > 0 ? (
                  <div className="text-left bg-white px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-amber-600 flex items-center gap-1.5 tabular-nums">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{org.averageRating?.toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({org.reviewCount} ביקורות)</span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                    טרם נוספו ביקורות
                  </span>
                )}

                {onOpenSubmitReview && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSubmitReview({
                        type: 'organizer',
                        id: event.organizerId,
                        name: org?.name || 'מארגן'
                      });
                    }}
                    className="py-1.5 px-3 rounded-lg bg-[#123B32] hover:bg-[#1a4a40] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#D8F36A] text-[#D8F36A]" />
                    <span>הוסף דירוג וביקורת</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pricing Breakdown: Core Value Proposition */}
          <div>
            <h3 className="text-sm font-bold text-[#17231F] mb-2 flex items-center gap-1.5">
              <span>פירוט עלות הכניסה (שקיפות מחירים מלאה)</span>
            </h3>
            
            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="p-3.5 flex items-center justify-between bg-white">
                <span className="text-neutral-600">סכום המועבר לקופת הפרסים (Prize Pool):</span>
                <span className="font-bold text-[#17231F] tabular-nums">{event.prizePoolAmount.toLocaleString('he-IL')} ₪</span>
              </div>
              <div className="p-3.5 flex items-center justify-between bg-white">
                <span className="text-neutral-600">עמלת המארגן / הבית (House Fee):</span>
                <span className="font-semibold text-neutral-700 tabular-nums">{event.houseFeeAmount.toLocaleString('he-IL')} ₪</span>
              </div>
              {event.extraFeeAmount > 0 && (
                <div className="p-3.5 flex items-center justify-between bg-amber-50/50">
                  <span className="text-amber-900">
                    תשלום חובה נוסף ({event.extraFeeDescription || 'דמי טיפול ורישום'}):
                  </span>
                  <span className="font-semibold text-amber-900 tabular-nums">{event.extraFeeAmount.toLocaleString('he-IL')} ₪</span>
                </div>
              )}
              <div className="p-4 flex items-center justify-between bg-[#F7F8F4] font-bold text-base text-[#123B32]">
                <span>סך הכל לתשלום בכניסה:</span>
                <span className="text-xl tabular-nums">{event.totalBuyIn.toLocaleString('he-IL')} ₪</span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              * PokerCircle מתחייב לשקיפות מלאה. אין תשלומים נסתרים מעבר למפורט בטבלה.
            </p>
          </div>

          {/* Tournament Structure & Rules */}
          <div>
            <h3 className="text-sm font-bold text-[#17231F] mb-2.5">
              מבנה הטורניר וחוקים
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="p-3 bg-[#F7F8F4] rounded-xl border border-neutral-200/60">
                <span className="text-neutral-500 text-[11px] block mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  ערימת פתיחה
                </span>
                <span className="font-bold text-[#17231F] text-sm tabular-nums">
                  {event.startingStack.toLocaleString('he-IL')}
                </span>
              </div>

              <div className="p-3 bg-[#F7F8F4] rounded-xl border border-neutral-200/60">
                <span className="text-neutral-500 text-[11px] block mb-1 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  משך רמות
                </span>
                <span className="font-bold text-[#17231F] text-sm tabular-nums">
                  {event.levelDuration} דקות
                </span>
              </div>

              <div className="p-3 bg-[#F7F8F4] rounded-xl border border-neutral-200/60 col-span-2 sm:col-span-1">
                <span className="text-neutral-500 text-[11px] block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  סיום משוער
                </span>
                <span className="font-bold text-[#17231F] text-sm">
                  {event.estimatedEndDateTime ? formatFullJerusalemDate(event.estimatedEndDateTime).split(',')[1] : 'לפי קצב שולחן הגמר'}
                </span>
              </div>
            </div>

            {/* Re-entry terms */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs mb-3">
              <span className="font-bold text-neutral-800 block mb-1 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#123B32]" />
                תנאי כניסה חוזרת ותוספות (Re-entry & Add-ons):
              </span>
              <p className="text-neutral-600 leading-relaxed">
                {event.reEntryTerms}
              </p>
            </div>

            {/* Additional organizer notes */}
            {event.description && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                <span className="font-bold text-neutral-800 block mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#123B32]" />
                  מידע נוסף שמסר המארגן:
                </span>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Event Photo Gallery: מקום האירוע, מבנה הטורניר ושלבים */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#17231F] flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-[#123B32]" />
                  <span>גלריית תמונות האירוע</span>
                  {allImages.length > 0 && (
                    <span className="text-xs text-neutral-400 font-normal">({allImages.length})</span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  מקום האירוע, עמדות השולחנות, מבנה השלבים ותמונות ששותפו ע״י המארגן
                </p>
              </div>

              {allImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="text-xs font-semibold text-[#123B32] hover:underline flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>הצג בגודל מלא</span>
                </button>
              )}
            </div>

            {allImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative h-28 sm:h-32 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200/80 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`תמונת אירוע ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/70 text-white p-2 rounded-full backdrop-blur-xs">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Badge */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                      {idx === 0 ? 'תמונת נושא' : idx === 1 ? 'מקום האירוע' : idx === 2 ? 'מבנה / פרסים' : `תמונה ${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 text-center text-xs text-neutral-500">
                <Camera className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
                <span>המארגן טרם צירף תמונות לאירוע זה. ניתן לבקש תמונות נוספות ישירות בעת הפנייה.</span>
              </div>
            )}
          </div>

          {/* Location disclaimer */}
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>הגעה ומיקום:</strong> האירוע מתקיים ב{event.city}. כתובת מלאה ופרטי כניסה יימסרו ישירות על ידי המארגן בעת הפנייה.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#F7F8F4] border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShare(event)}
              className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>שתף אירוע</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              <span>{copiedLink ? 'הקישור הועתק!' : 'העתק קישור'}</span>
            </button>
          </div>

          {/* Direct Organizer Contact CTA */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {org?.telegram && (
              <button
                onClick={handleTelegram}
                disabled={isExpired}
                className="py-2.5 px-3.5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-medium text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Telegram</span>
              </button>
            )}

            <button
              onClick={handleWhatsApp}
              disabled={isExpired}
              className="py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span>פנה למארגן ב-WhatsApp</span>
            </button>
          </div>

        </div>

      </div>
    </div>

    {/* Fullscreen Interactive Lightbox Modal */}
    {lightboxIndex !== null && allImages[lightboxIndex] && (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="גלריית תמונות אירוע"
        className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6"
      >
        {/* Lightbox Header */}
        <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              {event.title}
            </h4>
            <span className="text-xs text-neutral-400">
              תמונה {lightboxIndex + 1} מתוך {allImages.length} {lightboxIndex === 0 ? '· תמונת נושא' : lightboxIndex === 1 ? '· מקום האירוע' : '· מבנה הטורניר'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="סגור תצוגה מוגדלת"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lightbox Main Stage */}
        <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 my-auto relative overflow-hidden py-3">
          {/* Previous Button (In RTL, Prev is right) */}
          <button
            type="button"
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1))}
            className="p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-colors shrink-0 z-10"
            aria-label="התמונה הקודמת"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Centered Image */}
          <div className="flex-1 flex items-center justify-center max-h-[72vh] overflow-hidden">
            <img 
              src={allImages[lightboxIndex]} 
              alt={`תמונת אירוע ${lightboxIndex + 1}`}
              className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
            />
          </div>

          {/* Next Button (In RTL, Next is left) */}
          <button
            type="button"
            onClick={() => setLightboxIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0))}
            className="p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-colors shrink-0 z-10"
            aria-label="התמונה הבאה"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Lightbox Thumbnails Strip */}
        {allImages.length > 1 && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto shrink-0 pb-1">
            {allImages.map((thumbUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  lightboxIndex === idx ? 'border-[#D8F36A] ring-2 ring-[#D8F36A]/50 scale-105' : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={thumbUrl} 
                  alt={`תמונה ממוזערת ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )}
    </>
  );
};
