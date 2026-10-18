import React, { useState, useEffect } from 'react';
import type { Organizer, TournamentEvent, Review, User } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { formatEventDateTime } from '../utils/date.ts';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Globe, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface OrganizerProfileModalProps {
  organizerId: string | null;
  currentUser: User | null;
  onClose: () => void;
  onSelectEvent: (event: TournamentEvent) => void;
  onOpenAuth: () => void;
}

export const OrganizerProfileModal: React.FC<OrganizerProfileModalProps> = ({
  organizerId,
  currentUser,
  onClose,
  onSelectEvent,
  onOpenAuth
}) => {
  const [data, setData] = useState<{
    organizer: Organizer;
    activeEvents: TournamentEvent[];
    reviews: Review[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!organizerId) return;
    setLoading(true);
    setError(null);
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);

    api.getOrganizerById(organizerId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'שגיאה בטעינת פרטי המארגן');
        setLoading(false);
      });
  }, [organizerId]);

  if (!organizerId) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!comment.trim() || !displayName.trim()) {
      setReviewErrorMsg('נא למלא כינוי וטקסט ביקורת');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg(null);
    setReviewSuccessMsg(null);

    try {
      const res = await api.submitReview({
        targetType: 'organizer',
        targetId: organizerId,
        rating,
        comment,
        displayName,
        userEmail: currentUser.email
      });

      setReviewSuccessMsg(res.message || 'הביקורת נשלחה וממתינה לבדיקת מנהל.');
      setComment('');
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'שגיאה בהגשת הביקורת');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="organizer-modal-title"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-200 mb-1 font-medium">
              <span>{data?.organizer.city}</span>
              <span aria-hidden="true">·</span>
              <span>{data?.organizer.type === 'club' ? 'מועדון פוקר קבוע' : 'מארגן טורנירים'}</span>
              {data?.organizer.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#D8F36A] font-mono text-[10px]">נתוני הדגמה</span>
                </>
              )}
            </div>
            <h2 id="organizer-modal-title" className="text-xl sm:text-2xl font-bold">
              {data?.organizer.name || 'פרופיל מארגן'}
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-sm text-neutral-500">
              טוען פרטי מארגן...
            </div>
          ) : error || !data ? (
            <div className="text-center py-12 text-sm text-red-600">
              {error || 'מארגן לא נמצא'}
            </div>
          ) : (
            <>
              {/* Description & Contact info */}
              <div>
                <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                  {data.organizer.description}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {data.organizer.whatsapp && (
                    <a
                      href={`https://wa.me/${data.organizer.whatsapp}?text=שלום,+אני+פונה+בעקבות+הפרופיל+ב-PokerCircle`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#25D366]/10 text-[#123B32] font-semibold hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp ישיר</span>
                    </a>
                  )}

                  {data.organizer.telegram && (
                    <a
                      href={`https://t.me/${data.organizer.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#2AABEE]/10 text-[#123B32] font-semibold hover:bg-[#2AABEE]/20 transition-colors"
                    >
                      <span>ערוץ Telegram</span>
                    </a>
                  )}

                  {data.organizer.phone && (
                    <a
                      href={`tel:${data.organizer.phone}`}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{data.organizer.phone}</span>
                    </a>
                  )}

                  {data.organizer.website && (
                    <a
                      href={data.organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>אתר רשמי</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Active Events of this organizer */}
              <div>
                <h3 className="text-sm font-bold text-[#17231F] mb-3 flex items-center justify-between">
                  <span>טורנירים פעילים קרובים ({data.activeEvents.length})</span>
                </h3>

                {data.activeEvents.length === 0 ? (
                  <p className="text-xs text-neutral-500 bg-[#F7F8F4] p-4 rounded-xl border border-neutral-200/60">
                    אין כרגע טורנירים פתוחים למארגן זה. פרסומים חדשים יעודכנו כאן בקרוב.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {data.activeEvents.map((evt) => {
                      const { dateStr, timeStr } = formatEventDateTime(evt.startDateTime);
                      return (
                        <div
                          key={evt.id}
                          onClick={() => {
                            onClose();
                            onSelectEvent(evt);
                          }}
                          className="p-3.5 bg-[#F7F8F4] hover:bg-emerald-50/50 rounded-xl border border-neutral-200/80 cursor-pointer transition-colors flex items-center justify-between gap-3"
                        >
                          <div>
                            <h4 className="text-sm font-bold text-[#17231F] mb-1">
                              {evt.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {dateStr}, {timeStr}
                              </span>
                              <span>·</span>
                              <span>{evt.city}</span>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-base font-bold text-[#123B32] block tabular-nums">
                              {evt.totalBuyIn} ₪
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {evt.prizePoolAmount} ₪ לפרסים
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#17231F]">
                      ביקורות ודירוג שחקנים
                    </h3>
                    <p className="text-xs text-neutral-500">
                      דירוגים מאושרים בלבד על ידי הנהלת PokerCircle
                    </p>
                  </div>

                  {data.organizer.reviewCount ? (
                    <div className="flex items-center gap-1.5 text-base font-bold text-amber-600 tabular-nums">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{data.organizer.averageRating?.toFixed(1)}</span>
                      <span className="text-xs text-neutral-400 font-normal">
                        ({data.organizer.reviewCount})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">טרם נוספו ביקורות</span>
                  )}
                </div>

                {/* Approved reviews list */}
                {data.reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 bg-[#F7F8F4] p-4 rounded-xl border border-neutral-200/60 mb-6">
                    עדיין אין ביקורות מאושרות עבור מארגן זה. היית באירוע? שתף את החוויה שלך.
                  </p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {data.reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-[#F7F8F4] rounded-xl border border-neutral-200/70 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-neutral-800">{rev.displayName}</span>
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
                        <p className="text-neutral-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write a review form */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                  <h4 className="text-xs font-bold text-[#17231F] mb-3">
                    הוספת ביקורת על המארגן
                  </h4>

                  {!currentUser ? (
                    <div className="text-center py-4 bg-[#F7F8F4] rounded-lg">
                      <p className="text-xs text-neutral-600 mb-2.5">
                        כדי לשמור על אמינות הביקורות, כתיבת ביקורת מתאפשרת למשתמשים רשומים בלבד.
                      </p>
                      <button
                        onClick={onOpenAuth}
                        className="py-1.5 px-4 rounded-lg bg-[#123B32] text-white text-xs font-medium hover:bg-[#1a4a40]"
                      >
                        התחבר לכתיבת ביקורת
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      {reviewSuccessMsg && (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{reviewSuccessMsg}</span>
                        </div>
                      )}

                      {reviewErrorMsg && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{reviewErrorMsg}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          דירוג (1 עד 5 כוכבים):
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 text-amber-400 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating ? 'fill-amber-400' : 'text-neutral-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-neutral-700 mr-2 tabular-nums">
                            {rating} מתוך 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          כינוי לתצוגה:
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="למשל: יובל פ."
                          className="w-full p-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          תוכן הביקורת (אווירה, מקצועיות דילרים, שקיפות פרסים):
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          placeholder="שתף את השחקנים בחוות דעתך האמיתית על המארגן..."
                          className="w-full p-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-neutral-400">
                          * כל ביקורת מועברת לאישור מנהל לפני פרסומה למניעת תוכן פוגעני או כפילויות.
                        </span>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="py-2 px-4 rounded-lg bg-[#123B32] text-white text-xs font-semibold hover:bg-[#1a4a40] disabled:opacity-50 transition-colors"
                        >
                          {submittingReview ? 'שולח ביקורת...' : 'שלח לאישור'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
