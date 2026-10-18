import React, { useState, useEffect } from 'react';
import type { CashGame, GroupFormation, User } from '../types/poker.ts';
import { isFriendlyNoRakeGame } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { CashGameDetailsModal } from './CashGameDetailsModal.tsx';
import { SubmitGroupFormationModal } from './SubmitGroupFormationModal.tsx';
import { 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Coffee, 
  PlusCircle, 
  Search, 
  Filter, 
  MessageCircle, 
  Send, 
  PhoneCall, 
  Check, 
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface CashGamesViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const CashGamesView: React.FC<CashGamesViewProps> = ({ currentUser, onOpenAuth }) => {
  // Sub-tabs: 'upcoming' (משחקים קרובים) or 'groups' (גיבוש קבוצות)
  const [subTab, setSubTab] = useState<'upcoming' | 'groups'>('upcoming');

  // Data states
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [groupFormations, setGroupFormations] = useState<GroupFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [regionFilter, setRegionFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'no_fee' | 'shared_expenses' | 'commercial_rake'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedCashGame, setSelectedCashGame] = useState<CashGame | null>(null);
  const [isSubmitGroupOpen, setIsSubmitGroupOpen] = useState(false);

  // Success toast for coordinator updates
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [games, groups] = await Promise.all([
        api.getCashGames({
          region: regionFilter !== 'all' ? regionFilter : undefined,
          feeModel: feeFilter !== 'all' ? feeFilter : undefined,
          search: searchQuery.trim() || undefined
        }),
        api.getGroupFormations({
          region: regionFilter !== 'all' ? regionFilter : undefined,
          feeModel: (feeFilter === 'no_fee' || feeFilter === 'shared_expenses') ? feeFilter : undefined,
          search: searchQuery.trim() || undefined
        })
      ]);
      setCashGames(games);
      setGroupFormations(groups);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת משחקי קאש וקבוצות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionFilter, feeFilter, searchQuery]);

  // Deep-linking query support: ?cash=:id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cashId = params.get('cash');
    if (cashId) {
      api.getCashGameById(cashId)
        .then((g) => setSelectedCashGame(g))
        .catch(() => {});
    }
  }, []);

  const handleOpenSubmitGroup = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setIsSubmitGroupOpen(true);
  };

  const handleGroupSubmitted = (newGroup: GroupFormation) => {
    fetchData();
    setActionNotice('פרסום גיבוש הקבוצה נקלט בהצלחה וממתין לאישור מנהל');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Coordinator player count adjustment
  const handleUpdatePlayers = async (group: GroupFormation, delta: number) => {
    const newCount = group.currentPlayers + delta;
    if (newCount < 1 || newCount > group.targetPlayers) return;

    try {
      await api.updateGroupPlayers(group.id, newCount);
      setGroupFormations((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, currentPlayers: newCount, updatedAt: new Date().toISOString() } : g))
      );
      setActionNotice(`מספר השחקנים עודכן ל-${newCount} מתוך ${group.targetPlayers}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון מספר שחקנים');
    }
  };

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return 'עודכן לאחרונה';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return 'עודכן לפני פחות משעה';
      if (diffHours < 24) return `עודכן לפני ${diffHours} שעות`;
      const diffDays = Math.floor(diffHours / 24);
      return `עודכן לפני ${diffDays} ימים`;
    } catch {
      return 'עודכן לאחרונה';
    }
  };

  return (
    <div className="space-y-8 pb-16" dir="rtl">
      
      {/* Top Banner / Hero for Cash Tab */}
      <div className="bg-[#123B32] text-white pt-8 pb-10 border-b border-[#1b5044]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-[#D8F36A] text-[#123B32] flex items-center justify-center font-bold text-xs">
                  ♠
                </span>
                <span className="text-xs font-semibold text-[#D8F36A] tracking-wider uppercase">
                  Cash Games Hub · PokerCircle
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                משחקי קאש וגיבוש קבוצות
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                משחקים חבריים ללא עמלת מארגן, השתתפות שקופה בהוצאות משותפות, והשלמת שחקנים חסרים לשולחנות ביתיים בישראל.
              </p>
            </div>

            {/* Quick Action: Group Formation Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenSubmitGroup}
                className="py-3 px-5 rounded-2xl bg-[#D8F36A] hover:bg-[#cbf04e] text-[#123B32] font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-[#123B32]" />
                <span>מחפשים שחקנים? גבשו קבוצה</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs Switcher (Spec Section 1) */}
          <div className="mt-8 flex items-center gap-2 p-1.5 rounded-2xl bg-black/20 w-fit backdrop-blur-xs border border-white/10">
            <button
              onClick={() => setSubTab('upcoming')}
              className={`py-2 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                subTab === 'upcoming'
                  ? 'bg-white text-[#123B32] shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>משחקים קרובים</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                subTab === 'upcoming' ? 'bg-[#123B32]/10 text-[#123B32]' : 'bg-white/10 text-emerald-200'
              }`}>
                {cashGames.length}
              </span>
            </button>

            <button
              onClick={() => setSubTab('groups')}
              className={`py-2 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                subTab === 'groups'
                  ? 'bg-white text-[#123B32] shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>גיבוש קבוצות</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                subTab === 'groups' ? 'bg-[#123B32]/10 text-[#123B32]' : 'bg-white/10 text-emerald-200'
              }`}>
                {groupFormations.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Action toast */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Informational Guidance Notice based on Active Sub-Tab */}
        {subTab === 'groups' ? (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">חשוב לדעת לגבי פרסומי גיבוש קבוצות:</span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                פרסומי גיבוש קבוצה נועדו לסייע לשחקנים להשלים שולחן חברי. אינם מהווים אירוע מאושר עם מקום מובטח — ההשתתפות נקבעת ישירות מול מרכז הקבוצה.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">שקיפות מודל הגבייה במשחקי קאש:</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                משחקים ללא עמלת מארגן (0 רייק, 0 דמי אירוח, 0 תשלום לפי זמן) מסומנים בתג ירוק בולט. סכום הכניסה לשולחן מופרד ומוצג בשקיפות מלאה.
              </p>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={subTab === 'upcoming' ? 'חפש לפי עיר, שם המשחק או בליינדים...' : 'חפש לפי עיר, כינוי מרכז הקבוצה או בליינדים...'}
                className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-[#F7F8F4]"
              />
            </div>

            {/* Region Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="text-xs py-2.5 px-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-[#F7F8F4]"
              >
                <option value="all">כל האזורים</option>
                <option value="מרכז">אזור המרכז</option>
                <option value="תל אביב">תל אביב</option>
                <option value="שרון">אזור השרון</option>
                <option value="שפלה">שפלה</option>
                <option value="ירושלים">ירושלים</option>
                <option value="צפון">צפון</option>
                <option value="דרום">דרום</option>
              </select>

              {/* Fee Model Filter */}
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value as any)}
                className="text-xs py-2.5 px-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#123B32] bg-[#F7F8F4]"
              >
                <option value="all">כל מודלי הגבייה</option>
                <option value="no_fee">משחק חברי · ללא עמלת מארגן</option>
                <option value="shared_expenses">משחק חברי · השתתפות בהוצאות</option>
                {subTab === 'upcoming' && (
                  <option value="commercial_rake">משחק מסחרי · עם עמלות/רייק</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-[#123B32] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-500">טוען נתונים...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
            <p className="text-xs text-red-700 font-bold">{error}</p>
            <button
              onClick={fetchData}
              className="py-1.5 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold"
            >
              נסה שוב
            </button>
          </div>
        )}

        {/* VIEW 1: UPCOMING CASH GAMES */}
        {!loading && !error && subTab === 'upcoming' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#5A6B65]">
              <span className="font-bold text-[#17231F]">
                נמצאו {cashGames.length} משחקי קאש קרובים
              </span>
              <span className="text-[11px] text-neutral-400">
                פרטים מלאים ושקיפות במודל הגבייה
              </span>
            </div>

            {cashGames.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center font-bold text-xl">
                  ♠
                </div>
                <h3 className="text-base font-bold text-[#17231F]">
                  לא נמצאו משחקי קאש בסינון הנוכחי
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  נסו לבחור אזור רחב יותר או לעבור ללשונית גיבוש קבוצות כדי להצטרף לשחקנים שמחפשים להשלים שולחן.
                </p>
                <button
                  onClick={() => {
                    setRegionFilter('all');
                    setFeeFilter('all');
                    setSearchQuery('');
                  }}
                  className="py-2 px-5 rounded-xl bg-[#123B32] text-white text-xs font-semibold"
                >
                  אפס מסננים
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cashGames.map((game) => {
                  const isNoRake = isFriendlyNoRakeGame(game);
                  const isShared = game.feeModel === 'shared_expenses';

                  return (
                    <div
                      key={game.id}
                      className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-5 space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {isNoRake ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-700 text-white shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              משחק חברי · ללא עמלת מארגן
                            </span>
                          ) : isShared ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-600 text-white shadow-2xs">
                              <Coffee className="w-3.5 h-3.5" />
                              משחק חברי · השתתפות בהוצאות
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700">
                              קאש מסחרי · רייק שקוף
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {game.blinds}
                          </span>
                        </div>

                        {/* Title & Location */}
                        <div>
                          <h3 className="text-base font-bold text-[#17231F] leading-snug">
                            {game.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5A6B65]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                              {game.city} ({game.region})
                            </span>
                            <span>·</span>
                            <span>{game.gameType}</span>
                          </div>
                        </div>

                        {/* Timing */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>
                            {new Date(game.startDateTime).toLocaleDateString('he-IL', {
                              weekday: 'short',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Fee Model Info Snippet */}
                        {isNoRake && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 text-[11px] text-emerald-900 font-medium">
                            לפי הצהרת המפרסם. סכום הכניסה לשולחן מוצג בנפרד.
                          </div>
                        )}

                        {isShared && game.sharedExpensesDetails && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 text-[11px] text-amber-900 font-medium">
                            השתתפות: {game.sharedExpensesDetails.forWhat} (
                            {game.sharedExpensesDetails.amountPerPerson !== null && game.sharedExpensesDetails.amountPerPerson !== undefined
                              ? `${game.sharedExpensesDetails.amountPerPerson} ש״ח ${game.sharedExpensesDetails.isEstimated ? 'משוער' : 'סופי'}`
                              : (game.sharedExpensesDetails.calculationMethod || 'חלוקה שווה')}
                            )
                          </div>
                        )}

                        {/* Buy-in and seats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">טווח כניסה (Buy-In)</span>
                            <span className="font-bold text-[#17231F]">{game.minBuyIn} - {game.maxBuyIn} ₪</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block">מקומות</span>
                            <span className="font-bold text-emerald-700">
                              {game.availableSeats ? `${game.availableSeats} פנויים` : 'בתיאום'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <div className="pt-3 border-t border-neutral-100">
                        <button
                          onClick={() => setSelectedCashGame(game)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>לפרטים מלאים ויצירת קשר</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: GROUP FORMATIONS (גיבוש קבוצות - Spec Sections 4, 5, 6, 7) */}
        {!loading && !error && subTab === 'groups' && (
          <div className="space-y-4">
            
            {/* Header with Call-to-action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A6B65] pb-1">
              <div>
                <span className="font-bold text-sm text-[#17231F]">
                  נמצאו {groupFormations.length} קבוצות המגבשות משחק חברי
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">
                  המספרים מתעדכנים ישירות על ידי מרכז הקבוצה. פנייה מתבצעת ישירות ללא הרשמה לשולחן באתר.
                </span>
              </div>

              <button
                onClick={handleOpenSubmitGroup}
                className="py-2 px-4 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition-colors shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D8F36A]" />
                <span>+ גבשו קבוצה משלכם</span>
              </button>
            </div>

            {groupFormations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center font-bold text-xl">
                  👥
                </div>
                <h3 className="text-base font-bold text-[#17231F]">
                  לא נמצאו קבוצות בסינון הנוכחי
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  היו הראשונים לפתוח פרסום גיבוש קבוצה באזורכם והזמינו שחקנים נוספים להשלים שולחן חברי!
                </p>
                <button
                  onClick={handleOpenSubmitGroup}
                  className="py-2 px-5 rounded-xl bg-[#123B32] text-white text-xs font-semibold"
                >
                  פרסם גיבוש קבוצה
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupFormations.map((group) => {
                  const missing = Math.max(0, group.targetPlayers - group.currentPlayers);
                  const isNoRake = group.feeModel === 'no_fee';

                  // WhatsApp pre-filled message (Spec Section 7)
                  const messageText = `היי, ראיתי ב־PokerCircle שאתם מגבשים קבוצה למשחק חברי. אשמח לשמוע פרטים ולהצטרף אם מתאים.`;
                  const waUrl = group.whatsapp
                    ? `https://wa.me/${group.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`
                    : null;
                  const tgUrl = group.telegram
                    ? `https://t.me/${group.telegram.replace('@', '')}`
                    : null;
                  const phoneUrl = group.phone ? `tel:${group.phone}` : null;

                  const isCoordinatorOrAdmin = currentUser?.displayName === group.coordinatorNickname || currentUser?.role === 'admin';

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-5 space-y-4"
                    >
                      <div className="space-y-3.5">
                        
                        {/* Top Badges (Spec Section 6) */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#123B32] text-white">
                              גיבוש קבוצה
                            </span>
                            {isNoRake ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                ללא עמלת מארגן
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800">
                                <Coffee className="w-3 h-3 text-amber-700" />
                                השתתפות בהוצאות
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-neutral-400 font-medium">
                            מרכז: {group.coordinatorNickname}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base font-black text-[#17231F] leading-snug">
                            {group.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-[#5A6B65]">
                            <span className="flex items-center gap-1 font-semibold text-neutral-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                              {group.city} ({group.region})
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              {group.scheduleDate}
                            </span>
                          </div>
                        </div>

                        {/* Game Type & Level */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                            {group.gameType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                            רמה: {group.experienceLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                            בליינדים: {group.plannedBlinds}
                          </span>
                        </div>

                        {/* Player Count Visualizer (Spec Section 5) */}
                        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#17231F]">
                              {group.currentPlayers} מתוך {group.targetPlayers} שחקנים · <span className="text-emerald-700">מחפשים עוד {missing}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {formatLastUpdated(group.updatedAt || group.createdAt)}
                            </span>
                          </div>

                          {/* 6 Icons: filled vs outline */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {Array.from({ length: group.targetPlayers }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                  i < group.currentPlayers
                                    ? 'bg-[#123B32] text-white shadow-2xs'
                                    : 'border-2 border-dashed border-[#123B32]/30 text-[#123B32]/40 bg-white'
                                }`}
                                title={i < group.currentPlayers ? 'שחקן קיים' : 'שחקן חסר'}
                              >
                                {i + 1}
                              </div>
                            ))}

                            {/* Inline quick update buttons for coordinator / admin */}
                            {isCoordinatorOrAdmin && (
                              <div className="mr-auto flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePlayers(group, -1)}
                                  disabled={group.currentPlayers <= 1}
                                  title="הפחת שחקן קיים"
                                  className="w-5 h-5 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-bold flex items-center justify-center disabled:opacity-30"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePlayers(group, 1)}
                                  disabled={group.currentPlayers >= group.targetPlayers}
                                  title="הוסף שחקן קיים שאישר"
                                  className="w-5 h-5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Venue & Buy-in info */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                            <span className="text-[10px] text-neutral-400 block">טווח כניסה לשולחן</span>
                            <span className="font-bold text-[#17231F]">{group.buyInLimits}</span>
                          </div>
                          <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                            <span className="text-[10px] text-neutral-400 block">מצב מקום</span>
                            <span className="font-bold text-[#17231F]">{group.venue}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#2F3E38] leading-relaxed line-clamp-3">
                          {group.description}
                        </p>

                        {/* Shared expenses details if present */}
                        {!isNoRake && group.sharedExpensesDetails && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 space-y-0.5">
                            <span className="font-bold block">השתתפות בהוצאות: {group.sharedExpensesDetails.forWhat}</span>
                            <span>
                              סכום: {group.sharedExpensesDetails.amountPerPerson !== null && group.sharedExpensesDetails.amountPerPerson !== undefined
                                ? `${group.sharedExpensesDetails.amountPerPerson} ש״ח ${group.sharedExpensesDetails.isEstimated ? '(משוער)' : '(סופי)'}`
                                : (group.sharedExpensesDetails.calculationMethod || 'חלוקה שווה')}
                              {' · '}{group.sharedExpensesDetails.isMandatory ? 'חובה' : 'רשות'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contact & Action Section (Spec Sections 6, 7) */}
                      <div className="pt-3 border-t border-neutral-100 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>מעוניין להצטרף</span>
                            </a>
                          )}

                          {tgUrl && (
                            <a
                              href={tgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>טלגרם</span>
                            </a>
                          )}

                          {phoneUrl && (
                            <a
                              href={phoneUrl}
                              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>טלפון</span>
                            </a>
                          )}
                        </div>

                        {/* Mandatory Spec Notice (Section 7) */}
                        <p className="text-[10px] text-neutral-400 text-center leading-tight">
                          הפנייה אינה אישור הצטרפות. ההשתתפות נקבעת מול מרכז הקבוצה.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cash Game Details Modal */}
      {selectedCashGame && (
        <CashGameDetailsModal
          game={selectedCashGame}
          onClose={() => setSelectedCashGame(null)}
        />
      )}

      {/* Submit Group Formation Modal */}
      {isSubmitGroupOpen && (
        <SubmitGroupFormationModal
          isOpen={isSubmitGroupOpen}
          onClose={() => setIsSubmitGroupOpen(false)}
          currentUser={currentUser}
          onSuccess={handleGroupSubmitted}
        />
      )}
    </div>
  );
};
