import React, { useState } from 'react';
import { api } from '../utils/api.ts';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Trophy 
} from 'lucide-react';

interface OrganizerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizerContactModal: React.FC<OrganizerContactModalProps> = ({ isOpen, onClose }) => {
  const [organizerName, setOrganizerName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('תל אביב');
  const [expectedBuyIn, setExpectedBuyIn] = useState('');
  const [structureInfo, setStructureInfo] = useState('');
  const [preferredDays, setPreferredDays] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizerName.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('נא למלא את שדות החובה המסומנים בכוכבית (*)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullMessage = [
      `פנייה מרוכזת לפרסום טורניר ב-PokerCircle:`,
      `מארגן / מועדון: ${organizerName.trim()}`,
      `איש קשר: ${contactName.trim()}`,
      `טלפון / ווטסאפ: ${phone.trim()}`,
      `דוא״ל: ${email.trim()}`,
      `עיר / אזור: ${city}`,
      expectedBuyIn.trim() ? `סך עלות ומבנה דמי כניסה: ${expectedBuyIn.trim()}` : '',
      structureInfo.trim() ? `ערימת פתיחה ומשך רמות: ${structureInfo.trim()}` : '',
      preferredDays.trim() ? `ימי פעילות / תאריך מועדף: ${preferredDays.trim()}` : '',
      notes.trim() ? `הערות נוספות: ${notes.trim()}` : ''
    ].filter(Boolean).join('\n');

    try {
      const res = await api.sendContact({
        type: 'organizer_publish',
        name: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organizerName: organizerName.trim(),
        city,
        expectedBuyIn: expectedBuyIn.trim() || undefined,
        message: fullMessage
      });

      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בשליחת הטופס לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `שלום אלון, אני מעוניין לפרסם טורניר ב-PokerCircle!\n\nשם המארגן/מועדון: ${organizerName || '—'}\nאיש קשר: ${contactName || '—'}\nטלפון: ${phone || '—'}\nעיר: ${city}\nעלות/קופה: ${expectedBuyIn || '—'}\nהערות: ${notes || 'נשמח לשוחח ולהעלות את האירוע ללוח'}`
    );
    window.open(`https://wa.me/972500000000?text=${text}`, '_blank');
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`[PokerCircle] בקשת פרסום טורניר — ${organizerName || contactName}`);
    const body = encodeURIComponent(
      `שלום אלון,\n\nברצוני לפרסם טורניר ב-PokerCircle.\n\nשם המועדון/המארגן: ${organizerName}\nאיש קשר: ${contactName}\nטלפון: ${phone}\nעיר: ${city}\nמבנה עלויות: ${expectedBuyIn}\n\nהערות:\n${notes}`
    );
    window.location.href = `mailto:alon.pokercircle@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="organizer-modal-title"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto"
      >
        
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 text-[#D8F36A]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="organizer-modal-title" className="text-base sm:text-lg font-bold">
                פרסום טורניר חי בלוח PokerCircle
              </h2>
              <p className="text-xs text-emerald-100/80">
                הצטרף ללוח הטורנירים המוביל בישראל — שקיפות וקהל שחקנים איכותי
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value Proposition Banners */}
        <div className="bg-[#F7F8F4] p-4 border-b border-neutral-200/80 space-y-2">
          <div className="flex items-start gap-2.5 text-xs text-[#17231F]">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#123B32]">הטבת תקופת ההשקה: </span>
              <span>הפרסום באתר הוא <strong>ללא עלות ב-90 הימים הראשונים</strong>, כדי לבסס פעילות ושיתוף פעולה מוצלח.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-[#17231F]">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#123B32]">סטנדרט שקיפות מחירים: </span>
              <span>ב-PokerCircle מפרסמים את כל העלויות בשקיפות (קופת פרסים + עמלת מארגן). המידע נבדק ומאושר ע״י מנהל האתר לפני עלייה ללוח.</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {successMsg ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-[#17231F]">
                בקשת הפרסום נקלטה בהצלחה!
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6B65] max-w-md mx-auto leading-relaxed">
                תודה רבה! פנייתך נשמרה במערכת ותיבדק על ידי אלון (מנהל PokerCircle). ניצור עמך קשר בהקדם בטלפון או ב-WhatsApp שהזנת כדי לאשר את פרטי הטורניר ולהעלותו ללוח.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>שליחת הודעת WhatsApp לאלון עכשיו</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold"
                >
                  סגור חלון
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Row 1: Organizer Name & Contact Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1">
                    שם המארגן / שם המועדון *
                  </label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="לדוגמה: דיפסטאק קלאב, סירקל הרצליה"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1">
                    שם איש קשר *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="שמך המלא"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phone / WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>טלפון / WhatsApp לחזרה *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>כתובת דוא״ל *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="organizer@example.com"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                    required
                  />
                </div>
              </div>

              {/* Row 3: City / Region & Target Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>עיר / אזור הפעילות *</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                  >
                    <option value="תל אביב">תל אביב</option>
                    <option value="הרצליה">הרצליה / שרון</option>
                    <option value="פתח תקווה">פתח תקווה / בקעת אונו</option>
                    <option value="ראשון לציון">ראשון לציון / שפלה</option>
                    <option value="רמת גן">רמת גן / גבעתיים</option>
                    <option value="חולון">חולון / בת ים</option>
                    <option value="ירושלים">ירושלים</option>
                    <option value="חיפה">חיפה והצפון</option>
                    <option value="באר שבע">באר שבע והדרום</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold mb-1">
                    ימי פעילות או מועד רצוי
                  </label>
                  <input
                    type="text"
                    value={preferredDays}
                    onChange={(e) => setPreferredDays(e.target.value)}
                    placeholder="למשל: ימי חמישי ב-19:30 או תאריך ספציפי"
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Pricing breakdown (שקיפות מחירים) */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#123B32]" />
                  <span>סך דמי כניסה ופירוט עלויות (קופת פרסים ועמלה)</span>
                </label>
                <input
                  type="text"
                  value={expectedBuyIn}
                  onChange={(e) => setExpectedBuyIn(e.target.value)}
                  placeholder="למשל: סך הכל 800 ₪ (550 ₪ לקופה + 250 ₪ עמלת מארגן)"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  הערך המוביל של PokerCircle הוא שקיפות מחירים לשחקנים. נשמח לפירוט החלוקה.
                </p>
              </div>

              {/* Row 5: Structure and Stack */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  מבנה הטורניר (ערימת פתיחה, משך רמות, תנאי כניסה חוזרת)
                </label>
                <input
                  type="text"
                  value={structureInfo}
                  onChange={(e) => setStructureInfo(e.target.value)}
                  placeholder="לדוגמה: 50,000 פתיחה, רמות 18 דקות, רי-אנטרי עד סוף רמה 6"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                />
              </div>

              {/* Row 6: Additional Notes */}
              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  מידע נוסף / הערות (כיבוד, חניה, אופן רישום)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="פרט כל מידע רלוונטי נוסף לשחקנים..."
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32] bg-white"
                />
              </div>

              {/* Actions & WhatsApp Direct */}
              <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold inline-flex items-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>פנה ישירות ב-WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEmail}
                    className="text-xs text-neutral-600 hover:text-neutral-900 font-medium py-2 px-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
                  >
                    דוא״ל
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'שולח בקשה...' : 'שלח בקשת פרסום'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
