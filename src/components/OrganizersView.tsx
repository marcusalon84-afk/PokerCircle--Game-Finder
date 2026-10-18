import React, { useState, useEffect } from 'react';
import type { Organizer, Review } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Phone, 
  PlusCircle, 
  ShieldCheck, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';

interface OrganizersViewProps {
  onOpenSubmitReview: (target: { type: 'organizer' | 'club'; id: string; name: string }) => void;
  onSelectOrganizer: (organizerId: string) => void;
}

export const OrganizersView: React.FC<OrganizersViewProps> = ({
  onOpenSubmitReview,
  onSelectOrganizer
}) => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [orgReviewsMap, setOrgReviewsMap] = useState<Record<string, Review[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<string, boolean>>({});

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizers();
      setOrganizers(data);
    } catch (err) {
      console.error('Failed to load organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const toggleExpandReviews = async (orgId: string) => {
    if (expandedOrgId === orgId) {
      setExpandedOrgId(null);
      return;
    }

    setExpandedOrgId(orgId);

    if (!orgReviewsMap[orgId]) {
      setLoadingReviews((prev) => ({ ...prev, [orgId]: true }));
      try {
        const details = await api.getOrganizerById(orgId);
        setOrgReviewsMap((prev) => ({ ...prev, [orgId]: details.reviews }));
      } catch (err) {
        console.error('Failed to fetch reviews for org:', err);
      } finally {
        setLoadingReviews((prev) => ({ ...prev, [orgId]: false }));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>דירוגי שחקנים מאומתים בלבד</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F]">
            מארגנים, מועדונים ודירוגי שחקנים
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B65] mt-1 max-w-2xl leading-relaxed">
            הדירוגים מחושבים אוטומטית על פי ביקורות מאושרות של שחקנים. כל שחקן יכול לדרג ולהוסיף חוות דעת.
          </p>
        </div>

        <button
          onClick={() => onOpenSubmitReview({ type: 'organizer', id: organizers[0]?.id || '', name: organizers[0]?.name || '' })}
          className="py-3 px-5 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#D8F36A]" />
          <span>הוסף ביקורת ודירוג</span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-[#123B32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">טוען מארגנים ודירוגים...</p>
        </div>
      ) : organizers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 p-8 text-neutral-500 text-xs">
          אין מארגנים להצגה כרגע.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizers.map((org) => {
            const hasReviews = (org.reviewCount ?? 0) > 0;
            const isExpanded = expandedOrgId === org.id;
            const reviewsList = orgReviewsMap[org.id] || [];
            const isLoadingReviews = loadingReviews[org.id];

            return (
              <div 
                key={org.id} 
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  
                  {/* Organizer Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#5A6B65] mb-1 font-medium">
                        <span className="flex items-center gap-1 text-[#17231F] font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#123B32]" />
                          {org.city}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{org.type === 'club' ? 'מועדון פוקר קבוע' : 'מארגן טורנירים'}</span>
                      </div>
                      <h2 
                        onClick={() => onSelectOrganizer(org.id)}
                        className="text-lg font-bold text-[#17231F] hover:text-[#123B32] cursor-pointer transition-colors"
                      >
                        {org.name}
                      </h2>
                    </div>

                    {/* Calculated Average Rating Box */}
                    <div className="bg-[#F7F8F4] px-3 py-2 rounded-xl border border-neutral-200/70 text-center shrink-0">
                      {hasReviews ? (
                        <div>
                          <div className="flex items-center justify-center gap-1 text-base font-extrabold text-amber-600 tabular-nums">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{org.averageRating?.toFixed(1)}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium block">
                            {org.reviewCount} ביקורות
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-xs font-semibold text-neutral-400">טרם דורג</div>
                          <span className="text-[10px] text-neutral-400">היה הראשון לדרג</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                    {org.description || 'מארגן טורנירים מקצועי עם שקיפות מחירים מובנית.'}
                  </p>

                  {/* Contact channels */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    {org.whatsapp && (
                      <a
                        href={`https://wa.me/${org.whatsapp}?text=שלום,+אני+פונה+בעקבות+הפרופיל+ב-PokerCircle`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#25D366]/10 text-[#123B32] font-semibold hover:bg-[#25D366]/20 transition-colors text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {org.telegram && (
                      <a
                        href={`https://t.me/${org.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#2AABEE]/10 text-[#123B32] font-semibold hover:bg-[#2AABEE]/20 transition-colors text-[11px]"
                      >
                        <span>Telegram</span>
                      </a>
                    )}
                    {org.phone && (
                      <a
                        href={`tel:${org.phone}`}
                        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors text-[11px]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{org.phone}</span>
                      </a>
                    )}
                  </div>

                </div>

                {/* Bottom Actions & Reviews Expansion */}
                <div className="pt-5 mt-4 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpandReviews(org.id)}
                      className="text-xs font-semibold text-neutral-600 hover:text-[#123B32] flex items-center gap-1 transition-colors"
                    >
                      <span>ביקורות מאושרות ({org.reviewCount ?? 0})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenSubmitReview({ type: 'organizer', id: org.id, name: org.name })}
                      className="py-1.5 px-3 rounded-lg bg-[#123B32] hover:bg-[#1a4a40] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#D8F36A] text-[#D8F36A]" />
                      <span>הוסף דירוג וביקורת</span>
                    </button>
                  </div>

                  {/* Expanded Reviews list */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                      {isLoadingReviews ? (
                        <div className="text-center py-4 text-xs text-neutral-400">
                          טוען ביקורות מאושרות...
                        </div>
                      ) : reviewsList.length === 0 ? (
                        <div className="p-3 bg-[#F7F8F4] rounded-xl text-center text-xs text-neutral-500">
                          עדיין אין ביקורות מאושרות עבור מארגן זה. לחץ על "הוסף דירוג וביקורת" כדי להיות הראשון!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {reviewsList.map((rev) => (
                            <div key={rev.id} className="p-3 rounded-xl bg-[#F7F8F4] border border-neutral-200/60 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#17231F]">{rev.displayName}</span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-neutral-700 leading-relaxed text-[11px]">
                                "{rev.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Information footer banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="block">שקיפות הדירוג ב־PokerCircle:</strong>
          <span>
            כדי למנוע ביקורות מזויפות והטיות, כל ביקורת מועברת לבדיקת אימות של הנהלת האתר (סטטוס Pending) לפני הצגתה. הציון הממוצע מחושב במדויק מתוך סך הביקורות המאושרות בלבד.
          </span>
        </div>
      </div>

    </div>
  );
};
