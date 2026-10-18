import React, { useState } from 'react';
import type { User } from '../types/poker.ts';
import { api, setStoredUser } from '../utils/api.ts';
import { X, Lock, Mail, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        const res = await api.register(email, displayName, password);
        setStoredUser(res.user, res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        setStoredUser(res.user, res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה באימות פרטים');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAdmin = () => {
    setIsRegister(false);
    setEmail('alon.pokercircle@gmail.com');
    setPassword('AdminPassword123!');
  };

  const fillQuickPlayer = () => {
    setIsRegister(false);
    setEmail('player@pokercircle.co.il');
    setPassword('Player123!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#D8F36A]" />
            <h2 id="auth-modal-title" className="text-base font-bold">
              {isRegister ? 'הרשמה לחשבון שחקן' : 'התחברות למערכת'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">
                  כינוי לתצוגה (שם פרטי / כינוי שחקן):
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="למשל: דניאל כ."
                    className="w-full pr-9 pl-3 py-2 border rounded-xl focus:outline-none focus:border-[#123B32]"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-neutral-600 mb-1">
                דואר אלקטרוני:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pr-9 pl-3 py-2 border rounded-xl focus:outline-none focus:border-[#123B32]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-600 mb-1">
                סיסמה:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2 border rounded-xl focus:outline-none focus:border-[#123B32]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'מאמת פרטים...' : isRegister ? 'צור חשבון' : 'התחבר'}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="p-3 bg-[#F7F8F4] rounded-xl border border-neutral-200/80 space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 block">
              בדיקת מערכת והרשאות (גישה מהירה):
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillQuickAdmin}
                className="flex-1 py-1 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold text-[11px] transition-colors"
              >
                כניסה כמנהל (Alon Admin)
              </button>
              <button
                type="button"
                onClick={fillQuickPlayer}
                className="flex-1 py-1 px-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium text-[11px] transition-colors"
              >
                כניסה כשחקן רשום
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#123B32] font-semibold underline hover:text-emerald-800"
            >
              {isRegister ? 'כבר יש לך חשבון? התחבר כאן' : 'אין לך חשבון עדיין? הירשם כאן'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
