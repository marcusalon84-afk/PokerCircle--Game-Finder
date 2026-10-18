import React, { useState, useEffect } from 'react';
import type { OnlineClub } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { 
  Smartphone, 
  ExternalLink, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Copy, 
  Check, 
  Clock,
  MessageCircle,
  Send,
  PhoneCall
} from 'lucide-react';

export const OnlineClubsView: React.FC = () => {
  const [clubs, setClubs] = useState<OnlineClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.getOnlineClubs()
      .then((res) => {
        setClubs(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load clubs:', err);
        setLoading(false);
      });
  }, []);

  const handleCopyClubId = (clubId: string) => {
    navigator.clipboard.writeText(clubId);
    setCopiedId(clubId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClubAction = (action: string, targetId: string) => {
    api.logInteraction({
      actionType: action,
      targetType: 'club',
      targetId,
      channel: 'web'
    });
  };

  const pokerCircleClub = clubs.find((c) => c.isPokerCircleClub);
  const otherClubs = clubs.filter((c) => !c.isPokerCircleClub);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Category header - completely separated from live tournaments */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full mb-3">
          <Smartphone className="w-3.5 h-3.5" />
          <span>אפליקציית ClubGG הרשמית</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17231F] mb-3">
          מועדוני אונליין ב־ClubGG
        </h1>
        <p className="text-sm text-[#5A6B65] leading-relaxed">
          מתחם נפרד למועדוני טורנירים באפליקציית ClubGG. כל מועדון מציע טורנירים בלבד, בהתאם לכללי המערכת.
        </p>
      </div>

      {/* Flagship Section: PokerCircle Club 822466 */}
      <div className="bg-gradient-to-br from-[#123B32] to-[#0A2620] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-[#1b5044]">
        
        {/* Subtle decorative circles */}
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-[#D8F36A]/10 blur-2xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D8F36A]">
              <Sparkles className="w-4 h-4" />
              <span>מועדון הבית הרשמי — בבעלות PokerCircle</span>
              <span aria-hidden="true">·</span>
              <span>הרשמה מוקדמת</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              מועדון PokerCircle ב־ClubGG
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                <span className="text-xs text-emerald-200">מספר מועדון ClubGG:</span>
                <span className="text-xl font-black font-mono tracking-widest text-[#D8F36A]">
                  822466
                </span>
                <button
                  onClick={() => handleCopyClubId('822466')}
                  className="p-1 rounded hover:bg-white/10 transition-colors text-white"
                  title="העתק מספר מועדון"
                >
                  {copiedId === '822466' ? <Check className="w-4 h-4 text-[#D8F36A]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-100 flex items-center gap-1.5 border border-white/10">
                <Users className="w-4 h-4 text-[#D8F36A]" />
                <span>יעד השקה: 50 נרשמים</span>
              </div>
            </div>

            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              המועדון הוקם לקראת פעילות טורנירים בלבד (ללא משחקי קאש!). ההשקה הרשמית של הטורנירים תתקיים עם הגעה ל-50 מתעניינים רשומים.
            </p>

            {/* Principles of the club */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-emerald-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#D8F36A] shrink-0" />
                <span>טורנירים תחרותיים בלבד (No Cash Games)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D8F36A] shrink-0" />
                <span>פרסים למימוש במועדוני פוקר מוכרים וחוקיים בלבד</span>
              </div>
            </div>

            {/* CTA to Google Form */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeSEcAiI-OegesZTaZr8lBF4ZgFjs6D6EVe5a2ErIxwb1n9pw/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClubAction('prereg_form_click', 'club_pokercircle_official')}
                className="py-3 px-6 rounded-xl bg-[#D8F36A] text-[#123B32] font-extrabold text-sm hover:bg-[#c8e359] transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <span>לטופס ההרשמה המוקדמת</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <span className="text-xs text-emerald-200/70">
                * הטופס החיצוני מבקש שם משתמש ב-ClubGG, דוא״ל ומספר נייד.
              </span>
            </div>

          </div>

          <div className="lg:col-span-4 bg-white/5 rounded-2xl p-6 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D8F36A]/20 text-[#D8F36A] mx-auto flex items-center justify-center font-black text-2xl">
              ♠
            </div>
            <h3 className="text-base font-bold text-white">
              איך מצטרפים?
            </h3>
            <ol className="text-right text-xs text-emerald-100/80 space-y-2 list-decimal list-inside pr-1">
              <li>מורידים את אפליקציית ClubGG.</li>
              <li>מחפשים את מועדון <strong>822466</strong> ומגישים בקשת הצטרפות.</li>
              <li>ממלאים את טופס ההרשמה המוקדמת של PokerCircle.</li>
              <li>מקבלים עדכון ישיר לקראת טורניר הפתיחה.</li>
            </ol>
          </div>

        </div>

      </div>

      {/* External Verified Clubs on ClubGG */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#17231F]">
              מועדוני ClubGG נוספים בישראל
            </h2>
            <p className="text-xs text-[#5A6B65]">
              מועדונים בניהול מארגנים עצמאיים. פרסום תקף ל-7 ימים.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-neutral-500">
            טוען מועדוני אונליין...
          </div>
        ) : otherClubs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
            אין כרגע מועדונים חיצוניים נוספים בתקופת פרסום פעילה.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {otherClubs.map((club) => (
              <div 
                key={club.id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#5A6B65] mb-2 font-medium">
                    <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <Smartphone className="w-3.5 h-3.5" />
                      ClubGG
                    </span>
                    {club.publicationExpiresAt && (
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        פרסום שבועי פעיל
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#17231F] mb-1.5">
                    {club.name}
                  </h3>

                  <div className="inline-flex items-center gap-2 bg-[#F7F8F4] px-3 py-1 rounded-lg border border-neutral-200 mb-3 text-xs">
                    <span className="text-neutral-500">מספר מועדון:</span>
                    <span className="font-mono font-bold text-[#123B32]">{club.clubggId}</span>
                    <button
                      onClick={() => handleCopyClubId(club.clubggId)}
                      className="text-neutral-400 hover:text-neutral-700"
                      title="העתק"
                    >
                      {copiedId === club.clubggId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {club.description}
                  </p>

                  {/* Minimum Deposit & Agent Details */}
                  <div className="space-y-3 mb-5 p-3.5 bg-[#F7F8F4] rounded-xl border border-neutral-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">הפקדה מינימלית:</span>
                      <span className="font-bold text-[#123B32]">
                        {club.minDeposit ? (typeof club.minDeposit === 'number' ? `${club.minDeposit} ₪` : club.minDeposit) : '100 ₪'}
                      </span>
                    </div>

                    {(club.agentName || club.agentWhatsapp || club.agentTelegram || club.agentPhone) && (
                      <div className="pt-2 border-t border-neutral-200/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-neutral-600">
                          <span className="font-semibold">סוכן המועדון:</span>
                          <span className="text-neutral-900 font-medium">{club.agentName || 'סוכן מורשה'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {club.agentWhatsapp && (
                            <a
                              href={`https://wa.me/${club.agentWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`היי, ראיתי את מועדון ${club.name} (ClubGG ${club.clubggId}) ב-PokerCircle ואשמח לפרטי הפקדה והצטרפות`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleClubAction('agent_whatsapp_click', club.id)}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>וואטסאפ סוכן</span>
                            </a>
                          )}
                          {club.agentTelegram && (
                            <a
                              href={club.agentTelegram.startsWith('http') ? club.agentTelegram : `https://t.me/${club.agentTelegram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleClubAction('agent_telegram_click', club.id)}
                              className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>טלגרם סוכן</span>
                            </a>
                          )}
                          {club.agentPhone && (
                            <a
                              href={`tel:${club.agentPhone}`}
                              onClick={() => handleClubAction('agent_phone_click', club.id)}
                              className="py-1 px-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{club.agentPhone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {club.isDemo ? 'מועדון להדגמה' : 'מארגן מאומת'}
                  </span>

                  <a
                    href={club.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClubAction('join_club_click', club.id)}
                    className="py-2 px-4 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>הצטרפות מול המארגן</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
