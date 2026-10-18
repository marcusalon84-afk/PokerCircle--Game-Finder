import React from 'react';
import type { User } from '../types/poker.ts';
import { UserCheck, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'tournaments' | 'cash' | 'clubs' | 'organizers' | 'admin' | 'transparency';
  onNavigate: (view: 'tournaments' | 'cash' | 'clubs' | 'organizers' | 'admin' | 'transparency') => void;
  onOpenContact: () => void;
  onOpenAuth: () => void;
  onOpenAddEvent: () => void;
  onOpenOrganizerContact?: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenContact,
  onOpenAuth,
  onOpenAddEvent,
  onOpenOrganizerContact,
  user,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#123B32] text-white border-b border-[#1b5044] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <button 
          onClick={() => onNavigate('tournaments')}
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none"
        >
          <span className="w-8 h-8 rounded-lg bg-[#D8F36A] text-[#123B32] flex items-center justify-center font-black text-lg">
            ♠
          </span>
          <span>PokerCircle</span>
        </button>

        {/* Zone 2: clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-emerald-100">
          <button
            onClick={() => onNavigate('tournaments')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'tournaments' 
                ? 'text-white border-[#D8F36A]' 
                : 'text-emerald-100/80 hover:text-white border-transparent'
            }`}
          >
            טורנירים חיים
          </button>

          <button
            onClick={() => onNavigate('cash')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
              currentView === 'cash' 
                ? 'text-white border-[#D8F36A]' 
                : 'text-emerald-100/80 hover:text-white border-transparent'
            }`}
          >
            <span>משחקי קאש</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D8F36A] text-[#123B32]">
              חברי
            </span>
          </button>

          <button
            onClick={() => onNavigate('organizers')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'organizers' 
                ? 'text-white border-[#D8F36A]' 
                : 'text-emerald-100/80 hover:text-white border-transparent'
            }`}
          >
            מארגנים ודירוגים
          </button>

          <button
            onClick={() => onNavigate('clubs')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'clubs' 
                ? 'text-white border-[#D8F36A]' 
                : 'text-emerald-100/80 hover:text-white border-transparent'
            }`}
          >
            מועדוני ClubGG
          </button>

          <button
            onClick={() => onNavigate('transparency')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'transparency' 
                ? 'text-white border-[#D8F36A]' 
                : 'text-emerald-100/80 hover:text-white border-transparent'
            }`}
          >
            שקיפות מחירים
          </button>

          <button
            onClick={onOpenContact}
            className="text-emerald-100/80 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            צור קשר
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Prominent Action Button: Add event for Admin, or Publish tournament contact for Organizers */}
          {user?.role === 'admin' ? (
            <button
              onClick={onOpenAddEvent}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#D8F36A] text-[#123B32] hover:bg-[#c8e359] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <span>+ הוסף אירוע (מנהל)</span>
            </button>
          ) : (
            <button
              onClick={onOpenOrganizerContact || onOpenContact}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#D8F36A] text-[#123B32] hover:bg-[#c8e359] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <span>פרסום טורניר למארגנים</span>
            </button>
          )}

          {user?.role === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentView === 'admin' ? 'tournaments' : 'admin')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Shield className="w-3.5 h-3.5 text-[#D8F36A]" />
                <span className="hidden sm:inline">{currentView === 'admin' ? 'חזרה לאתר' : 'פאנל ניהול'}</span>
              </button>
              <button
                onClick={onLogout}
                title="התנתק"
                className="p-1.5 text-emerald-200 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-200 hidden sm:inline-block">
                {user.displayName}
              </span>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>יציאה</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap shrink-0"
            >
              התחברות
            </button>
          )}
        </div>

      </div>

      {/* Mobile sub-bar navigation */}
      <div className="flex lg:hidden border-t border-[#1b5044] px-4 py-2.5 overflow-x-auto gap-4 text-xs font-medium">
        <button
          onClick={() => onNavigate('tournaments')}
          className={`whitespace-nowrap ${currentView === 'tournaments' ? 'text-[#D8F36A] font-bold' : 'text-emerald-100/80'}`}
        >
          טורנירים חיים
        </button>
        <button
          onClick={() => onNavigate('cash')}
          className={`whitespace-nowrap ${currentView === 'cash' ? 'text-[#D8F36A] font-bold' : 'text-emerald-100/80'}`}
        >
          משחקי קאש
        </button>
        <button
          onClick={() => onNavigate('organizers')}
          className={`whitespace-nowrap ${currentView === 'organizers' ? 'text-[#D8F36A] font-bold' : 'text-emerald-100/80'}`}
        >
          מארגנים ודירוגים
        </button>
        <button
          onClick={() => onNavigate('clubs')}
          className={`whitespace-nowrap ${currentView === 'clubs' ? 'text-[#D8F36A] font-bold' : 'text-emerald-100/80'}`}
        >
          מועדוני ClubGG
        </button>
        <button
          onClick={() => onNavigate('transparency')}
          className={`whitespace-nowrap ${currentView === 'transparency' ? 'text-[#D8F36A] font-bold' : 'text-emerald-100/80'}`}
        >
          שקיפות מחירים
        </button>
        <button
          onClick={onOpenContact}
          className="whitespace-nowrap text-emerald-100/80"
        >
          צור קשר
        </button>
      </div>
    </header>
  );
};
