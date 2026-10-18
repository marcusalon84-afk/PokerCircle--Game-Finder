import React, { useState } from 'react';
import type { 
  TournamentEvent, 
  Organizer, 
  User, 
  CashGame, 
  OnlineClub, 
  CashFeeModel, 
  SharedExpensesDetails 
} from '../types/poker.ts';
import { api, setStoredUser } from '../utils/api.ts';
import { 
  X, 
  PlusCircle, 
  Layers, 
  Timer, 
  MapPin, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Upload, 
  Trash2, 
  Images,
  Trophy,
  Coins,
  Smartphone,
  Users,
  ShieldCheck,
  Coffee,
  MessageCircle,
  Send,
  PhoneCall,
  Info,
  Sparkles
} from 'lucide-react';

interface ManualAddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  organizers: Organizer[];
  onEventCreated?: (newEvent: TournamentEvent) => void;
  onCashGameCreated?: (newCashGame: CashGame) => void;
  onClubCreated?: (newClub: OnlineClub) => void;
  onOrganizerAdded: (newOrg: Organizer) => void;
  onAdminAuthenticated: (adminUser: User) => void;
  defaultType?: 'tournament' | 'cash' | 'clubgg';
}

export const ManualAddEventModal: React.FC<ManualAddEventModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  organizers,
  onEventCreated,
  onCashGameCreated,
  onClubCreated,
  onOrganizerAdded,
  onAdminAuthenticated,
  defaultType = 'tournament'
}) => {
  // 3 Primary Event Types
  const [eventType, setEventType] = useState<'tournament' | 'cash' | 'clubgg'>(defaultType);

  // Admin authentication bypass / login if user is not admin
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  // New Organizer inline toggle
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCity, setNewOrgCity] = useState('תל אביב');
  const [newOrgWhatsapp, setNewOrgWhatsapp] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  // ----------------- 1. TOURNAMENT FORM STATE -----------------
  const [organizerId, setOrganizerId] = useState<string>(organizers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('תל אביב');
  const [region, setRegion] = useState<'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום'>('תל אביב');
  
  const tomorrowDefault = new Date();
  tomorrowDefault.setDate(tomorrowDefault.getDate() + 1);
  tomorrowDefault.setHours(19, 30, 0, 0);
  const [startDateTime, setStartDateTime] = useState(tomorrowDefault.toISOString().substring(0, 16));
  const [estimatedEndDateTime, setEstimatedEndDateTime] = useState('');

  // Price breakdown
  const [prizePoolAmount, setPrizePoolAmount] = useState<number>(550);
  const [houseFeeAmount, setHouseFeeAmount] = useState<number>(250);
  const [extraFeeAmount, setExtraFeeAmount] = useState<number>(0);
  const [extraFeeDescription, setExtraFeeDescription] = useState<string>('');

  // Structure
  const [startingStack, setStartingStack] = useState<number>(50000);
  const [levelDuration, setLevelDuration] = useState<number>(18);
  const [reEntryTerms, setReEntryTerms] = useState<string>('כניסה חוזרת אפשרית עד תום רמה 6. ללא אד-און.');
  const [description, setDescription] = useState<string>('כיבוד קל ושתייה כלולים. כתובת מדויקת תימסר על ידי המארגן.');

  // Photos & Gallery
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState<string>('');

  // Promotion
  const [promotionType, setPromotionType] = useState<'regular' | 'featured' | 'sponsored'>('regular');
  const [isPaidPromotion, setIsPaidPromotion] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  // ----------------- 2. CASH GAME FORM STATE -----------------
  const [cashTitle, setCashTitle] = useState('');
  const [cashCity, setCashCity] = useState('תל אביב');
  const [cashRegion, setCashRegion] = useState<'מרכז' | 'תל אביב' | 'שרון' | 'שפלה' | 'ירושלים' | 'צפון' | 'דרום'>('תל אביב');
  const [cashStartDateTime, setCashStartDateTime] = useState(tomorrowDefault.toISOString().substring(0, 16));
  const [cashGameType, setCashGameType] = useState<'Texas Hold\'em' | 'Omaha' | 'Dealer\'s Choice' | 'אחר'>('Texas Hold\'em');
  const [cashBlinds, setCashBlinds] = useState('1/2 ₪');
  const [cashMinBuyIn, setCashMinBuyIn] = useState<number>(200);
  const [cashMaxBuyIn, setCashMaxBuyIn] = useState<number>(1000);
  const [cashMaxSeats, setCashMaxSeats] = useState<number>(9);
  
  // Cash Fee Model
  const [cashFeeModel, setCashFeeModel] = useState<CashFeeModel>('no_fee');
  const [sharedForWhat, setSharedForWhat] = useState('כיבוד קל, פיצות ושתייה קלה');
  const [sharedCostPerPerson, setSharedCostPerPerson] = useState('כ-40 ₪ לפי עלות בפועל');
  const [sharedIsMandatory, setSharedIsMandatory] = useState(false);
  const [sharedIsEstimated, setSharedIsEstimated] = useState(true);
  const [commercialRakeDesc, setCommercialRakeDesc] = useState('5% עד מקסימום 40 ₪ לקופה');

  // Cash Contacts & Info
  const [cashWhatsapp, setCashWhatsapp] = useState('');
  const [cashTelegram, setCashTelegram] = useState('');
  const [cashPhone, setCashPhone] = useState('');
  const [cashDescription, setCashDescription] = useState('שולחן חברי באווירה טובה, ציוד מקצועי ודילר עצמי / מתחלף.');

  // ----------------- 3. CLUBGG FORM STATE -----------------
  const [clubName, setClubName] = useState('');
  const [clubggId, setClubggId] = useState('');
  const [clubMinDeposit, setClubMinDeposit] = useState<number | string>(100);
  const [clubAgentName, setClubAgentName] = useState('');
  const [clubAgentPhone, setClubAgentPhone] = useState('');
  const [clubAgentWhatsapp, setClubAgentWhatsapp] = useState('');
  const [clubAgentTelegram, setClubAgentTelegram] = useState('');
  const [clubJoinLink, setClubJoinLink] = useState('');
  const [clubDescription, setClubDescription] = useState('מועדון טורנירים מקצועי ב-ClubGG עם רייקבק גבוה, לוח טורנירים יומי ופרסים מובטחים.');
  const [clubOrganizerId, setClubOrganizerId] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    type: 'tournament' | 'cash' | 'clubgg';
    title: string;
    details: string;
  } | null>(null);

  React.useEffect(() => {
    if (organizers.length > 0 && !organizerId) {
      setOrganizerId(organizers[0].id);
    }
  }, [organizers]);

  if (!isOpen) return null;

  const totalBuyIn = (Number(prizePoolAmount) || 0) + (Number(houseFeeAmount) || 0) + (Number(extraFeeAmount) || 0);

  // Quick Admin Login Handler
  const handleAdminLogin = async (e?: React.FormEvent, quickPassword = 'AdminPassword123!') => {
    if (e) e.preventDefault();
    setAuthenticating(true);
    setAuthError(null);
    try {
      const res = await api.login('alon.pokercircle@gmail.com', quickPassword || adminPassword);
      setStoredUser(res.user, res.token);
      onAdminAuthenticated(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'סיסמת מנהל שגויה. נסה שוב.');
    } finally {
      setAuthenticating(false);
    }
  };

  // Add new organizer inline
  const handleCreateOrganizerInline = async () => {
    if (!newOrgName.trim()) {
      setErrorMsg('נא להזין שם למארגן');
      return;
    }
    setCreatingOrg(true);
    try {
      const newOrg = await api.createOrganizer({
        name: newOrgName.trim(),
        city: newOrgCity.trim(),
        type: 'organizer',
        whatsapp: newOrgWhatsapp.trim(),
        description: `מארגן באזור ${newOrgCity}`
      });
      onOrganizerAdded(newOrg);
      setOrganizerId(newOrg.id);
      setCity(newOrg.city);
      setShowAddOrg(false);
      setNewOrgName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה ביצירת מארגן');
    } finally {
      setCreatingOrg(false);
    }
  };

  // Submit Handler for all 3 types
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (eventType === 'tournament') {
        if (!organizerId) throw new Error('נא לבחור מארגן');
        if (!title.trim()) throw new Error('נא להזין שם אירוע');
        if (!startDateTime) throw new Error('נא לבחור מועד התחלה');
        if (extraFeeAmount > 0 && !extraFeeDescription.trim()) {
          throw new Error('שקיפות מחיר: חובה לספק הסבר ברור עבור כל תשלום חובה נוסף');
        }

        const eventPayload = {
          organizerId,
          title: title.trim(),
          city: city.trim(),
          region,
          startDateTime: new Date(startDateTime).toISOString(),
          estimatedEndDateTime: estimatedEndDateTime ? new Date(estimatedEndDateTime).toISOString() : undefined,
          prizePoolAmount,
          houseFeeAmount,
          extraFeeAmount,
          extraFeeDescription: extraFeeAmount > 0 ? extraFeeDescription.trim() : '',
          startingStack,
          levelDuration,
          reEntryTerms: reEntryTerms.trim(),
          description: description.trim(),
          coverImageUrl: coverImageUrl.trim() || (galleryImages.length > 0 ? galleryImages[0] : undefined),
          galleryImages: galleryImages,
          promotionType,
          isPaidPromotion,
          paidAmount: isPaidPromotion ? (paidAmount || 100) : 0
        };

        const res = await api.createEvent(eventPayload);
        setCreatedResult({
          type: 'tournament',
          title: res.title,
          details: `${res.city} · סה"כ כניסה: ${res.totalBuyIn} ₪ (${res.prizePoolAmount} ₪ לפרסים + ${res.houseFeeAmount} ₪ עמלת מארגן)`
        });
        if (onEventCreated) onEventCreated(res);

      } else if (eventType === 'cash') {
        if (!cashTitle.trim()) throw new Error('נא להזין כותרת למשחק הקאש');
        if (!cashCity.trim()) throw new Error('נא להזין עיר');
        if (!cashBlinds.trim()) throw new Error('נא לציין בליינדים');
        if (!cashWhatsapp.trim() && !cashTelegram.trim() && !cashPhone.trim()) {
          throw new Error('חובה להזין לפחות אמצעי קשר אחד תקין (WhatsApp / Telegram / טלפון)');
        }

        let sharedExp: SharedExpensesDetails | undefined = undefined;
        if (cashFeeModel === 'shared_expenses') {
          if (!sharedForWhat.trim()) throw new Error('השתתפות בהוצאות: חובה לפרט עבור מה נגבה הכסף (אוכל, כיבוד, שכירות וכו\')');
          if (!sharedCostPerPerson.trim()) throw new Error('השתתפות בהוצאות: חובה לציין סכום לאדם או אופן החישוב');
          
          sharedExp = {
            forWhat: sharedForWhat.trim(),
            costPerPerson: sharedCostPerPerson.trim(),
            isMandatory: sharedIsMandatory,
            isEstimated: sharedIsEstimated
          };
        }

        const cashPayload: Partial<CashGame> = {
          organizerId: organizerId || undefined,
          title: cashTitle.trim(),
          city: cashCity.trim(),
          region: cashRegion,
          startDateTime: new Date(cashStartDateTime).toISOString(),
          gameType: cashGameType,
          blinds: cashBlinds.trim(),
          minBuyIn: cashMinBuyIn,
          maxBuyIn: cashMaxBuyIn,
          seats: cashMaxSeats,
          feeModel: cashFeeModel,
          sharedExpensesDetails: sharedExp,
          rakeDescription: cashFeeModel === 'commercial_rake' ? commercialRakeDesc.trim() : undefined,
          whatsapp: cashWhatsapp.trim() || undefined,
          telegram: cashTelegram.trim() || undefined,
          phone: cashPhone.trim() || undefined,
          description: cashDescription.trim(),
          status: 'active'
        };

        const res = await api.createCashGame(cashPayload);
        const feeText = cashFeeModel === 'no_fee' 
          ? 'משחק חברי · ללא עמלת מארגן' 
          : cashFeeModel === 'shared_expenses' 
          ? `משחק חברי · השתתפות בהוצאות (${sharedCostPerPerson})` 
          : 'עמלת מארגן / רייק מסחרי';

        setCreatedResult({
          type: 'cash',
          title: res.title,
          details: `${res.city} · בליינדים: ${res.blinds} · כניסה: ${res.minBuyIn}-${res.maxBuyIn} ₪ · ${feeText}`
        });
        if (onCashGameCreated) onCashGameCreated(res);

      } else if (eventType === 'clubgg') {
        if (!clubName.trim()) throw new Error('נא להזין שם מועדון');
        if (!clubggId.trim()) throw new Error('נא להזין מספר מועדון ב-ClubGG');
        if (!clubMinDeposit) throw new Error('חובה להזין סכום הפקדה מינימלית למועדון');
        if (!clubAgentWhatsapp.trim() && !clubAgentTelegram.trim() && !clubAgentPhone.trim()) {
          throw new Error('חובה להזין לפחות פרט קשר אחד עבור סוכן המועדון (וואטסאפ / טלגרם / טלפון)');
        }

        const clubPayload: Partial<OnlineClub> = {
          organizerId: clubOrganizerId || organizerId || undefined,
          name: clubName.trim(),
          clubggId: clubggId.trim(),
          minDeposit: typeof clubMinDeposit === 'string' ? (parseFloat(clubMinDeposit) || clubMinDeposit) : clubMinDeposit,
          agentName: clubAgentName.trim() || 'סוכן רשמי',
          agentPhone: clubAgentPhone.trim() || undefined,
          agentWhatsapp: clubAgentWhatsapp.trim() || undefined,
          agentTelegram: clubAgentTelegram.trim() || undefined,
          joinLink: clubJoinLink.trim() || `https://www.clubgg.net/join?club_id=${clubggId.trim()}`,
          description: clubDescription.trim(),
          isPokerCircleClub: false
        };

        const res = await api.createOnlineClub(clubPayload);
        setCreatedResult({
          type: 'clubgg',
          title: res.name,
          details: `ClubGG ID: ${res.clubggId} · הפקדה מינימלית: ${res.minDeposit} ₪ · סוכן: ${res.agentName || 'רשמי'}`
        });
        if (onClubCreated) onClubCreated(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בשמירת הפרסום');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-add-event-title"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-[#D8F36A]" />
            <div>
              <h2 id="manual-add-event-title" className="text-base sm:text-lg font-bold">
                הוספת אירוע / פרסום חדש (ממשק ניהול)
              </h2>
              <span className="text-xs text-emerald-200 block">
                בחר סוג פעילות: טורניר חי, משחק קאש או מועדון ClubGG
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs space-y-5">
          
          {/* Admin Access Gate if not admin */}
          {currentUser?.role !== 'admin' ? (
            <div className="py-6 px-4 bg-[#F7F8F4] rounded-2xl border border-neutral-200/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#123B32] text-[#D8F36A] mx-auto flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17231F]">
                  אימות הרשאת מנהל מערכת
                </h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto mt-1 leading-relaxed">
                  הוספת אירועים, משחקי קאש ומועדונים מתבצעת תחת בקרת מנהל PokerCircle כדי להבטיח את אימות הנתונים ושקיפות המחירים.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs max-w-md mx-auto">
                  {authError}
                </div>
              )}

              <div className="max-w-xs mx-auto space-y-2">
                <button
                  type="button"
                  onClick={() => handleAdminLogin(undefined, 'AdminPassword123!')}
                  disabled={authenticating}
                  className="w-full py-3 px-4 rounded-xl bg-[#123B32] text-white font-bold hover:bg-[#1a4a40] transition-colors shadow-xs"
                >
                  {authenticating ? 'מתחבר...' : 'כניסה מהירה כמנהל (Alon) להוספת פרסום'}
                </button>

                <div className="text-[11px] text-neutral-400">
                  משתמש מנהל מוגדר: alon.pokercircle@gmail.com
                </div>
              </div>
            </div>
          ) : createdResult ? (
            /* Success confirmation */
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-[#17231F]">
                  {createdResult.type === 'tournament' 
                    ? 'הטורניר פורסם בהצלחה בלוח הראשי!' 
                    : createdResult.type === 'cash' 
                    ? 'משחק הקאש פורסם בהצלחה בלשונית הקאש!' 
                    : 'מועדון ClubGG פורסם בהצלחה!'}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  האירוע זמין כעת לכל המשתמשים בהתאם להגדרות השקיפות והתגים המחושבים.
                </p>
              </div>

              <div className="bg-[#F7F8F4] p-4 rounded-xl border border-neutral-200 max-w-md mx-auto text-right space-y-1.5 font-medium">
                <div className="font-bold text-sm text-[#123B32]">{createdResult.title}</div>
                <div className="text-neutral-600">{createdResult.details}</div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2.5 px-6 rounded-xl bg-[#123B32] text-white font-bold hover:bg-[#1a4a40]"
                >
                  סיום וצפייה בלוח
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedResult(null)}
                  className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                >
                  הוסף פרסום נוסף
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 3 Publication Options Selector */}
              <div className="p-2 bg-[#F7F8F4] rounded-2xl border border-neutral-200 space-y-1.5">
                <label className="block font-bold text-neutral-700 text-[11px] mb-1">
                  בחר סוג פרסום (האפשרויות יתעדכנו בהתאם):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('tournament')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      eventType === 'tournament' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 ${eventType === 'tournament' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>טורניר</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEventType('cash')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      eventType === 'cash' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Coins className={`w-4 h-4 ${eventType === 'cash' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>משחק קאש</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEventType('clubgg')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      eventType === 'clubgg' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 ${eventType === 'clubgg' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>מועדון CLUBGG</span>
                  </button>
                </div>
              </div>

              {/* ======================= CASE 1: TOURNAMENT ======================= */}
              {eventType === 'tournament' && (
                <div className="space-y-4">
                  
                  {/* 1. Organizer Selection */}
                  <div className="p-4 bg-[#F7F8F4] rounded-xl border border-neutral-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800">
                        1. מארגן או מועדון אחראי: *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddOrg(!showAddOrg)}
                        className="text-xs font-semibold text-[#123B32] hover:underline"
                      >
                        {showAddOrg ? 'בחר מרשימה קיימת' : '+ הוסף מארגן חדש בו במקום'}
                      </button>
                    </div>

                    {showAddOrg ? (
                      <div className="p-3 bg-white rounded-lg border border-neutral-300 space-y-2.5">
                        <span className="font-bold text-neutral-700 block">יצירת מארגן חדש:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="שם המארגן / המועדון"
                            className="p-2 border rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={newOrgCity}
                            onChange={(e) => setNewOrgCity(e.target.value)}
                            placeholder="עיר"
                            className="p-2 border rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={newOrgWhatsapp}
                            onChange={(e) => setNewOrgWhatsapp(e.target.value)}
                            placeholder="טלפון WhatsApp (למשל: 972501234567)"
                            className="p-2 border rounded-lg text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateOrganizerInline}
                          disabled={creatingOrg}
                          className="py-1.5 px-4 rounded-lg bg-[#123B32] text-white font-medium hover:bg-[#1a4a40]"
                        >
                          {creatingOrg ? 'שומר מארגן...' : 'שמור ובחר מארגן זה'}
                        </button>
                      </div>
                    ) : (
                      <select
                        value={organizerId}
                        onChange={(e) => {
                          setOrganizerId(e.target.value);
                          const org = organizers.find((o) => o.id === e.target.value);
                          if (org) setCity(org.city);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white font-medium focus:outline-none focus:border-[#123B32]"
                        required
                      >
                        {organizers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.city}) {o.type === 'club' ? '— מועדון קבוע' : '— מארגן'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* 2. Title & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-neutral-700 mb-1">
                        שם הטורניר: *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="לדוגמה: דיפסטאק חגיגי 50K צ׳יפים"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        עיר: *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="למשל: תל אביב"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>
                  </div>

                  {/* Region & Date Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        אזור בארץ:
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-[#123B32]"
                      >
                        <option value="תל אביב">תל אביב</option>
                        <option value="מרכז">מרכז וגוש דן</option>
                        <option value="שרון">הרצליה והשרון</option>
                        <option value="שפלה">ראשל״צ והשפלה</option>
                        <option value="ירושלים">ירושלים</option>
                        <option value="צפון">צפון</option>
                        <option value="דרום">דרום</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        מועד התחלה: *
                      </label>
                      <input
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        סיום משוער (אופציונלי):
                      </label>
                      <input
                        type="datetime-local"
                        value={estimatedEndDateTime}
                        onChange={(e) => setEstimatedEndDateTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                      />
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 bg-[#F7F8F4] rounded-xl border border-neutral-200 space-y-3">
                    <span className="font-bold text-[#123B32] block">
                      שקיפות מחירים מחייבת (יש להפריד לקופה ולעמלת מארגן):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-600 mb-1">1. לקופת הפרסים (₪): *</label>
                        <input
                          type="number"
                          value={prizePoolAmount}
                          onChange={(e) => setPrizePoolAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">2. עמלת מארגן / בית (₪): *</label>
                        <input
                          type="number"
                          value={houseFeeAmount}
                          onChange={(e) => setHouseFeeAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">3. תשלום חובה נוסף (₪):</label>
                        <input
                          type="number"
                          value={extraFeeAmount}
                          onChange={(e) => setExtraFeeAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-lg bg-white"
                          min="0"
                        />
                      </div>
                    </div>

                    {extraFeeAmount > 0 && (
                      <div>
                        <label className="block text-amber-900 font-semibold mb-1">
                          הסבר תשלום חובה נוסף (חובה לפי מפרט): *
                        </label>
                        <input
                          type="text"
                          value={extraFeeDescription}
                          onChange={(e) => setExtraFeeDescription(e.target.value)}
                          placeholder="למשל: דמי צ'יפ באונטי מיוחד לרישום"
                          className="w-full p-2 border border-amber-300 rounded-lg bg-white"
                          required
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-200 text-sm font-bold text-[#123B32] flex items-center justify-between">
                      <span>סך הכל כניסה לתשלום (מחושב אוטומטית):</span>
                      <span className="text-base tabular-nums">{totalBuyIn} ₪</span>
                    </div>
                  </div>

                  {/* Tournament Structure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">ערימת פתיחה (צ'יפים):</label>
                      <input
                        type="number"
                        value={startingStack}
                        onChange={(e) => setStartingStack(parseInt(e.target.value, 10) || 50000)}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">משך רמות (בדקות):</label>
                      <input
                        type="number"
                        value={levelDuration}
                        onChange={(e) => setLevelDuration(parseInt(e.target.value, 10) || 18)}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">תנאי כניסה חוזרת ותוספות (Re-entry):</label>
                    <input
                      type="text"
                      value={reEntryTerms}
                      onChange={(e) => setReEntryTerms(e.target.value)}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">מידע נוסף / הערות מארגן:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ======================= CASE 2: CASH GAME ======================= */}
              {eventType === 'cash' && (
                <div className="space-y-4">
                  
                  {/* Title & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-neutral-700 mb-1">
                        כותרת משחק הקאש: *
                      </label>
                      <input
                        type="text"
                        value={cashTitle}
                        onChange={(e) => setCashTitle(e.target.value)}
                        placeholder="למשל: קאש חברי 1/2 ש״ח במודיעין"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        עיר: *
                      </label>
                      <input
                        type="text"
                        value={cashCity}
                        onChange={(e) => setCashCity(e.target.value)}
                        placeholder="למשל: מודיעין"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>
                  </div>

                  {/* Region, Start Date, Game Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        אזור גאוגרפי:
                      </label>
                      <select
                        value={cashRegion}
                        onChange={(e) => setCashRegion(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                      >
                        <option value="תל אביב">תל אביב</option>
                        <option value="מרכז">מרכז וגוש דן</option>
                        <option value="שרון">הרצליה והשרון</option>
                        <option value="שפלה">מודיעין, ראשל״צ והשפלה</option>
                        <option value="ירושלים">ירושלים</option>
                        <option value="צפון">צפון</option>
                        <option value="דרום">דרום</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        מועד התחלה מתוכנן: *
                      </label>
                      <input
                        type="datetime-local"
                        value={cashStartDateTime}
                        onChange={(e) => setCashStartDateTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        סוג המשחק:
                      </label>
                      <select
                        value={cashGameType}
                        onChange={(e) => setCashGameType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                      >
                        <option value="Texas Hold'em">Texas Hold'em</option>
                        <option value="Omaha">Pot Limit Omaha (PLO)</option>
                        <option value="Dealer's Choice">Dealer's Choice</option>
                        <option value="אחר">אחר</option>
                      </select>
                    </div>
                  </div>

                  {/* Stakes & Buy-In */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        בליינדים: *
                      </label>
                      <input
                        type="text"
                        value={cashBlinds}
                        onChange={(e) => setCashBlinds(e.target.value)}
                        placeholder="למשל: 1/2 ₪, 2/5 ₪"
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        כניסה מינימלית לשולחן (₪):
                      </label>
                      <input
                        type="number"
                        value={cashMinBuyIn}
                        onChange={(e) => setCashMinBuyIn(parseInt(e.target.value, 10) || 100)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        כניסה מקסימלית (₪):
                      </label>
                      <input
                        type="number"
                        value={cashMaxBuyIn}
                        onChange={(e) => setCashMaxBuyIn(parseInt(e.target.value, 10) || 500)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                      />
                    </div>
                  </div>

                  {/* ---------------- CASH FEE MODEL (מודל הגבייה / אירוח) ---------------- */}
                  <div className="p-4 bg-[#F7F8F4] rounded-2xl border border-neutral-200 space-y-3">
                    <div>
                      <span className="font-bold text-[#123B32] text-sm block">
                        מודל הגבייה והאירוח (שקיפות מלאה לשחקנים):
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        סיווג מדויק בין משחק חברי ללא עמלה, השתתפות בהוצאות משותפות, או עמלת מארגן.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                        cashFeeModel === 'no_fee' 
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <input
                            type="radio"
                            name="feeModel"
                            value="no_fee"
                            checked={cashFeeModel === 'no_fee'}
                            onChange={() => setCashFeeModel('no_fee')}
                            className="text-emerald-700"
                          />
                          <span className="font-bold text-emerald-950">ללא עמלת מארגן</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 leading-tight">
                          הצהרה שאין רייק, דמי אירוח או תשלום לפי זמן.
                        </span>
                      </label>

                      <label className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                        cashFeeModel === 'shared_expenses' 
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' 
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <input
                            type="radio"
                            name="feeModel"
                            value="shared_expenses"
                            checked={cashFeeModel === 'shared_expenses'}
                            onChange={() => setCashFeeModel('shared_expenses')}
                            className="text-amber-700"
                          />
                          <span className="font-bold text-amber-950">השתתפות בהוצאות</span>
                        </div>
                        <span className="text-[10px] text-amber-800 leading-tight">
                          חולקים הוצאות משותפות (כיבוד, פיצות, שכירות).
                        </span>
                      </label>

                      <label className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                        cashFeeModel === 'commercial_rake' 
                          ? 'bg-neutral-100 border-neutral-400 ring-1 ring-neutral-400' 
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <input
                            type="radio"
                            name="feeModel"
                            value="commercial_rake"
                            checked={cashFeeModel === 'commercial_rake'}
                            onChange={() => setCashFeeModel('commercial_rake')}
                            className="text-neutral-700"
                          />
                          <span className="font-bold text-neutral-900">עמלת מארגן / רייק</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 leading-tight">
                          גביית רייק, עמלת זמן או דמי כניסה למארגן.
                        </span>
                      </label>
                    </div>

                    {/* Specific fee model explanations & inputs */}
                    {cashFeeModel === 'no_fee' && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>תג שיוצג בכרטיס ובפרטים: ״משחק חברי · ללא עמלת מארגן״</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          ״לפי הצהרת המפרסם. סכום הכניסה לשולחן מוצג בנפרד.״ (התג מחושב מתוך נתוני הגבייה. אין שימוש במילים ׳חינם׳ או ׳מאומת׳ כתחליף).
                        </p>
                      </div>
                    )}

                    {cashFeeModel === 'shared_expenses' && (
                      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                        <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                          <Coffee className="w-4 h-4 text-amber-700" />
                          <span>פירוט השתתפות בהוצאות (חובה):</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-neutral-700 mb-1">
                              עבור מה נגבה הכסף: *
                            </label>
                            <input
                              type="text"
                              value={sharedForWhat}
                              onChange={(e) => setSharedForWhat(e.target.value)}
                              placeholder="למשל: פיצות, כיבוד קל, שתייה קלה ובירות"
                              className="w-full p-2 border rounded-lg bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-neutral-700 mb-1">
                              סכום לאדם או אופן החישוב: *
                            </label>
                            <input
                              type="text"
                              value={sharedCostPerPerson}
                              onChange={(e) => setSharedCostPerPerson(e.target.value)}
                              placeholder="למשל: כ-40 ₪ לאדם לפי חשבונית"
                              className="w-full p-2 border rounded-lg bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-neutral-700">סוג ההשתתפות:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={!sharedIsMandatory}
                                onChange={() => setSharedIsMandatory(false)}
                              />
                              <span>רשות</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={sharedIsMandatory}
                                onChange={() => setSharedIsMandatory(true)}
                              />
                              <span>חובה</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-neutral-700">ודאות הסכום:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={sharedIsEstimated}
                                onChange={() => setSharedIsEstimated(true)}
                              />
                              <span>משוער</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={!sharedIsEstimated}
                                onChange={() => setSharedIsEstimated(false)}
                              />
                              <span>סופי</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {cashFeeModel === 'commercial_rake' && (
                      <div className="p-3 bg-neutral-100 rounded-xl space-y-2 border border-neutral-200">
                        <label className="block font-semibold text-neutral-800">
                          פירוט עמלת המארגן / רייק: *
                        </label>
                        <input
                          type="text"
                          value={commercialRakeDesc}
                          onChange={(e) => setCommercialRakeDesc(e.target.value)}
                          placeholder="למשל: 5% עד 50 ₪ לקופה או 30 ₪ לשעה"
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Cash Contacts */}
                  <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                    <span className="font-bold text-[#123B32] block">
                      פרטי קשר לפנייה לתיאום המשחק (לפחות אחד חובה): *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-600 mb-1">WhatsApp:</label>
                        <input
                          type="text"
                          value={cashWhatsapp}
                          onChange={(e) => setCashWhatsapp(e.target.value)}
                          placeholder="למשל: 0501234567"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">Telegram:</label>
                        <input
                          type="text"
                          value={cashTelegram}
                          onChange={(e) => setCashTelegram(e.target.value)}
                          placeholder="למשל: @poker_contact"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">טלפון ישיר:</label>
                        <input
                          type="text"
                          value={cashPhone}
                          onChange={(e) => setCashPhone(e.target.value)}
                          placeholder="050-0000000"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cash Description */}
                  <div>
                    <label className="block font-semibold mb-1">תיאור המשחק ואווירה:</label>
                    <textarea
                      value={cashDescription}
                      onChange={(e) => setCashDescription(e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* ======================= CASE 3: CLUBGG ======================= */}
              {eventType === 'clubgg' && (
                <div className="space-y-4">
                  
                  {/* Name and ClubGG ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        שם המועדון ב-ClubGG / GGPOKER: *
                      </label>
                      <input
                        type="text"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        placeholder="למשל: Israel GG Masters"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        מספר מועדון ClubGG ID: *
                      </label>
                      <input
                        type="text"
                        value={clubggId}
                        onChange={(e) => setClubggId(e.target.value)}
                        placeholder="למשל: 822466"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                        required
                      />
                    </div>
                  </div>

                  {/* Minimum Deposit (הפקדה מינימלית - מודגשת וחובה) */}
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                      <Coins className="w-4 h-4 text-emerald-700" />
                      <span>הפקדה מינימלית (חובה לפי מפרט): *</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      הסכום המינימלי ששחקן צריך להפקיד כדי להתחיל לשחק במועדון.
                    </p>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        value={clubMinDeposit}
                        onChange={(e) => setClubMinDeposit(e.target.value)}
                        placeholder="למשל: 100 ₪ או $30"
                        className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-bold text-sm text-[#123B32]"
                        required
                      />
                    </div>
                  </div>

                  {/* Agent Contact Details (פרטי קשר של הסוכן - מודגש וחובה) */}
                  <div className="p-4 bg-[#F7F8F4] rounded-2xl border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-[#123B32] font-bold">
                      <Users className="w-4 h-4 text-[#123B32]" />
                      <span>פרטי קשר של הסוכן (חובה להזין לפחות דרך התקשרות אחת): *</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      השחקנים יוכלו לפנות ישירות לסוכן לצורך הפקדות, משיכות ואימות חשבון.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          שם הסוכן / כינוי:
                        </label>
                        <input
                          type="text"
                          value={clubAgentName}
                          onChange={(e) => setClubAgentName(e.target.value)}
                          placeholder="למשל: אבי סוכן מורשה"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          WhatsApp של הסוכן: *
                        </label>
                        <input
                          type="text"
                          value={clubAgentWhatsapp}
                          onChange={(e) => setClubAgentWhatsapp(e.target.value)}
                          placeholder="למשל: 0501234567"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          Telegram של הסוכן:
                        </label>
                        <input
                          type="text"
                          value={clubAgentTelegram}
                          onChange={(e) => setClubAgentTelegram(e.target.value)}
                          placeholder="למשל: @gg_agent_israel"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          טלפון של הסוכן:
                        </label>
                        <input
                          type="text"
                          value={clubAgentPhone}
                          onChange={(e) => setClubAgentPhone(e.target.value)}
                          placeholder="050-0000000"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Join Link & Description */}
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      קישור ישיר להצטרפות באפליקציית ClubGG (Invite Link):
                    </label>
                    <input
                      type="url"
                      value={clubJoinLink}
                      onChange={(e) => setClubJoinLink(e.target.value)}
                      placeholder="https://www.clubgg.net/join?club_id=..."
                      className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">תיאור המועדון, בונוסים והטבות שחקנים:</label>
                    <textarea
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                >
                  ביטול
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-[#D8F36A]" />
                  <span>
                    {submitting 
                      ? 'מפרסם...' 
                      : eventType === 'tournament' 
                      ? 'פרסם טורניר' 
                      : eventType === 'cash' 
                      ? 'פרסם משחק קאש' 
                      : 'פרסם מועדון ClubGG'}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
