import React, { useState } from 'react';
import type { GroupFormation, SharedExpensesDetails, User } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Coffee, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Edit3, 
  MapPin, 
  Clock, 
  Coins, 
  Sparkles 
} from 'lucide-react';

interface SubmitGroupFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (newGroup: GroupFormation) => void;
}

export const SubmitGroupFormationModal: React.FC<SubmitGroupFormationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [coordinatorNickname, setCoordinatorNickname] = useState(currentUser?.displayName || '');
  const [city, setCity] = useState('מודיעין');
  const [region, setRegion] = useState<'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום'>('מרכז');
  const [currentPlayers, setCurrentPlayers] = useState<number>(3);
  const [targetPlayers, setTargetPlayers] = useState<number>(6);
  const [gameType, setGameType] = useState<'Texas Hold\'em' | 'Omaha' | 'אחר'>('Texas Hold\'em');
  const [experienceLevel, setExperienceLevel] = useState<'מתחילים' | 'מעורב' | 'מנוסים'>('מעורב');
  const [isBlindsTbd, setIsBlindsTbd] = useState(false);
  const [plannedBlinds, setPlannedBlinds] = useState('1/2 ש״ח');
  const [isBuyInTbd, setIsBuyInTbd] = useState(false);
  const [buyInLimits, setBuyInLimits] = useState('100 - 300 ש״ח');
  const [isDateFlexible, setIsDateFlexible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('חמישי הקרוב, 20:30');
  const [venue, setVenue] = useState<'יש מקום, פרטים בתיאום' | 'מחפשים גם מקום'>('יש מקום, פרטים בתיאום');
  
  // Fee Model
  const [feeModel, setFeeModel] = useState<'no_fee' | 'shared_expenses'>('no_fee');
  const [sharedForWhat, setSharedForWhat] = useState('מגשי פיצה, שתייה קלה וחטיפים');
  const [sharedAmountKnown, setSharedAmountKnown] = useState(true);
  const [sharedAmountPerPerson, setSharedAmountPerPerson] = useState<string>('35');
  const [sharedCalculationMethod, setSharedCalculationMethod] = useState('חלוקה שווה של עלות ההזמנה בסיום');
  const [sharedIsMandatory, setSharedIsMandatory] = useState(true);
  const [sharedIsEstimated, setSharedIsEstimated] = useState(false);

  // Description & Contact
  const [description, setDescription] = useState('אנחנו שלושה חברים באזור מודיעין, מחפשים עוד שלושה שחקנים למשחק חברי ביום חמישי בערב. אווירה נעימה ורגועה, ללא עמלת מארגן.');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  // Real-time calculated missing players
  const missingPlayers = Math.max(0, targetPlayers - currentPlayers);

  const validate = (): string | null => {
    if (!title.trim()) return 'יש להזין כותרת למודעה';
    if (!coordinatorNickname.trim()) return 'יש להזין כינוי למרכז הקבוצה (אין חובה לשם מלא)';
    if (!city.trim()) return 'יש להזין עיר או אזור';
    if (currentPlayers < 1) return 'מספר השחקנים הקיים חייב להיות לפחות 1 (כולל אותך)';
    if (targetPlayers < 2) return 'מספר השחקנים הרצוי חייב להיות לפחות 2';
    if (currentPlayers > targetPlayers) {
      return 'מספר השחקנים הקיים אינו יכול להיות גדול ממספר השחקנים הרצוי בסך הכול';
    }
    if (!description.trim()) return 'יש להזין תיאור קצר על אופי המשחק ומה אתם מחפשים';
    if (!whatsapp.trim() && !telegram.trim() && !phone.trim()) {
      return 'חובה להזין לפחות דרך פנייה אחת (וואטסאפ, טלגרם או טלפון) כדי שיוכלו לפנות אליכם';
    }
    if (feeModel === 'shared_expenses') {
      if (!sharedForWhat.trim()) {
        return 'במודל השתתפות בהוצאות חובה לפרט עבור מה נגבה הכסף';
      }
      if (!sharedAmountKnown && !sharedCalculationMethod.trim()) {
        return 'יש לציין אופן חישוב (למשל: חלוקה שווה של חשבון ההזמנה בסיום)';
      }
    }
    return null;
  };

  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep('preview');
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      setStep('form');
      return;
    }

    setLoading(true);
    setError(null);

    const sharedDetails: SharedExpensesDetails | undefined = feeModel === 'shared_expenses' ? {
      forWhat: sharedForWhat.trim(),
      amountPerPerson: sharedAmountKnown && sharedAmountPerPerson.trim() ? Number(sharedAmountPerPerson) : null,
      calculationMethod: !sharedAmountKnown || !sharedAmountPerPerson.trim() ? sharedCalculationMethod.trim() : undefined,
      isMandatory: sharedIsMandatory,
      isEstimated: sharedIsEstimated
    } : undefined;

    try {
      const res = await api.submitGroupFormation({
        title: title.trim(),
        coordinatorNickname: coordinatorNickname.trim(),
        city: city.trim(),
        region,
        currentPlayers,
        targetPlayers,
        gameType,
        experienceLevel,
        plannedBlinds: isBlindsTbd ? 'טרם נקבעו' : plannedBlinds.trim() || 'טרם נקבעו',
        buyInLimits: isBuyInTbd ? 'טרם נקבע' : buyInLimits.trim() || 'טרם נקבע',
        scheduleDate: isDateFlexible ? 'מתגמשים בתיאום' : scheduleDate.trim() || 'מתגמשים בתיאום',
        venue,
        feeModel,
        sharedExpensesDetails: sharedDetails,
        description: description.trim(),
        whatsapp: whatsapp.trim() || undefined,
        telegram: telegram.trim() || undefined,
        phone: phone.trim() || undefined
      });

      onSuccess(res.groupFormation);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת המודעה');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="bg-[#123B32] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="סגור"
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D8F36A] text-[#123B32]">
              גיבוש קבוצה חדשה
            </span>
            <span className="text-xs text-emerald-200">
              משחק חברי בלבד · ללא עמלות מסחריות
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            מחפשים שחקנים? גבשו קבוצה
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
            פרסמו הודעה קצרה בלוח הקאש של PokerCircle להשלמת שחקנים חסרים לשולחן חברי.
          </p>
        </div>

        {/* Content body based on step */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleGoToPreview} className="space-y-6">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  1. פרטי המודעה ומיקום
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1">
                    כותרת הפרסום <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="לדוגמה: משלימים שולחן חברי במודיעין"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      כינוי מרכז הקבוצה <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={coordinatorNickname}
                      onChange={(e) => setCoordinatorNickname(e.target.value)}
                      placeholder="שם פרטי או כינוי (אין חובה לשם מלא)"
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      עיר או אזור <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="מודיעין, תל אביב, כפר סבא..."
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      אזור גיאוגרפי
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    >
                      <option value="מרכז">מרכז</option>
                      <option value="תל אביב">תל אביב</option>
                      <option value="שרון">שרון</option>
                      <option value="שפלה">שפלה</option>
                      <option value="ירושלים">ירושלים</option>
                      <option value="צפון">צפון</option>
                      <option value="דרום">דרום</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Player Counts */}
              <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#123B32] uppercase tracking-wider">
                    2. מספר שחקנים וחישוב חסרים
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    חסרים: {missingPlayers} שחקנים
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      מספר שחקנים שכבר בקבוצה <span className="text-red-500">*</span>
                      <span className="block text-[11px] text-neutral-400 font-normal">
                        כולל אותך (מרכז הקבוצה) אם אתה משחק
                      </span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={targetPlayers}
                      required
                      value={currentPlayers}
                      onChange={(e) => setCurrentPlayers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      מספר שחקנים רצוי בסך הכול <span className="text-red-500">*</span>
                      <span className="block text-[11px] text-neutral-400 font-normal">
                        היעד המלא של השולחן (למשל 6, 8 או 9)
                      </span>
                    </label>
                    <input
                      type="number"
                      min={currentPlayers}
                      max={12}
                      required
                      value={targetPlayers}
                      onChange={(e) => setTargetPlayers(Math.max(currentPlayers, parseInt(e.target.value) || currentPlayers))}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    />
                  </div>
                </div>

                {/* Player Visualizer Preview */}
                <div className="pt-2 flex items-center gap-1.5 justify-center">
                  {Array.from({ length: targetPlayers }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        i < currentPlayers
                          ? 'bg-[#123B32] text-white shadow-xs'
                          : 'border-2 border-dashed border-[#123B32]/40 text-[#123B32]/40 bg-white'
                      }`}
                      title={i < currentPlayers ? 'שחקן בקבוצה' : 'שחקן חסר'}
                    >
                      {i + 1}
                    </div>
                  ))}
                  <span className="text-xs font-bold text-[#123B32] mr-2">
                    {currentPlayers} מתוך {targetPlayers} שחקנים · מחפשים עוד {missingPlayers}
                  </span>
                </div>
              </div>

              {/* Section 3: Game Setup */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  3. מאפייני המשחק והמועד
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      סוג משחק
                    </label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    >
                      <option value="Texas Hold'em">Texas Hold'em</option>
                      <option value="Omaha">Omaha</option>
                      <option value="אחר">אחר / מיקס</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      רמת ניסיון רצויה
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    >
                      <option value="מתחילים">מתחילים (משחק רגוע ללמידה)</option>
                      <option value="מעורב">מעורב (חובבים בכל הרמות)</option>
                      <option value="מנוסים">מנוסים (שחקנים עם ותק)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#17231F]">
                        בליינדים מתוכננים
                      </label>
                      <label className="text-[11px] text-neutral-500 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBlindsTbd}
                          onChange={(e) => setIsBlindsTbd(e.target.checked)}
                          className="rounded text-[#123B32]"
                        />
                        <span>טרם נקבעו</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={isBlindsTbd}
                      value={isBlindsTbd ? 'טרם נקבעו' : plannedBlinds}
                      onChange={(e) => setPlannedBlinds(e.target.value)}
                      placeholder="1/2 ש״ח, 2/5 ש״ח..."
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#17231F]">
                        טווח כניסה לשולחן (Buy-In)
                      </label>
                      <label className="text-[11px] text-neutral-500 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBuyInTbd}
                          onChange={(e) => setIsBuyInTbd(e.target.checked)}
                          className="rounded text-[#123B32]"
                        />
                        <span>טרם נקבע</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={isBuyInTbd}
                      value={isBuyInTbd ? 'טרם נקבע' : buyInLimits}
                      onChange={(e) => setBuyInLimits(e.target.value)}
                      placeholder="100 - 300 ש״ח..."
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#17231F]">
                        מועד
                      </label>
                      <label className="text-[11px] text-neutral-500 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDateFlexible}
                          onChange={(e) => setIsDateFlexible(e.target.checked)}
                          className="rounded text-[#123B32]"
                        />
                        <span>מתגמשים בתיאום</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={isDateFlexible}
                      value={isDateFlexible ? 'מתגמשים בתיאום' : scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      placeholder="חמישי הקרוב ב-20:30..."
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">
                      מצב המקום (Venue)
                    </label>
                    <select
                      value={venue}
                      onChange={(e) => setVenue(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                    >
                      <option value="יש מקום, פרטים בתיאום">יש מקום — פרטים בתיאום</option>
                      <option value="מחפשים גם מקום">מחפשים גם מקום לאירוח המשחק</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Fee Model (Crucial Transparency Rule) */}
              <div className="space-y-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
                <div>
                  <h3 className="text-xs font-bold text-[#17231F] uppercase tracking-wider">
                    4. מודל הגבייה (שקיפות מלאה) <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    פרסום גיבוש קבוצה מיועד למשחקים חבריים. אם קיימת גבייה מסחרית של מארגן, יש להשתמש בפרסום משחק קאש רגיל.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                    feeModel === 'no_fee' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-1 ring-emerald-600' 
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        ללא עמלת מארגן
                      </span>
                      <input
                        type="radio"
                        name="feeModel"
                        checked={feeModel === 'no_fee'}
                        onChange={() => setFeeModel('no_fee')}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 leading-normal">
                      אפס רייק, ללא דמי אירוח, ללא תשלום לפי זמן או תשלום חובה למארח.
                    </span>
                  </label>

                  <label className={`p-3.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                    feeModel === 'shared_expenses' 
                      ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-2xs ring-1 ring-amber-600' 
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        השתתפות בהוצאות
                      </span>
                      <input
                        type="radio"
                        name="feeModel"
                        checked={feeModel === 'shared_expenses'}
                        onChange={() => setFeeModel('shared_expenses')}
                        className="text-amber-600"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 leading-normal">
                      חולקים בעלות מוצרי כיבוד, אוכל או שתייה בלבד ללא רווח למארגן.
                    </span>
                  </label>
                </div>

                {/* Shared Expenses breakdown fields */}
                {feeModel === 'shared_expenses' && (
                  <div className="p-4 rounded-xl bg-white border border-amber-200 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        עבור מה נגבה הכסף? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={sharedForWhat}
                        onChange={(e) => setSharedForWhat(e.target.value)}
                        placeholder="פיצה, שתייה קלה ובירות, חטיפים..."
                        className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-neutral-800">
                            סכום לאדם
                          </label>
                          <label className="text-[11px] text-neutral-500 flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!sharedAmountKnown}
                              onChange={(e) => setSharedAmountKnown(!e.target.checked)}
                              className="rounded text-amber-600"
                            />
                            <span>טרם נקבע / לפי חלוקה</span>
                          </label>
                        </div>
                        {sharedAmountKnown ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={sharedAmountPerPerson}
                              onChange={(e) => setSharedAmountPerPerson(e.target.value)}
                              placeholder="35"
                              className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="text-xs text-neutral-600 font-medium">ש״ח</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={sharedCalculationMethod}
                            onChange={(e) => setSharedCalculationMethod(e.target.value)}
                            placeholder="חלוקה שווה לפי קבלת ההזמנה בסיום"
                            className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        )}
                      </div>

                      <div className="flex flex-col justify-end gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sharedIsMandatory}
                            onChange={(e) => setSharedIsMandatory(e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span>השתתפות חובה לכל שחקן</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sharedIsEstimated}
                            onChange={(e) => setSharedIsEstimated(e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span>הסכום משוער (עשוי להשתנות בהתאם להזמנה)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Description & Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  5. תיאור ודרכי פנייה
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1">
                    תיאור קצר — אופי הערב ומה מחפשים <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="אנחנו שלושה חברים, מחפשים עוד שלושה שחקנים למשחק חברי. אווירה נעימה, שולחן מסודר..."
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] resize-none"
                  />
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <span className="text-xs font-bold text-[#17231F] block">
                    דרך פנייה (חובה להזין לפחות אפשרות אחת תקינה) <span className="text-red-500">*</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        מספר ווטסאפ (מומלץ)
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="0501234567"
                        className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        שם משתמש טלגרם
                      </label>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="username"
                        className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        טלפון ישיר
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="050-1234567"
                        className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  ביטול
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4 text-[#D8F36A]" />
                  <span>מעבר לתצוגה מקדימה</span>
                </button>
              </div>
            </form>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>תצוגה מקדימה:</strong> כך תיראה מודעת גיבוש הקבוצה שלכם בלוח לאחר אישור מנהל.
                </span>
              </div>

              {/* Card Preview Mockup matching Spec Section 6 */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#123B32] text-white">
                      גיבוש קבוצה
                    </span>
                    {feeModel === 'no_fee' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        משחק חברי · ללא עמלת מארגן
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        משחק חברי · השתתפות בהוצאות
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    מרכז הקבוצה: {coordinatorNickname}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#17231F]">
                    {title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#5A6B65]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {city} ({region})
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {isDateFlexible ? 'מתגמשים בתיאום' : scheduleDate}
                    </span>
                    <span>·</span>
                    <span>{gameType}</span>
                    <span>·</span>
                    <span>רמת ניסיון: {experienceLevel}</span>
                  </div>
                </div>

                {/* Player count indicator */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: targetPlayers }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          i < currentPlayers
                            ? 'bg-[#123B32] text-white'
                            : 'border border-dashed border-[#123B32]/40 text-[#123B32]/40 bg-white'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                    <span className="text-xs font-bold text-[#17231F] mr-2">
                      {currentPlayers} מתוך {targetPlayers} שחקנים · מחפשים עוד {missingPlayers}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    עודכן כעת
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block">בליינדים מתוכננים</span>
                    <span className="font-bold text-[#17231F]">
                      {isBlindsTbd ? 'טרם נקבעו' : plannedBlinds}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block">טווח כניסה (Buy-In)</span>
                    <span className="font-bold text-[#17231F]">
                      {isBuyInTbd ? 'טרם נקבע' : buyInLimits}
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-neutral-400 block">מצב מקום</span>
                    <span className="font-bold text-[#17231F]">{venue}</span>
                  </div>
                </div>

                <p className="text-xs text-[#2F3E38] leading-relaxed">
                  {description}
                </p>

                {feeModel === 'shared_expenses' && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <strong>פירוט השתתפות בהוצאות:</strong> {sharedForWhat} (
                    {sharedAmountKnown && sharedAmountPerPerson
                      ? `${sharedAmountPerPerson} ש״ח ${sharedIsEstimated ? 'משוער' : 'סופי'}`
                      : sharedCalculationMethod}
                    , {sharedIsMandatory ? 'חובה' : 'רשות'})
                  </div>
                )}

                {/* Spec Section 7: Action Mockup */}
                <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto py-2 px-5 rounded-xl bg-emerald-600 text-white font-bold text-xs opacity-90 cursor-default"
                  >
                    מעוניין להצטרף
                  </button>
                  <p className="text-[11px] text-neutral-500 text-center sm:text-right">
                    הפנייה אינה אישור הצטרפות. ההשתתפות נקבעת מול מרכז הקבוצה.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="py-2.5 px-5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>חזור לעריכה</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="py-2.5 px-6 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>שולח לבדיקה...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D8F36A]" />
                      <span>שלח פרסום לבדיקה</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#17231F]">
                הפרסום הוגש בהצלחה!
              </h3>
              <p className="text-xs text-[#5A6B65] max-w-md mx-auto leading-relaxed">
                המודעה שלך נקלטה במערכת ונכנסה למצב <strong>״ממתין לאישור״</strong>. מנהל האתר יוודא עמידה בכללי השקיפות ללא עמלות מסחריות, ומיד לאחר מכן המודעה תופיע בלוח הקבוצות.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-8 rounded-xl bg-[#123B32] text-white text-xs font-bold hover:bg-[#1a4a40] transition-colors"
              >
                סגור
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
