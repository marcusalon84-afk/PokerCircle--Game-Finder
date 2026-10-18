import React, { useState } from 'react';
import type { FilterState } from '../types/poker.ts';
import { Search, MapPin, Calendar, DollarSign, ArrowUpDown, RotateCcw, Navigation } from 'lucide-react';

interface SearchAndFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  onOpenAddEvent?: () => void;
  onOpenOrganizerContact?: () => void;
}

const REGIONS = [
  { label: 'כל האזורים', value: 'all' },
  { label: 'תל אביב', value: 'תל אביב' },
  { label: 'הרצליה והשרון', value: 'שרון' },
  { label: 'מרכז וגוש דן', value: 'מרכז' },
  { label: 'ראשון לציון והשפלה', value: 'שפלה' },
  { label: 'ירושלים', value: 'ירושלים' },
  { label: 'צפון', value: 'צפון' },
  { label: 'דרום', value: 'דרום' }
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onOpenAddEvent,
  onOpenOrganizerContact
}) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('הדפדפן אינו תומך בזיהוי מיקום');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onChange({
          ...filters,
          userCoords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          },
          useDistance: true,
          sortBy: 'distance_asc'
        });
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('לא ניתן לגשת למיקום. באפשרותך לבחור עיר ידנית.');
      },
      { timeout: 8000 }
    );
  };

  const handleClearDistance = () => {
    onChange({
      ...filters,
      userCoords: null,
      useDistance: false,
      sortBy: 'date_asc'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
      {/* Search query row */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="חיפוש לפי עיר, מארגן או שם אירוע (למשל: תל אביב, דיפסטאק, אייס)..."
          className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-[#F7F8F4]/50 focus:bg-white focus:outline-none focus:border-[#123B32] transition-colors"
        />
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Date Selector Segmented Control */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>מועד האירוע</span>
          </label>
          <div className="flex bg-[#F7F8F4] p-1 rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateRange: 'today' })}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.dateRange === 'today'
                  ? 'bg-white text-[#123B32] shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              היום
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateRange: 'next7days' })}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.dateRange === 'next7days'
                  ? 'bg-white text-[#123B32] shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              7 ימים
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateRange: 'all' })}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.dateRange === 'all'
                  ? 'bg-white text-[#123B32] shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              הכל
            </button>
          </div>
        </div>

        {/* Region / City Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>אזור / עיר</span>
          </label>
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200/80 bg-[#F7F8F4]/50 focus:bg-white focus:outline-none focus:border-[#123B32]"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Total Buy-in (הסכום הכולל לתשלום) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
              <span>סך הכל כניסה מרבי</span>
            </label>
            <span className="text-[11px] font-bold text-[#123B32] tabular-nums">
              {filters.maxTotalBuyIn ? `עד ${filters.maxTotalBuyIn} ₪` : 'ללא הגבלה'}
            </span>
          </div>
          <select
            value={filters.maxTotalBuyIn || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxTotalBuyIn: e.target.value ? parseInt(e.target.value, 10) : null
              })
            }
            className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200/80 bg-[#F7F8F4]/50 focus:bg-white focus:outline-none focus:border-[#123B32]"
          >
            <option value="">כל המחירים</option>
            <option value="400">עד 400 ₪ (סך הכל לתשלום)</option>
            <option value="600">עד 600 ₪ (סך הכל לתשלום)</option>
            <option value="800">עד 800 ₪ (סך הכל לתשלום)</option>
            <option value="1200">עד 1,200 ₪ (סך הכל לתשלום)</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span>מיון תוצאות</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterState['sortBy']
              })
            }
            className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200/80 bg-[#F7F8F4]/50 focus:bg-white focus:outline-none focus:border-[#123B32]"
          >
            <option value="date_asc">הקרוב ביותר בזמן</option>
            <option value="price_asc">המחיר הכולל הנמוך ביותר</option>
            <option value="distance_asc">הקרוב ביותר במרחק</option>
          </select>
        </div>

      </div>

      {/* Geolocation & Reset Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-3">
          {!filters.useDistance ? (
            <button
              type="button"
              onClick={handleGeoLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-[#123B32] font-medium py-1 px-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#123B32]" />
              <span>{geoLoading ? 'מאתר מיקום...' : 'השתמש במיקום שלי (חישוב מרחק משוער)'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 py-1 px-2.5 rounded-lg border border-emerald-200">
              <span className="font-medium">מיון לפי מרחק משוער למרכז העיר פעיל</span>
              <button
                type="button"
                onClick={handleClearDistance}
                className="text-emerald-900 underline font-semibold text-[11px]"
              >
                בטל
              </button>
            </div>
          )}

          {geoError && (
            <span className="text-[11px] text-red-600">{geoError}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800 transition-colors text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>איפוס מסננים</span>
        </button>
      </div>

      {/* Estimated distance disclaimer per spec */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-normal">
        <div>
          * <strong>שקיפות מלאה:</strong> מסנן המחיר מחשב את סך כל העלויות שחובה לשלם בכניסה (קופה + עמלה + תוספות חובה). כתובת הגעה מדויקת נמסרת ע״י המארגן בפרטי.
        </div>
        {(onOpenOrganizerContact || onOpenAddEvent) && (
          <button
            type="button"
            onClick={onOpenOrganizerContact || onOpenAddEvent}
            className="text-xs font-bold text-[#123B32] hover:text-[#1a4a40] hover:underline whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-3 rounded-lg bg-[#D8F36A]/40 hover:bg-[#D8F36A]/70 border border-[#123B32]/15 transition-all shadow-2xs"
          >
            <span>מארגן? פרסם את הטורניר שלך בלוח ←</span>
          </button>
        )}
      </div>
    </div>
  );
};
