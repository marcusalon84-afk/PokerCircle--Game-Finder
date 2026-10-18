import React from 'react';
import type { TournamentEvent } from '../types/poker.ts';
import { formatEventDateTime } from '../utils/date.ts';
import { MapPin, Clock, Star, Layers, Timer, Sparkles, Images, Camera } from 'lucide-react';

interface TournamentCardProps {
  event: TournamentEvent;
  onSelect: (event: TournamentEvent) => void;
  onOrganizerClick: (organizerId: string) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  event,
  onSelect,
  onOrganizerClick
}) => {
  const { dateStr, timeStr, isToday } = formatEventDateTime(event.startDateTime);
  const org = event.organizer;
  const coverImage = event.coverImageUrl || (event.galleryImages && event.galleryImages.length > 0 ? event.galleryImages[0] : null);
  const totalPhotos = (event.galleryImages?.length || (event.coverImageUrl ? 1 : 0));

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden group ${
      event.promotionType === 'sponsored' 
        ? 'border-emerald-300 ring-1 ring-emerald-200' 
        : event.promotionType === 'featured'
        ? 'border-[#123B32]/30'
        : 'border-neutral-200/80'
    }`}>
      
      {/* Top Banner for sponsored / demo indication */}
      {(event.promotionType === 'sponsored' || event.promotionType === 'featured' || event.isDemo) && (
        <div className="bg-[#F7F8F4] px-5 py-1.5 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            {event.promotionType === 'sponsored' ? (
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                אירוע ממומן (נבדק ע״י המערכת)
              </span>
            ) : event.promotionType === 'featured' ? (
              <span className="font-semibold text-[#123B32]">
                אירוע מודגש
              </span>
            ) : null}
          </div>

          {event.isDemo && (
            <span className="text-neutral-400 font-mono text-[10px]">
              נתוני הדגמה לבדיקה
            </span>
          )}
        </div>
      )}

      {/* Cover Image (תמונת נושא לאירוע) */}
      {coverImage && (
        <div 
          onClick={() => onSelect(event)}
          className="relative h-40 sm:h-44 w-full bg-neutral-900 cursor-pointer overflow-hidden"
        >
          <img 
            src={coverImage} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Photos count badge */}
          {totalPhotos > 0 && (
            <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/20">
              <Camera className="w-3.5 h-3.5 text-[#D8F36A]" />
              <span>{totalPhotos} {totalPhotos === 1 ? 'תמונה' : 'תמונות (גלריה)'}</span>
            </div>
          )}

          {/* Quick city pill on image */}
          <div className="absolute top-2.5 right-3 bg-white/90 backdrop-blur-xs text-[#17231F] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
            <MapPin className="w-3 h-3 text-[#123B32]" />
            <span>{event.city}</span>
          </div>
        </div>
      )}

      {/* Main card body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Item 1: City and Date */}
          <div className="flex items-center justify-between text-xs text-[#5A6B65] mb-2 font-medium">
            <div className="flex items-center gap-2">
              {!coverImage && (
                <>
                  <span className="flex items-center gap-1 text-[#17231F] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#123B32]" />
                    {event.city}
                  </span>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                </>
              )}
              <span className={`flex items-center gap-1 ${isToday ? 'text-emerald-700 font-bold' : ''}`}>
                <Clock className="w-3.5 h-3.5" />
                {dateStr}, {timeStr}
              </span>
            </div>

            {/* Distance if calculated */}
            {(event as any).estimatedDistanceKm !== undefined && (event as any).estimatedDistanceKm !== null && (
              <span className="text-[11px] text-neutral-400 tabular-nums">
                ~{(event as any).estimatedDistanceKm} ק״מ
              </span>
            )}
          </div>

          {/* Item 2: Organizer name and star rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={() => onOrganizerClick(event.organizerId)}
              className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 hover:underline transition-colors text-right"
            >
              {org?.name || 'מארגן מאומת'}
            </button>

            {org && (org.reviewCount ?? 0) > 0 ? (
              <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{org.averageRating?.toFixed(1)}</span>
                <span className="text-neutral-400 font-normal">({org.reviewCount})</span>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-400">טרם דורג</span>
            )}
          </div>

          {/* Item 3: Tournament Title */}
          <h3 
            onClick={() => onSelect(event)}
            className="text-lg font-bold text-[#17231F] hover:text-[#123B32] cursor-pointer transition-colors mb-3 leading-snug"
          >
            {event.title}
          </h3>

          {/* Item 4: Structure Specs (Clean unboxed line) */}
          <div className="flex items-center gap-4 text-xs text-neutral-600 mb-5">
            <div className="flex items-center gap-1.5 tabular-nums">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>{event.startingStack.toLocaleString('he-IL')} צ׳יפים</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <div className="flex items-center gap-1.5 tabular-nums">
              <Timer className="w-3.5 h-3.5 text-neutral-400" />
              <span>רמות {event.levelDuration} דקות</span>
            </div>
          </div>
        </div>

        {/* Item 5 & 6: Transparent Price Box - Core Value of PokerCircle */}
        <div className="bg-[#F7F8F4] rounded-xl p-3.5 mb-5 border border-neutral-200/60">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold text-neutral-600">סך הכל כניסה לתשלום:</span>
            <span className="text-xl font-black text-[#123B32] tabular-nums">
              {event.totalBuyIn.toLocaleString('he-IL')} ₪
            </span>
          </div>

          {/* Breakdown equation */}
          <div className="text-[11px] text-neutral-600 space-y-0.5 pt-1.5 border-t border-neutral-200/50">
            <div className="flex items-center justify-between text-emerald-950">
              <span>לקופת הפרסים:</span>
              <span className="font-semibold tabular-nums">{event.prizePoolAmount.toLocaleString('he-IL')} ₪</span>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <span>עמלת מארגן / בית:</span>
              <span className="tabular-nums">{event.houseFeeAmount.toLocaleString('he-IL')} ₪</span>
            </div>
            {event.extraFeeAmount > 0 && (
              <div className="flex items-center justify-between text-amber-800">
                <span>תשלום חובה ({event.extraFeeDescription || 'תוספת'}):</span>
                <span className="tabular-nums">{event.extraFeeAmount.toLocaleString('he-IL')} ₪</span>
              </div>
            )}
          </div>
        </div>

        {/* Item 7: Action button */}
        <button
          onClick={() => onSelect(event)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
        >
          <span>לפרטים ולהצטרפות</span>
        </button>
      </div>

    </div>
  );
};
