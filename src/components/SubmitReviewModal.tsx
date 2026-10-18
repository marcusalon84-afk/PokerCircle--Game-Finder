import React, { useState } from 'react';
import { api } from '../utils/api.ts';
import type { Organizer, OnlineClub, User } from '../types/poker.ts';
import { X, Star, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: 'organizer' | 'club';
    id: string;
    name: string;
  } | null;
  organizers: Organizer[];
  clubs: OnlineClub[];
  currentUser: User | null;
  onReviewSubmitted?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'טעון שיפור רב (חוסר שקיפות / ארגון לקוי)',
  2: 'מתחת לממוצע (היו בעיות במהלך האירוע)',
  3: 'בסדר (אירוע סביר, עמד בציפיות הבסיסיות)',
  4: 'טוב מאוד (שקיפות טובה, דילרים מקצועיים)',
  5: 'מצוין! (שקיפות מלאה, אווירה ספורטיבית, עמידה בזמנים)'
};

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onClose,
  target,
  organizers,
  clubs,
  currentUser,
  onReviewSubmitted
}) => {
  const [selectedTargetType, setSelectedTargetType] = useState<'organizer' | 'club'>(
    target?.type || 'organizer'
  );
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    target?.id || (organizers[0]?.id || '')
  );

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [nickname, setNickname] = useState(currentUser?.displayName || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if target prop changes
  React.useEffect(() => {
    if (target) {
      setSelectedTargetType(target.type);
      setSelectedTargetId(target.id);
    } else if (organizers.length > 0 && !selectedTargetId) {
      setSelectedTargetId(organizers[0].id);
    }
  }, [target, organizers]);

  if (!isOpen) return null;

  const currentTargetName =
    target?.name ||
    (selectedTargetType === 'organizer'
      ? organizers.find((o) => o.id === selectedTargetId)?.name
      : clubs.find((c) => c.id === selectedTargetId)?.name) ||
    'מארגן / מועדון';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('נא להזין כינוי שחקן לתצוגה');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('נא להזין תוכן ביקורת');
      return;
    }
    if (rating < 1 || rating > 5) {
      setErrorMsg('נא לבחור דירוג בין 1 ל-5 כוכבים');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.submitReview({
        targetType: selectedTargetType,
        targetId: selectedTargetId,
        rating,
        displayName: nickname.trim(),
        userEmail: userEmail.trim() || undefined,
        comment: comment.trim()
      });

      setSuccessMsg(res.message || 'הביקורת התקבלה בהצלחה ותוצג לאחר אישור מנהל.');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בהגשת הביקורת');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-review-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D8F36A]" />
            <div>
              <h2 id="submit-review-title" className="text-base font-bold">
                הוספת ביקורת ודירוג שחקנים
              </h2>
              <span className="text-xs text-emerald-200 block">
                עבור: {currentTargetName}
              </span>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs">
          {successMsg ? (
            <div className="text-center py-6 space-y-3.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-[#17231F]">
                הביקורת נקלטה בהצלחה!
              </h3>
              <p className="text-xs text-[#5A6B65] max-w-sm mx-auto leading-relaxed">
                {successMsg}
              </p>
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-[11px] border border-emerald-200 max-w-sm mx-auto">
                <strong>שקיפות ואמינות:</strong> כל ביקורת עוברת בדיקה של מנהל מערכת לפני פרסומה כדי למנוע ספאם ולשמור על דירוג אותנטי המבוסס על שחקנים אמיתיים.
              </div>
              <button
                onClick={handleResetAndClose}
                className="mt-2 py-2.5 px-6 rounded-xl bg-[#123B32] text-white font-semibold hover:bg-[#1a4a40]"
              >
                סגור חלון
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Target Selector if not fixed */}
              {!target && (
                <div className="space-y-2">
                  <label className="block font-semibold text-neutral-700">
                    בחר מארגן או מועדון לדירוג:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetType('organizer');
                        if (organizers.length > 0) setSelectedTargetId(organizers[0].id);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold ${
                        selectedTargetType === 'organizer'
                          ? 'bg-[#123B32] text-white border-[#123B32]'
                          : 'bg-[#F7F8F4] text-neutral-700 border-neutral-200'
                      }`}
                    >
                      מארגן טורנירים חיים
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetType('club');
                        if (clubs.length > 0) setSelectedTargetId(clubs[0].id);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold ${
                        selectedTargetType === 'club'
                          ? 'bg-[#123B32] text-white border-[#123B32]'
                          : 'bg-[#F7F8F4] text-neutral-700 border-neutral-200'
                      }`}
                    >
                      מועדון ClubGG
                    </button>
                  </div>

                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-[#F7F8F4] text-xs focus:bg-white focus:outline-none focus:border-[#123B32]"
                  >
                    {selectedTargetType === 'organizer'
                      ? organizers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.city})
                          </option>
                        ))
                      : clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (ClubGG #{c.clubggId})
                          </option>
                        ))}
                  </select>
                </div>
              )}

              {/* Star Rating (1 to 5) with hover effect and text description */}
              <div className="bg-[#F7F8F4] p-4 rounded-xl border border-neutral-200/80 text-center space-y-2">
                <label className="block text-xs font-bold text-[#17231F]">
                  בחר דירוג כוכבים (1 עד 5):
                </label>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating !== null ? hoverRating : rating;
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                        aria-label={`${star} כוכבים`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-[#123B32] min-h-[1.25rem]">
                  {RATING_DESCRIPTIONS[hoverRating !== null ? hoverRating : rating]}
                </div>
              </div>

              {/* Nickname & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    כינוי שחקן לתצוגה: *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="לדוגמה: יונתן פוקר, רועי ת״א"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    דוא״ל (פרטי, לא יוצג לציבור):
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your@email.com (אופציונלי)"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                  />
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  תוכן הביקורת (אווירה, שקיפות פרסים, דילרים, זמנים): *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="ספר לשחקנים על החוויה שלך עם מארגן זה: האם הפרסים חולקו בשקיפות מלאה? האם הטורניר התחיל בזמן? כיצד היו הדילרים והאווירה הכללית?"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Notice */}
              <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 leading-normal">
                * <strong>מדיניות ביקורות:</strong> הביקורת תעבור בדיקת אימות ע״י מנהל האתר ותוצג בציבור לאחר אישור. הדירוג הממוצע מחושב מביקורות מאושרות בלבד.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-6 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold transition-colors disabled:opacity-50 shadow-xs"
                >
                  {loading ? 'שולח לבדיקה...' : 'שלח ביקורת לאישור'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
