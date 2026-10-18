import React, { useState, useEffect } from 'react';
import type { TournamentEvent, Organizer, OnlineClub, Review, User, CashGame, GroupFormation } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { formatFullJerusalemDate } from '../utils/date.ts';
import { 
  Shield, 
  Plus, 
  Edit3, 
  EyeOff, 
  Eye, 
  Copy, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Users, 
  Trophy, 
  Smartphone, 
  MessageSquare, 
  Check, 
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Images,
  Sparkles,
  ShieldCheck,
  Coffee,
  Coins,
  MessageCircle,
  Send,
  PhoneCall
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: User | null;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'group_formations' | 'cash' | 'organizers' | 'clubs' | 'reviews' | 'metrics'>('tournaments');

  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [clubs, setClubs] = useState<OnlineClub[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [groupFormations, setGroupFormations] = useState<GroupFormation[]>([]);
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [rejectingGroup, setRejectingGroup] = useState<GroupFormation | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Forms modal states
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TournamentEvent | null>(null);
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [reviewHidingId, setReviewHidingId] = useState<string | null>(null);
  const [internalHideReason, setInternalHideReason] = useState('');
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  // Event Form State
  const [eventForm, setEventForm] = useState({
    organizerId: '',
    title: '',
    city: 'תל אביב',
    region: 'תל אביב' as any,
    startDateTime: '',
    estimatedEndDateTime: '',
    prizePoolAmount: 500,
    houseFeeAmount: 200,
    extraFeeAmount: 0,
    extraFeeDescription: '',
    startingStack: 50000,
    levelDuration: 15,
    reEntryTerms: 'כניסה חוזרת עד רמה 6',
    description: '',
    coverImageUrl: '',
    galleryImages: [] as string[],
    promotionType: 'regular' as any,
    isPaidPromotion: false,
    paidAmount: 0
  });

  // 3 Event Types for Add Event Modal
  const [adminEventType, setAdminEventType] = useState<'tournament' | 'cash' | 'clubgg'>('tournament');

  // Cash Form State
  const [cashForm, setCashForm] = useState({
    title: '',
    city: 'תל אביב',
    region: 'תל אביב' as any,
    startDateTime: '',
    gameType: 'Texas Hold\'em' as any,
    blinds: '1/2 ₪',
    minBuyIn: 200,
    maxBuyIn: 1000,
    seats: 9,
    feeModel: 'no_fee' as any,
    sharedForWhat: 'כיבוד קל, פיצות ושתייה קלה',
    sharedCostPerPerson: 'כ-40 ₪ לפי עלות בפועל',
    sharedIsMandatory: false,
    sharedIsEstimated: true,
    commercialRakeDesc: '5% עד 40 ₪ לקופה',
    whatsapp: '',
    telegram: '',
    phone: '',
    description: ''
  });

  // Club Form State
  const [clubForm, setClubForm] = useState({
    name: '',
    clubggId: '',
    minDeposit: '100 ₪',
    agentName: '',
    agentWhatsapp: '',
    agentTelegram: '',
    agentPhone: '',
    joinLink: '',
    description: '',
    organizerId: ''
  });

  // Organizer Form State
  const [orgForm, setOrgForm] = useState({
    name: '',
    type: 'club',
    description: '',
    city: 'תל אביב',
    whatsapp: '',
    telegram: '',
    phone: '',
    website: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [evts, orgs, clbs, revs, metrs, grps, cshs] = await Promise.all([
        api.getAllAdminEvents(),
        api.getOrganizers(),
        api.getOnlineClubs(),
        api.getAdminReviews(),
        api.getAdminMetrics(),
        api.getAdminGroupFormations().catch(() => []),
        api.getAdminCashGames().catch(() => [])
      ]);
      setEvents(evts);
      setOrganizers(orgs);
      setClubs(clbs);
      setReviews(revs);
      setMetrics(metrs);
      setGroupFormations(grps || []);
      setCashGames(cshs || []);
      if (orgs.length > 0 && !eventForm.organizerId) {
        setEventForm((prev) => ({ ...prev, organizerId: orgs[0].id }));
      }
    } catch (err: any) {
      setActionError(err.message || 'שגיאה בטעינת נתוני ניהול');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleModerateGroup = async (id: string, status: 'approved' | 'rejected' | 'hidden' | 'pending', reason?: string) => {
    try {
      const res = await api.moderateGroupFormation(id, status, reason);
      showNotification(res.message || 'סטטוס הקבוצה עודכן בהצלחה');
      setRejectingGroup(null);
      setRejectionReasonInput('');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleCashAction = async (id: string, action: 'hide' | 'unhide' | 'delete') => {
    try {
      const res = await api.cashGameAction(id, action);
      showNotification(res.message || 'הפעולה הושלמה בהצלחה');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleEventAction = async (id: string, action: 'hide' | 'unhide' | 'duplicate_draft' | 'renew_publication') => {
    try {
      const res = await api.eventAction(id, action);
      showNotification(res.message || 'הפעולה הושלמה בהצלחה');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, eventForm as any);
        showNotification('האירוע עודכן בהצלחה');
      } else if (adminEventType === 'tournament') {
        await api.createEvent(eventForm as any);
        showNotification('אירוע טורניר חדש פורסם בהצלחה עם שקיפות מחיר מלאה');
      } else if (adminEventType === 'cash') {
        let sharedExp = undefined;
        if (cashForm.feeModel === 'shared_expenses') {
          sharedExp = {
            forWhat: cashForm.sharedForWhat,
            costPerPerson: cashForm.sharedCostPerPerson,
            isMandatory: cashForm.sharedIsMandatory,
            isEstimated: cashForm.sharedIsEstimated
          };
        }
        await api.createCashGame({
          ...cashForm,
          sharedExpensesDetails: sharedExp,
          rakeDescription: cashForm.feeModel === 'commercial_rake' ? cashForm.commercialRakeDesc : undefined,
          startDateTime: cashForm.startDateTime ? new Date(cashForm.startDateTime).toISOString() : new Date().toISOString()
        } as any);
        showNotification('משחק קאש חדש פורסם בהצלחה בלשונית הקאש');
      } else if (adminEventType === 'clubgg') {
        await api.createOnlineClub({
          ...clubForm,
          joinLink: clubForm.joinLink || `https://www.clubgg.net/join?club_id=${clubForm.clubggId}`
        } as any);
        showNotification('מועדון ClubGG חדש פורסם בהצלחה');
      }
      setIsAddingEvent(false);
      setEditingEvent(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOrganizer(orgForm as any);
      showNotification('מארגן נוסף בהצלחה');
      setIsAddingOrg(false);
      setOrgForm({
        name: '',
        type: 'club',
        description: '',
        city: 'תל אביב',
        whatsapp: '',
        telegram: '',
        phone: '',
        website: ''
      });
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleReviewStatus = async (id: string, status: 'approved' | 'hidden') => {
    try {
      await api.moderateReview(id, status, status === 'hidden' ? internalHideReason : undefined);
      showNotification(status === 'approved' ? 'הביקורת אושרה והוצגה למשתמשים' : 'הביקורת הוסתרה');
      setReviewHidingId(null);
      setInternalHideReason('');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Admin Header */}
      <div className="bg-[#123B32] text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D8F36A] text-[#123B32] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              ממשק ניהול PokerCircle — Game Finder
            </h1>
            <p className="text-xs text-emerald-200">
              מחובר כמנהל: {currentUser?.email} (הרשאות שרת מוגנות)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          חזרה לתצוגת שחקן
        </button>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tournaments' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>טורנירים חיים ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('group_formations')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'group_formations' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4 text-[#D8F36A]" />
          <span>
            גיבוש קבוצות חבריות{' '}
            {groupFormations.filter((g) => g.status === 'pending').length > 0 ? (
              <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded-full text-[10px] font-black mr-1">
                {groupFormations.filter((g) => g.status === 'pending').length} לבדיקה
              </span>
            ) : (
              `(${groupFormations.length})`
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'cash' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Coins className="w-4 h-4 text-[#D8F36A]" />
          <span>משחקי קאש ({cashGames.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'organizers' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>מארגנים ומועדונים ({organizers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clubs')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'clubs' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>מועדוני אונליין ClubGG ({clubs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reviews' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>
            ביקורות{' '}
            {reviews.filter((r) => r.status === 'pending').length > 0 && (
              <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {reviews.filter((r) => r.status === 'pending').length} ממתינות
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'metrics' ? 'bg-[#123B32] text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>מדדי שימוש</span>
        </button>
      </div>

      {/* Tab 1: Tournaments Management */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17231F]">
                ניהול טורנירים חיים
              </h2>
              <p className="text-xs text-neutral-500">
                פרסום תקף ל-7 ימים. תשלום חובה נוסף מחייב הסבר ברור.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setIsAddingEvent(true);
              }}
              className="py-2 px-4 rounded-xl bg-[#123B32] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1a4a40]"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף טורניר חדש</span>
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
              אין טורנירים במערכת
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F7F8F4] border-b border-neutral-200 text-neutral-600 font-semibold">
                    <tr>
                      <th className="p-3.5">כותרת האירוע</th>
                      <th className="p-3.5">מארגן</th>
                      <th className="p-3.5">עיר / מועד</th>
                      <th className="p-3.5">פירוט מחיר</th>
                      <th className="p-3.5">סך הכל</th>
                      <th className="p-3.5">סטטוס</th>
                      <th className="p-3.5">סוג פרסום</th>
                      <th className="p-3.5 text-left">פעולות ניהול</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-neutral-50/60">
                        <td className="p-3.5 font-bold text-[#17231F]">
                          {evt.title}
                          {evt.isDemo && (
                            <span className="text-[10px] font-mono text-neutral-400 block font-normal">
                              (הדגמה)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-neutral-600">
                          {evt.organizer?.name || evt.organizerId}
                        </td>
                        <td className="p-3.5 text-neutral-600">
                          <div>{evt.city}</div>
                          <div className="text-[11px] text-neutral-400">
                            {formatFullJerusalemDate(evt.startDateTime)}
                          </div>
                        </td>
                        <td className="p-3.5 tabular-nums text-neutral-600">
                          <div>{evt.prizePoolAmount} ₪ לפרסים</div>
                          <div>{evt.houseFeeAmount} ₪ עמלה</div>
                          {evt.extraFeeAmount > 0 && (
                            <div className="text-amber-800">
                              +{evt.extraFeeAmount} ₪ ({evt.extraFeeDescription})
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-[#123B32] tabular-nums text-sm">
                          {evt.totalBuyIn} ₪
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            evt.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : evt.status === 'hidden'
                              ? 'bg-neutral-100 text-neutral-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {evt.status === 'active' ? 'פעיל' : evt.status === 'hidden' ? 'מוסתר' : 'טיוטה'}
                          </span>
                        </td>
                        <td className="p-3.5 text-neutral-600">
                          <span className="block font-medium">
                            {evt.promotionType === 'sponsored' ? 'ממומן בתשלום' : evt.promotionType === 'featured' ? 'מודגש' : 'רגיל'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {evt.isPaidPromotion ? `שולם (${evt.paidAmount} ₪)` : 'תקופת הרצה (חינם)'}
                          </span>
                        </td>
                        <td className="p-3.5 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Actions from Table in Spec */}
                            <button
                              title="ערוך"
                              onClick={() => {
                                setEditingEvent(evt);
                                setEventForm({
                                  organizerId: evt.organizerId,
                                  title: evt.title,
                                  city: evt.city,
                                  region: evt.region,
                                  startDateTime: evt.startDateTime,
                                  estimatedEndDateTime: evt.estimatedEndDateTime || '',
                                  prizePoolAmount: evt.prizePoolAmount,
                                  houseFeeAmount: evt.houseFeeAmount,
                                  extraFeeAmount: evt.extraFeeAmount,
                                  extraFeeDescription: evt.extraFeeDescription || '',
                                  startingStack: evt.startingStack,
                                  levelDuration: evt.levelDuration,
                                  reEntryTerms: evt.reEntryTerms,
                                  description: evt.description,
                                  coverImageUrl: evt.coverImageUrl || '',
                                  galleryImages: evt.galleryImages || (evt.coverImageUrl ? [evt.coverImageUrl] : []),
                                  promotionType: evt.promotionType,
                                  isPaidPromotion: evt.isPaidPromotion,
                                  paidAmount: evt.paidAmount || 0
                                });
                                setIsAddingEvent(true);
                              }}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                            </button>

                            {evt.status === 'active' ? (
                              <button
                                title="הסתר מהחיפוש הציבורי"
                                onClick={() => handleEventAction(evt.id, 'hide')}
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                title="החזר לחיפוש"
                                onClick={() => handleEventAction(evt.id, 'unhide')}
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-emerald-700"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              title="שכפל לאירוע חדש (טיוטה)"
                              onClick={() => handleEventAction(evt.id, 'duplicate_draft')}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              title="חדש פרסום (7 ימים נוספים)"
                              onClick={() => handleEventAction(evt.id, 'renew_publication')}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-emerald-700"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Group Formations Management (Spec Section 8) */}
      {activeTab === 'group_formations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17231F] flex items-center gap-2">
                <span>אישור וניהול פרסומי גיבוש קבוצות חבריות</span>
                {groupFormations.filter((g) => g.status === 'pending').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-400 text-black">
                    {groupFormations.filter((g) => g.status === 'pending').length} ממתינות לאישור
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-500">
                בדיקת עמידה בכללי שקיפות (ללא עמלות מסחריות), אישור פרסומים או החזרה לתיקון עם הסבר.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#123B32] text-white font-semibold">
                  <tr>
                    <th className="p-3.5">כותרת ומרכז הקבוצה</th>
                    <th className="p-3.5">עיר ואזור</th>
                    <th className="p-3.5">שחקנים (קיים/יעד)</th>
                    <th className="p-3.5">מודל גבייה</th>
                    <th className="p-3.5">בליינדים וטווח</th>
                    <th className="p-3.5">מועד</th>
                    <th className="p-3.5">סטטוס</th>
                    <th className="p-3.5 text-center">פעולות מנהל</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {groupFormations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-400">
                        אין כרגע פרסומי גיבוש קבוצות במערכת.
                      </td>
                    </tr>
                  ) : (
                    groupFormations.map((grp) => {
                      const isNoRake = grp.feeModel === 'no_fee';
                      const missing = Math.max(0, grp.targetPlayers - grp.currentPlayers);

                      return (
                        <tr key={grp.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#17231F]">{grp.title}</div>
                            <div className="text-[11px] text-neutral-400">
                              מרכז: {grp.coordinatorNickname} · {grp.whatsapp || grp.phone || grp.telegram}
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-neutral-700">
                            {grp.city} ({grp.region})
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-[#123B32]">{grp.currentPlayers}/{grp.targetPlayers}</span>
                            <span className="text-[11px] text-emerald-700 block">חסרים: {missing}</span>
                          </td>
                          <td className="p-3.5">
                            {isNoRake ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                ללא עמלת מארגן
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                  <Coffee className="w-3 h-3 text-amber-600" />
                                  השתתפות בהוצאות
                                </span>
                                {grp.sharedExpensesDetails && (
                                  <div className="text-[10px] text-neutral-500">
                                    {grp.sharedExpensesDetails.forWhat}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-700">
                            <div>{grp.plannedBlinds}</div>
                            <div className="text-[11px] text-neutral-400">{grp.buyInLimits}</div>
                          </td>
                          <td className="p-3.5 text-neutral-600">
                            {grp.scheduleDate}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                              grp.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : grp.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : grp.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {grp.status === 'pending'
                                ? 'ממתין לאישור'
                                : grp.status === 'approved'
                                ? 'מאושר ופעיל'
                                : grp.status === 'rejected'
                                ? 'נדחה / הוחזר'
                                : 'מוסתר'}
                            </span>
                            {grp.rejectionReason && (
                              <div className="text-[10px] text-red-600 mt-1 max-w-xs">
                                <strong>הסבר:</strong> {grp.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {grp.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleModerateGroup(grp.id, 'approved')}
                                    className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                                    title="אשר פרסום להצגה בלוח"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>אשר</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingGroup(grp);
                                      setRejectionReasonInput('');
                                    }}
                                    className="py-1 px-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1 transition-colors"
                                    title="החזר לתיקון עם הסבר"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>החזר לתיקון</span>
                                  </button>
                                </>
                              ) : grp.status === 'approved' ? (
                                <button
                                  onClick={() => handleModerateGroup(grp.id, 'hidden')}
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                                  title="הסתר מהלוח הציבורי"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleModerateGroup(grp.id, 'approved')}
                                  className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                  title="החזר לתצוגה פעילה"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>אשר מחדש</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejection Modal for Group Formations (Spec Section 8) */}
          {rejectingGroup && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200 p-6 space-y-4" dir="rtl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-black text-sm text-[#17231F]">
                    החזרת פרסום לתיקון / דחייה
                  </h3>
                  <button
                    onClick={() => setRejectingGroup(null)}
                    className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-neutral-600 space-y-1">
                  <div><strong>כותרת המודעה:</strong> {rejectingGroup.title}</div>
                  <div><strong>מרכז הקבוצה:</strong> {rejectingGroup.coordinatorNickname}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1">
                    הסבר ליוצר המודעה (חובה לפרט מה לתקן):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="לדוגמה: נא לפרט את אופן חלוקת ההוצאות על הכיבוד או לוודא שאין עמלת אירוח נוספת."
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setRejectingGroup(null)}
                    className="py-2 px-4 rounded-xl border border-neutral-300 text-xs font-semibold"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => handleModerateGroup(rejectingGroup.id, 'rejected', rejectionReasonInput)}
                    disabled={!rejectionReasonInput.trim()}
                    className="py-2 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                  >
                    החזר לתיקון
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Cash Games Management */}
      {activeTab === 'cash' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17231F]">
                ניהול משחקי קאש קרובים
              </h2>
              <p className="text-xs text-neutral-500">
                פיקוח על שולחנות קאש חבריים ומסחריים, אכיפת שקיפות מודל הגבייה וסכומי הכניסה.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setAdminEventType('cash');
                setIsAddingEvent(true);
              }}
              className="py-2 px-4 rounded-xl bg-[#123B32] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1a4a40]"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף משחק קאש</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#123B32] text-white font-semibold">
                  <tr>
                    <th className="p-3.5">שם המשחק</th>
                    <th className="p-3.5">עיר ואזור</th>
                    <th className="p-3.5">בליינדים</th>
                    <th className="p-3.5">טווח Buy-In</th>
                    <th className="p-3.5">מודל גבייה ושקיפות</th>
                    <th className="p-3.5">מקומות</th>
                    <th className="p-3.5">סטטוס</th>
                    <th className="p-3.5 text-center">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {cashGames.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-400">
                        אין משחקי קאש במערכת.
                      </td>
                    </tr>
                  ) : (
                    cashGames.map((csh) => {
                      const isNoRake = csh.feeModel === 'no_fee';
                      const isShared = csh.feeModel === 'shared_expenses';

                      return (
                        <tr key={csh.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="p-3.5 font-bold text-[#17231F]">
                            {csh.title}
                          </td>
                          <td className="p-3.5 text-neutral-700">
                            {csh.city} ({csh.region})
                          </td>
                          <td className="p-3.5 font-bold text-[#123B32]">
                            {csh.blinds}
                          </td>
                          <td className="p-3.5 text-neutral-700">
                            {csh.minBuyIn} - {csh.maxBuyIn} ₪
                          </td>
                          <td className="p-3.5">
                            {isNoRake ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                ללא עמלת מארגן
                              </span>
                            ) : isShared ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                <Coffee className="w-3 h-3 text-amber-600" />
                                השתתפות בהוצאות
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700">
                                מסחרי / רייק
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-emerald-700 font-bold">
                            {csh.availableSeats ? `${csh.availableSeats} פנויים` : 'בתיאום'}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              csh.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {csh.status === 'active' ? 'פעיל באתר' : 'מוסתר'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {csh.status === 'active' ? (
                                <button
                                  onClick={() => handleCashAction(csh.id, 'hide')}
                                  title="הסתר משחק"
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCashAction(csh.id, 'unhide')}
                                  title="הצג משחק באתר"
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-emerald-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCashAction(csh.id, 'delete')}
                                title="מחק משחק"
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organizers Management */}
      {activeTab === 'organizers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17231F]">
                ניהול מארגנים ומועדונים
              </h2>
              <p className="text-xs text-neutral-500">
                פרטי קשר, עיר, סוג פעילות ודירוגים מאושרים.
              </p>
            </div>

            <button
              onClick={() => setIsAddingOrg(true)}
              className="py-2 px-4 rounded-xl bg-[#123B32] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1a4a40]"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף מארגן חדש</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizers.map((org) => (
              <div key={org.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#17231F]">{org.name}</h3>
                  <span className="text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    {org.type === 'club' ? 'מועדון' : 'מארגן'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-2">{org.description}</p>
                <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-100 space-y-1">
                  <div>עיר: {org.city}</div>
                  <div>WhatsApp: {org.whatsapp || 'לא הוגדר'}</div>
                  <div>Telegram: {org.telegram || 'לא הוגדר'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Online Clubs */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17231F]">
                מועדוני אונליין ב־ClubGG / GGPOKER
              </h2>
              <p className="text-xs text-neutral-500">
                פרטי מועדונים, הפקדה מינימלית ופרטי קשר של הסוכן להצטרפות.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setAdminEventType('clubgg');
                setIsAddingEvent(true);
              }}
              className="py-2 px-4 rounded-xl bg-[#123B32] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1a4a40]"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף מועדון ClubGG</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#17231F]">{club.name}</h3>
                  {club.isPokerCircleClub && (
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      מועדון PokerCircle הרשמי
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#123B32] bg-[#F7F8F4] px-2.5 py-1 rounded-lg border border-neutral-200">
                    Club ID: {club.clubggId}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    הפקדה מינימלית: {club.minDeposit ? (typeof club.minDeposit === 'number' ? `${club.minDeposit} ₪` : club.minDeposit) : '100 ₪'}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2">{club.description}</p>

                {(club.agentName || club.agentWhatsapp || club.agentTelegram || club.agentPhone) && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px] space-y-1 text-neutral-600">
                    <div className="font-semibold text-neutral-800">
                      סוכן: {club.agentName || 'מורשה'}
                    </div>
                    <div className="flex flex-wrap gap-2 text-neutral-500">
                      {club.agentWhatsapp && <span>WhatsApp: {club.agentWhatsapp}</span>}
                      {club.agentTelegram && <span>Telegram: {club.agentTelegram}</span>}
                      {club.agentPhone && <span>טלפון: {club.agentPhone}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#17231F]">
              אישור וסינון ביקורות שחקנים
            </h2>
            <p className="text-xs text-neutral-500">
              כל ביקורת נכנסת למצב ״ממתינה לאישור״. רק ביקורות מאושרות מחושבות בדירוג הממוצע ומוצגות לציבור.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
              אין ביקורות במערכת
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className={`bg-white rounded-2xl border p-5 shadow-xs ${
                    rev.status === 'pending'
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : rev.status === 'hidden'
                      ? 'border-neutral-200 opacity-70'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17231F]">{rev.displayName}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-xs text-neutral-600">עבור: <strong>{rev.targetName}</strong></span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-xs font-bold text-amber-600">דירוג: {rev.rating} כוכבים</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      rev.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {rev.status === 'pending' ? 'ממתינה לבדיקה' : rev.status === 'approved' ? 'מאושרת' : 'מוסתרת'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed mb-3">
                    "{rev.comment}"
                  </p>

                  {rev.internalHideReason && (
                    <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg mb-3">
                      <strong>סיבת הסתרה פנימית:</strong> {rev.internalHideReason}
                    </div>
                  )}

                  {/* Moderation Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewStatus(rev.id, 'approved')}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>אשר ביקורת</span>
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <div>
                        {reviewHidingId === rev.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={internalHideReason}
                              onChange={(e) => setInternalHideReason(e.target.value)}
                              placeholder="סיבת הסתרה פנימית..."
                              className="p-1.5 text-xs rounded border border-neutral-300 w-48"
                            />
                            <button
                              onClick={() => handleReviewStatus(rev.id, 'hidden')}
                              className="py-1 px-2.5 rounded bg-red-600 text-white text-xs"
                            >
                              הסתר
                            </button>
                            <button
                              onClick={() => setReviewHidingId(null)}
                              className="py-1 px-2 text-neutral-500 text-xs"
                            >
                              ביטול
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewHidingId(rev.id)}
                            className="py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>הסתר ביקורת</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Basic Metrics */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#17231F]">
              מדדי שימוש ופעילות
            </h2>
            <p className="text-xs text-neutral-500">
              מעקב לחיצות ללא איסוף מידע אישי. יעדי ניסוי ל-90 הימים הראשונים.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block mb-1">פניות WhatsApp למארגנים</span>
              <span className="text-2xl font-black text-[#123B32] tabular-nums">{metrics.whatsappClicks}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block mb-1">פניות Telegram</span>
              <span className="text-2xl font-black text-[#123B32] tabular-nums">{metrics.telegramClicks}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block mb-1">כניסות לטופס הרשמה PokerCircle</span>
              <span className="text-2xl font-black text-[#123B32] tabular-nums">{metrics.preregClicks}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block mb-1">צפיות בפרטי אירוע</span>
              <span className="text-2xl font-black text-[#123B32] tabular-nums">{metrics.detailsViews}</span>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-xs space-y-2">
            <h3 className="font-bold text-sm text-emerald-950">סטטוס תקופת הרצה 90 יום</h3>
            <p className="text-emerald-900 leading-relaxed">
              בתקופה זו פרסום טורנירים והדגשתם ניתנים בחינם לבניית קהילה והוכחת צורך. לאחר מכן, תמחור מוערך של 100 ₪ לפרסום אירוע שבועי כולל הדגשה.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#17231F]">
                {editingEvent 
                  ? 'עריכת טורניר קיים' 
                  : adminEventType === 'tournament' 
                  ? 'הוספת טורניר חדש ללוח' 
                  : adminEventType === 'cash' 
                  ? 'הוספת משחק קאש חדש' 
                  : 'הוספת מועדון ClubGG חדש'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                ✕
              </button>
            </div>

            {/* 3 Publication Options Selector (when not editing existing event) */}
            {!editingEvent && (
              <div className="p-1.5 bg-[#F7F8F4] rounded-2xl border border-neutral-200 mb-4">
                <label className="block font-bold text-neutral-700 text-[11px] mb-1 px-1">
                  בחר סוג פעילות לפרסום:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminEventType('tournament')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      adminEventType === 'tournament' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Trophy className={`w-3.5 h-3.5 ${adminEventType === 'tournament' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>טורניר</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminEventType('cash')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      adminEventType === 'cash' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Coins className={`w-4 h-4 ${adminEventType === 'cash' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>משחק קאש</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminEventType('clubgg')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      adminEventType === 'clubgg' 
                        ? 'bg-[#123B32] text-white shadow-sm ring-2 ring-[#D8F36A]' 
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 ${adminEventType === 'clubgg' ? 'text-[#D8F36A]' : 'text-neutral-500'}`} />
                    <span>מועדון CLUBGG</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              
              {/* ================= OPTION 1: TOURNAMENT ================= */}
              {(editingEvent || adminEventType === 'tournament') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">מארגן אחראי:</label>
                      <select
                        value={eventForm.organizerId}
                        onChange={(e) => setEventForm({ ...eventForm, organizerId: e.target.value })}
                        className="w-full p-2 border rounded-xl"
                        required
                      >
                        {organizers.map((o) => (
                          <option key={o.id} value={o.id}>{o.name} ({o.city})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">שם האירוע:</label>
                      <input
                        type="text"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="למשל: דיפסטאק חגיגי 50K"
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">עיר:</label>
                      <input
                        type="text"
                        value={eventForm.city}
                        onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">מועד התחלה:</label>
                      <input
                        type="datetime-local"
                        value={eventForm.startDateTime ? eventForm.startDateTime.substring(0, 16) : ''}
                        onChange={(e) => setEventForm({ ...eventForm, startDateTime: new Date(e.target.value).toISOString() })}
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">סיום משוער (אופציונלי):</label>
                      <input
                        type="datetime-local"
                        value={eventForm.estimatedEndDateTime ? eventForm.estimatedEndDateTime.substring(0, 16) : ''}
                        onChange={(e) => setEventForm({ ...eventForm, estimatedEndDateTime: new Date(e.target.value).toISOString() })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Price Transparency Section */}
                  <div className="p-4 bg-[#F7F8F4] rounded-xl border border-neutral-200 space-y-3">
                    <span className="font-bold text-[#123B32] block">
                      שקיפות מחיר (חובה להזין בנפרד):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-600 mb-1">1. לקופת הפרסים (₪):</label>
                        <input
                          type="number"
                          value={eventForm.prizePoolAmount}
                          onChange={(e) => setEventForm({ ...eventForm, prizePoolAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">2. עמלת מארגן / בית (₪):</label>
                        <input
                          type="number"
                          value={eventForm.houseFeeAmount}
                          onChange={(e) => setEventForm({ ...eventForm, houseFeeAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">3. תשלום חובה נוסף (₪):</label>
                        <input
                          type="number"
                          value={eventForm.extraFeeAmount}
                          onChange={(e) => setEventForm({ ...eventForm, extraFeeAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    {eventForm.extraFeeAmount > 0 && (
                      <div>
                        <label className="block text-amber-900 font-semibold mb-1">
                          הסבר תשלום חובה נוסף (חובה לפי מפרט):
                        </label>
                        <input
                          type="text"
                          value={eventForm.extraFeeDescription}
                          onChange={(e) => setEventForm({ ...eventForm, extraFeeDescription: e.target.value })}
                          placeholder="למשל: דמי צ'יפ באונטי מיוחד לרישום"
                          className="w-full p-2 border border-amber-300 rounded-lg bg-white"
                          required
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-200 text-sm font-bold text-[#123B32] flex items-center justify-between">
                      <span>סך הכל כניסה לתשלום (מחושב אוטומטית):</span>
                      <span className="text-base tabular-nums">
                        {eventForm.prizePoolAmount + eventForm.houseFeeAmount + eventForm.extraFeeAmount} ₪
                      </span>
                    </div>
                  </div>

                  {/* Tournament Structure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">ערימת פתיחה:</label>
                      <input
                        type="number"
                        value={eventForm.startingStack}
                        onChange={(e) => setEventForm({ ...eventForm, startingStack: parseInt(e.target.value, 10) || 50000 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">משך רמות (בדקות):</label>
                      <input
                        type="number"
                        value={eventForm.levelDuration}
                        onChange={(e) => setEventForm({ ...eventForm, levelDuration: parseInt(e.target.value, 10) || 15 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">תנאי כניסה חוזרת ותוספות (Re-entry):</label>
                    <input
                      type="text"
                      value={eventForm.reEntryTerms}
                      onChange={(e) => setEventForm({ ...eventForm, reEntryTerms: e.target.value })}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">מידע נוסף / הערות מארגן:</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>

                  {/* Photos & Gallery Section */}
                  <div className="p-4 bg-[#F7F8F4] rounded-xl border border-neutral-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Images className="w-4 h-4 text-[#123B32]" />
                        <span className="font-bold text-[#123B32]">
                          תמונות וגלריית האירוע (נושא, מקום ומבנה)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        תמונת נושא ראשית (Cover Image):
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="url"
                          value={eventForm.coverImageUrl}
                          onChange={(e) => setEventForm({ ...eventForm, coverImageUrl: e.target.value })}
                          placeholder="הדבק קישור לתמונה (URL)..."
                          className="flex-1 p-2 border rounded-lg bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= OPTION 2: CASH GAME ================= */}
              {!editingEvent && adminEventType === 'cash' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">כותרת משחק הקאש: *</label>
                      <input
                        type="text"
                        value={cashForm.title}
                        onChange={(e) => setCashForm({ ...cashForm, title: e.target.value })}
                        placeholder="למשל: קאש חברי 1/2 ש״ח במודיעין"
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">עיר: *</label>
                      <input
                        type="text"
                        value={cashForm.city}
                        onChange={(e) => setCashForm({ ...cashForm, city: e.target.value })}
                        placeholder="למשל: מודיעין"
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">אזור גאוגרפי:</label>
                      <select
                        value={cashForm.region}
                        onChange={(e) => setCashForm({ ...cashForm, region: e.target.value as any })}
                        className="w-full p-2 border rounded-xl bg-white"
                      >
                        <option value="תל אביב">תל אביב</option>
                        <option value="מרכז">מרכז וגוש דן</option>
                        <option value="שרון">שרון</option>
                        <option value="שפלה">שפלה ומודיעין</option>
                        <option value="ירושלים">ירושלים</option>
                        <option value="צפון">צפון</option>
                        <option value="דרום">דרום</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">מועד התחלה מתוכנן:</label>
                      <input
                        type="datetime-local"
                        value={cashForm.startDateTime ? cashForm.startDateTime.substring(0, 16) : ''}
                        onChange={(e) => setCashForm({ ...cashForm, startDateTime: e.target.value })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">סוג המשחק:</label>
                      <select
                        value={cashForm.gameType}
                        onChange={(e) => setCashForm({ ...cashForm, gameType: e.target.value as any })}
                        className="w-full p-2 border rounded-xl bg-white"
                      >
                        <option value="Texas Hold'em">Texas Hold'em</option>
                        <option value="Omaha">Pot Limit Omaha (PLO)</option>
                        <option value="Dealer's Choice">Dealer's Choice</option>
                        <option value="אחר">אחר</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">בליינדים: *</label>
                      <input
                        type="text"
                        value={cashForm.blinds}
                        onChange={(e) => setCashForm({ ...cashForm, blinds: e.target.value })}
                        placeholder="למשל: 1/2 ₪, 2/5 ₪"
                        className="w-full p-2 border rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">מינימום כניסה (₪):</label>
                      <input
                        type="number"
                        value={cashForm.minBuyIn}
                        onChange={(e) => setCashForm({ ...cashForm, minBuyIn: parseInt(e.target.value, 10) || 100 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">מקסימום כניסה (₪):</label>
                      <input
                        type="number"
                        value={cashForm.maxBuyIn}
                        onChange={(e) => setCashForm({ ...cashForm, maxBuyIn: parseInt(e.target.value, 10) || 500 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* ---------------- CASH FEE MODEL (סוג הגבייה / אירוח) ---------------- */}
                  <div className="p-4 bg-[#F7F8F4] rounded-2xl border border-neutral-200 space-y-3">
                    <div>
                      <span className="font-bold text-[#123B32] text-sm block">
                        סוג הגבייה והאירוח (משחק חברי וכו'): *
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        הבחנה מדויקת בין משחק ללא עמלה, השתתפות בהוצאות משותפות, או גביית מארגן/רייק.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                        cashForm.feeModel === 'no_fee' 
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                          : 'bg-white border-neutral-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <input
                            type="radio"
                            name="adminCashFee"
                            checked={cashForm.feeModel === 'no_fee'}
                            onChange={() => setCashForm({ ...cashForm, feeModel: 'no_fee' })}
                          />
                          <span className="font-bold text-emerald-950">ללא עמלת מארגן</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 block">
                          הצהרה שאין רייק, עמלת אירוח או זמן.
                        </span>
                      </label>

                      <label className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                        cashForm.feeModel === 'shared_expenses' 
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' 
                          : 'bg-white border-neutral-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <input
                            type="radio"
                            name="adminCashFee"
                            checked={cashForm.feeModel === 'shared_expenses'}
                            onChange={() => setCashForm({ ...cashForm, feeModel: 'shared_expenses' })}
                          />
                          <span className="font-bold text-amber-950">השתתפות בהוצאות</span>
                        </div>
                        <span className="text-[10px] text-amber-800 block">
                          חולקים כיבוד, פיצות, שכירות חלל.
                        </span>
                      </label>

                      <label className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                        cashForm.feeModel === 'commercial_rake' 
                          ? 'bg-neutral-100 border-neutral-400 ring-1 ring-neutral-400' 
                          : 'bg-white border-neutral-200'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <input
                            type="radio"
                            name="adminCashFee"
                            checked={cashForm.feeModel === 'commercial_rake'}
                            onChange={() => setCashForm({ ...cashForm, feeModel: 'commercial_rake' })}
                          />
                          <span className="font-bold text-neutral-900">עמלת מארגן / רייק</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 block">
                          רייק מקופה, עמלת זמן או דמי כניסה.
                        </span>
                      </label>
                    </div>

                    {/* Explanations & conditional fields */}
                    {cashForm.feeModel === 'no_fee' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>תג שיוצג בכרטיס ובפרטים: ״משחק חברי · ללא עמלת מארגן״</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          ״לפי הצהרת המפרסם. סכום הכניסה לשולחן מוצג בנפרד.״
                        </p>
                      </div>
                    )}

                    {cashForm.feeModel === 'shared_expenses' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                          <Coffee className="w-4 h-4 text-amber-700" />
                          <span>פירוט השתתפות בהוצאות (חובה):</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-neutral-700 font-semibold mb-1">עבור מה נגבה הכסף: *</label>
                            <input
                              type="text"
                              value={cashForm.sharedForWhat}
                              onChange={(e) => setCashForm({ ...cashForm, sharedForWhat: e.target.value })}
                              placeholder="פיצות, כיבוד קל, שתייה ובירות"
                              className="w-full p-2 border rounded-lg bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-neutral-700 font-semibold mb-1">סכום לאדם או אופן החישוב: *</label>
                            <input
                              type="text"
                              value={cashForm.sharedCostPerPerson}
                              onChange={(e) => setCashForm({ ...cashForm, sharedCostPerPerson: e.target.value })}
                              placeholder="כ-40 ₪ לפי קבלה"
                              className="w-full p-2 border rounded-lg bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-1 text-[11px]">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cashForm.sharedIsMandatory}
                              onChange={(e) => setCashForm({ ...cashForm, sharedIsMandatory: e.target.checked })}
                            />
                            <span>השתתפות חובה (ברירת מחדל: רשות)</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cashForm.sharedIsEstimated}
                              onChange={(e) => setCashForm({ ...cashForm, sharedIsEstimated: e.target.checked })}
                            />
                            <span>סכום משוער (לא סופי)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {cashForm.feeModel === 'commercial_rake' && (
                      <div className="p-3 bg-neutral-100 rounded-xl space-y-1.5 border border-neutral-200">
                        <label className="block font-semibold text-neutral-800">פירוט עמלת המארגן / רייק: *</label>
                        <input
                          type="text"
                          value={cashForm.commercialRakeDesc}
                          onChange={(e) => setCashForm({ ...cashForm, commercialRakeDesc: e.target.value })}
                          placeholder="למשל: 5% עד 40 ₪ לקופה או 30 ₪ לשעה"
                          className="w-full p-2 border rounded-lg bg-white"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-2">
                    <span className="font-semibold text-neutral-700 block">דרכי קשר לפנייה לתיאום:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={cashForm.whatsapp}
                        onChange={(e) => setCashForm({ ...cashForm, whatsapp: e.target.value })}
                        placeholder="WhatsApp (למשל: 0501234567)"
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={cashForm.telegram}
                        onChange={(e) => setCashForm({ ...cashForm, telegram: e.target.value })}
                        placeholder="Telegram (@...)"
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={cashForm.phone}
                        onChange={(e) => setCashForm({ ...cashForm, phone: e.target.value })}
                        placeholder="טלפון"
                        className="p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">תיאור ואווירת המשחק:</label>
                    <textarea
                      value={cashForm.description}
                      onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                      placeholder="שולחן חברי, כיבוד קל, רמת משחק..."
                    />
                  </div>
                </div>
              )}

              {/* ================= OPTION 3: CLUBGG / GGPOKER ================= */}
              {!editingEvent && adminEventType === 'clubgg' && (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        שם המועדון ב-ClubGG / GGPOKER: *
                      </label>
                      <input
                        type="text"
                        value={clubForm.name}
                        onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                        placeholder="למשל: Israel GG Masters"
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        מספר מועדון ClubGG ID: *
                      </label>
                      <input
                        type="text"
                        value={clubForm.clubggId}
                        onChange={(e) => setClubForm({ ...clubForm, clubggId: e.target.value })}
                        placeholder="למשל: 822466"
                        className="w-full p-2.5 rounded-xl border border-neutral-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Minimum Deposit (הפקדה מינימלית - מודגשת וחובה) */}
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                      <Coins className="w-4 h-4 text-emerald-700" />
                      <span>הפקדה מינימלית למועדון (חובה): *</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      הסכום המינימלי בשקלים או דולרים הנדרש מכל שחקן להפקדה ראשונה.
                    </p>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        value={clubForm.minDeposit}
                        onChange={(e) => setClubForm({ ...clubForm, minDeposit: e.target.value })}
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
                      <span>פרטי קשר של הסוכן (לפחות אמצעי קשר אחד חובה): *</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      פרטים אלו יוצגו לשחקנים לפנייה ישירה מול הסוכן המורשה.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          שם הסוכן / נציג המועדון:
                        </label>
                        <input
                          type="text"
                          value={clubForm.agentName}
                          onChange={(e) => setClubForm({ ...clubForm, agentName: e.target.value })}
                          placeholder="למשל: דניאל סוכן מורשה"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-700 font-semibold mb-1">
                          WhatsApp של הסוכן: *
                        </label>
                        <input
                          type="text"
                          value={clubForm.agentWhatsapp}
                          onChange={(e) => setClubForm({ ...clubForm, agentWhatsapp: e.target.value })}
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
                          value={clubForm.agentTelegram}
                          onChange={(e) => setClubForm({ ...clubForm, agentTelegram: e.target.value })}
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
                          value={clubForm.agentPhone}
                          onChange={(e) => setClubForm({ ...clubForm, agentPhone: e.target.value })}
                          placeholder="050-0000000"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      קישור הזמנה ישיר (ClubGG Invite Link):
                    </label>
                    <input
                      type="url"
                      value={clubForm.joinLink}
                      onChange={(e) => setClubForm({ ...clubForm, joinLink: e.target.value })}
                      placeholder="https://www.clubgg.net/join?club_id=..."
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">תיאור המועדון, בונוסים והטבות:</label>
                    <textarea
                      value={clubForm.description}
                      onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                      rows={2}
                      className="w-full p-2 border rounded-xl"
                      placeholder="טורנירים יומיים, רייקבק גבוה, בונוס הפקדה ראשונה..."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="py-2 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#123B32] text-white font-semibold hover:bg-[#1a4a40]"
                >
                  {editingEvent 
                    ? 'עדכן אירוע' 
                    : adminEventType === 'tournament' 
                    ? 'פרסם טורניר' 
                    : adminEventType === 'cash' 
                    ? 'פרסם משחק קאש' 
                    : 'פרסם מועדון ClubGG'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Organizer Modal */}
      {isAddingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-lg font-bold text-[#17231F]">
              הוספת מארגן או מועדון
            </h2>

            <form onSubmit={handleSaveOrg} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">שם המארגן / המועדון:</label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full p-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">סוג:</label>
                  <select
                    value={orgForm.type}
                    onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value as any })}
                    className="w-full p-2 border rounded-xl"
                  >
                    <option value="club">מועדון קבוע</option>
                    <option value="organizer">מארגן עצמאי</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">עיר:</label>
                  <input
                    type="text"
                    value={orgForm.city}
                    onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">תיאור הפעילות:</label>
                <textarea
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp (למשל: 972501234567):</label>
                  <input
                    type="text"
                    value={orgForm.whatsapp}
                    onChange={(e) => setOrgForm({ ...orgForm, whatsapp: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Telegram (כינוי או ערוץ):</label>
                  <input
                    type="text"
                    value={orgForm.telegram}
                    onChange={(e) => setOrgForm({ ...orgForm, telegram: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingOrg(false)}
                  className="py-2 px-4 rounded-xl border border-neutral-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#123B32] text-white font-semibold"
                >
                  שמור מארגן
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
