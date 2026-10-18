import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const AGE_VERIFICATION_KEY = 'pokercircle_age_verified_v1';

export const AgeVerificationModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(AGE_VERIFICATION_KEY, 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123B32]/70 backdrop-blur-sm">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-dialog-title"
        className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-neutral-200 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#123B32]/5 flex items-center justify-center text-[#123B32]">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 id="age-dialog-title" className="text-2xl font-bold text-[#17231F] mb-3">
          ברוכים הבאים ל-PokerCircle
        </h2>

        <p className="text-sm text-[#5A6B65] leading-relaxed mb-6">
          אתר זה מציג מידע ולוח טורנירי פוקר חיים ומועדוני אונליין. השימוש באתר וההשתתפות במשחקים מיועדים לבגירים <strong>מגיל 18 ומעלה בלבד</strong>.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 px-6 rounded-xl bg-[#123B32] text-white font-medium text-base hover:bg-[#1a4a40] transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123B32]"
          >
            אני מעל גיל 18 — כניסה לאתר
          </button>

          <button
            onClick={handleDecline}
            className="w-full py-2.5 px-6 rounded-xl text-xs text-[#5A6B65] hover:text-[#17231F] transition-colors"
          >
            אינני בן 18 (יציאה)
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 mt-5">
          * הצהרת משתמש זו אינה תחליף לבדיקת תעודת זהות בכניסה לאירועים חיים ע״י המארגנים.
        </p>
      </div>
    </div>
  );
};
