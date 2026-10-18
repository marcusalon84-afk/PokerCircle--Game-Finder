/**
 * PokerCircle — Game Finder (pokercircleIL.com)
 * Discover live poker tournaments & ClubGG clubs in Israel with transparent pricing.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { TournamentEvent, Organizer, OnlineClub, FilterState, User } from './types/poker.ts';
import { api, getStoredUser, setStoredUser } from './utils/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { SearchAndFilters } from './components/SearchAndFilters.tsx';
import { TournamentCard } from './components/TournamentCard.tsx';
import { TournamentDetailsModal } from './components/TournamentDetailsModal.tsx';
import { OrganizerProfileModal } from './components/OrganizerProfileModal.tsx';
import { OnlineClubsView } from './components/OnlineClubsView.tsx';
import { OrganizersView } from './components/OrganizersView.tsx';
import { ManualAddEventModal } from './components/ManualAddEventModal.tsx';
import { SubmitReviewModal } from './components/SubmitReviewModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { OrganizerContactModal } from './components/OrganizerContactModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TransparencyGuide } from './components/TransparencyGuide.tsx';
import { AgeVerificationModal } from './components/AgeVerificationModal.tsx';
import { CashGamesView } from './components/CashGamesView.tsx';
import { Footer } from './components/Footer.tsx';
import { ExternalLink, Users, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  dateRange: 'all',
  region: 'all',
  maxTotalBuyIn: null,
  userCoords: null,
  sortBy: 'date_asc',
  useDistance: false
};

export default function App() {
  const [currentView, setCurrentView] = useState<'tournaments' | 'cash' | 'clubs' | 'organizers' | 'admin' | 'transparency'>('tournaments');
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());

  // Data states
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [clubs, setClubs] = useState<OnlineClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<string | null>(null);
  const [shareEvent, setShareEvent] = useState<TournamentEvent | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOrganizerContactOpen, setIsOrganizerContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    type: 'organizer' | 'club';
    id: string;
    name: string;
  } | null>(null);

  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Load events based on filters
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEvents(filters);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת נתונים מהשרת');
    } finally {
      setLoading(false);
    }
  };

  // Load organizers and clubs for review target selectors and event creation
  const fetchOrganizersAndClubs = async () => {
    try {
      const [orgs, clbs] = await Promise.all([
        api.getOrganizers(),
        api.getOnlineClubs()
      ]);
      setOrganizers(orgs);
      setClubs(clbs);
    } catch (err) {
      console.error('Failed to load organizers/clubs:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  useEffect(() => {
    fetchOrganizersAndClubs();
  }, []);

  // Deep-linking support: ?event=:id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (eventId) {
      api.getEventById(eventId)
        .then((res) => {
          setSelectedEvent(res.event);
        })
        .catch(() => {
          // ignore if invalid
        });
    }
  }, []);

  const handleLogout = () => {
    setStoredUser(null);
    setCurrentUser(null);
    if (currentView === 'admin') {
      setCurrentView('tournaments');
    }
  };

  const scrollToSearch = () => {
    setCurrentView('tournaments');
    setTimeout(() => {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenSubmitReview = (target?: { type: 'organizer' | 'club'; id: string; name: string }) => {
    if (target) {
      setReviewTarget(target);
    } else if (organizers.length > 0) {
      setReviewTarget({
        type: 'organizer',
        id: organizers[0].id,
        name: organizers[0].name
      });
    }
    setIsReviewModalOpen(true);
  };

  const handleEventCreated = (newEvent: TournamentEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    fetchEvents();
  };

  const handleCashGameCreated = () => {
    setCurrentView('cash');
  };

  const handleClubCreated = () => {
    api.getOnlineClubs().then(setClubs).catch(console.error);
    setCurrentView('clubs');
  };

  const handleOrganizerAdded = (newOrg: Organizer) => {
    setOrganizers((prev) => [...prev, newOrg]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F4] text-[#17231F]">
      
      {/* 18+ Age Verification Modal */}
      <AgeVerificationModal />

      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenOrganizerContact={() => setIsOrganizerContactOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddEvent={() => setIsAddEventOpen(true)}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area based on active view */}
      <main className="flex-1">
        {currentView === 'transparency' ? (
          <TransparencyGuide onBackToTournaments={() => setCurrentView('tournaments')} />
        ) : currentView === 'cash' ? (
          <CashGamesView
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : currentView === 'clubs' ? (
          <OnlineClubsView />
        ) : currentView === 'organizers' ? (
          <OrganizersView
            onOpenSubmitReview={handleOpenSubmitReview}
            onSelectOrganizer={(id) => setSelectedOrganizerId(id)}
          />
        ) : currentView === 'admin' ? (
          currentUser?.role === 'admin' ? (
            <AdminPortal currentUser={currentUser} onClose={() => setCurrentView('tournaments')} />
          ) : (
            <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">גישה מוגנת למנהלים בלבד</h2>
              <p className="text-xs text-neutral-600">
                נדרשת התחברות עם חשבון מנהל (alon.pokercircle@gmail.com) כדי לצפות במסך זה.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2 px-5 rounded-xl bg-[#123B32] text-white text-xs font-semibold"
              >
                התחבר כמנהל
              </button>
            </div>
          )
        ) : (
          /* Live Tournaments Home View */
          <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection
              onExploreClick={scrollToSearch}
              onOpenTransparency={() => setCurrentView('transparency')}
              onOpenAddEvent={() => setIsAddEventOpen(true)}
              onOpenOrganizerContact={() => setIsOrganizerContactOpen(true)}
              onNavigateOrganizers={() => setCurrentView('organizers')}
              totalTournaments={events.length}
            />

            {/* Container for Filters and List */}
            <div ref={searchSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              
              {/* Search & Filter Bar */}
              <SearchAndFilters
                filters={filters}
                onChange={(f) => setFilters(f)}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                onOpenAddEvent={() => setIsAddEventOpen(true)}
                onOpenOrganizerContact={() => setIsOrganizerContactOpen(true)}
              />

              {/* Tournaments List Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A6B65] pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#17231F]">
                    נמצאו {events.length} טורנירים פעילים
                  </span>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="text-[11px] text-neutral-400">
                    כל המחירים כוללים עמלות חובה
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentView('organizers')}
                    className="text-[#123B32] font-semibold hover:underline"
                  >
                    צפה בדירוגי המארגנים →
                  </button>

                  {currentUser?.role === 'admin' ? (
                    <button
                      onClick={() => setIsAddEventOpen(true)}
                      className="py-1.5 px-3 rounded-lg bg-[#123B32] hover:bg-[#1a4a40] text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#D8F36A]" />
                      <span>+ הוסף טורניר (מנהל)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsOrganizerContactOpen(true)}
                      className="py-1.5 px-3 rounded-lg bg-[#123B32] hover:bg-[#1a4a40] text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#D8F36A]" />
                      <span>פרסום טורניר למארגנים</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-20 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#123B32] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-neutral-500">טוען טורנירים עדכניים...</p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                  <button
                    onClick={fetchEvents}
                    className="py-1.5 px-4 rounded-lg bg-red-600 text-white text-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>נסה שוב</span>
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && events.length === 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-10 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center font-bold text-xl">
                    ♠
                  </div>
                  <h3 className="text-base font-bold text-[#17231F]">
                    לא נמצאו טורנירים בסינון הנוכחי
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    נסה להרחיב את טווח המחיר המרבי או לבחור אזור רחב יותר כדי לראות טורנירים נוספים.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="py-2 px-5 rounded-xl bg-[#123B32] text-white text-xs font-semibold hover:bg-[#1a4a40]"
                    >
                      אפס את כל המסננים
                    </button>
                    <button
                      onClick={() => setIsAddEventOpen(true)}
                      className="py-2 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                    >
                      הוסף אירוע ראשון
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Tournaments */}
              {!loading && !error && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((evt) => (
                    <TournamentCard
                      key={evt.id}
                      event={evt}
                      onSelect={(e) => setSelectedEvent(e)}
                      onOrganizerClick={(id) => setSelectedOrganizerId(id)}
                    />
                  ))}
                </div>
              )}

              {/* Secondary Promo: PokerCircle Club 822466 Early Registration */}
              <div className="mt-12 bg-gradient-to-r from-[#123B32] to-[#0A2620] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#1b5044]">
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#D8F36A] font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>מועדון הטורנירים הרשמי ב־ClubGG (מספר 822466)</span>
                  </div>
                  <h3 className="text-xl font-bold">
                    רוצה לשחק אונליין? הרשמה מוקדמת למועדון PokerCircle
                  </h3>
                  <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
                    טורנירים בלבד (ללא משחקי קאש!). פתיחת המועדון לאחר הצטברות 50 שחקנים.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setCurrentView('clubs')}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
                  >
                    למידע על המועדון
                  </button>

                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeSEcAiI-OegesZTaZr8lBF4ZgFjs6D6EVe5a2ErIxwb1n9pw/viewform?usp=dialog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-5 rounded-xl bg-[#D8F36A] hover:bg-[#c8e359] text-[#123B32] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>לטופס ההרשמה</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(v) => setCurrentView(v)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Modals */}
      <TournamentDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onOpenOrganizer={(id) => setSelectedOrganizerId(id)}
        onOpenShare={(e) => setShareEvent(e)}
        onOpenSubmitReview={handleOpenSubmitReview}
      />

      <OrganizerProfileModal
        organizerId={selectedOrganizerId}
        currentUser={currentUser}
        onClose={() => setSelectedOrganizerId(null)}
        onSelectEvent={(e) => setSelectedEvent(e)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <ShareModal
        event={shareEvent}
        onClose={() => setShareEvent(null)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <OrganizerContactModal
        isOpen={isOrganizerContactOpen}
        onClose={() => setIsOrganizerContactOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Manual Add Event Modal (ממשק ניהול להוספת אירוע ידנית) */}
      <ManualAddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        currentUser={currentUser}
        organizers={organizers}
        onEventCreated={handleEventCreated}
        onCashGameCreated={handleCashGameCreated}
        onClubCreated={handleClubCreated}
        onOrganizerAdded={handleOrganizerAdded}
        onAdminAuthenticated={(adminUser) => setCurrentUser(adminUser)}
      />

      {/* Submit Review Modal (מערכת הגשת ביקורות ודירוגי שחקנים) */}
      <SubmitReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        target={reviewTarget}
        organizers={organizers}
        clubs={clubs}
        currentUser={currentUser}
        onReviewSubmitted={() => {
          fetchOrganizersAndClubs();
          fetchEvents();
        }}
      />

    </div>
  );
}
