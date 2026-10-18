import React, { useState } from 'react';
import { api } from '../utils/api.ts';
import { X, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'advertising' | 'general'>('advertising');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.sendContact({
        type,
        name,
        email,
        message
      });

      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'שגיאה בשליחת הפנייה לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        
        {/* Header */}
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#D8F36A]" />
            <h2 id="contact-modal-title" className="text-lg font-bold">
              יצירת קשר עם PokerCircle
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

        {/* Form Body */}
        <div className="p-6">
          {successMsg ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-[#17231F]">
                הפנייה נשמרה בהצלחה במערכת
              </h3>
              <p className="text-xs text-[#5A6B65] max-w-sm mx-auto leading-relaxed">
                {successMsg}
              </p>
              <button
                onClick={onClose}
                className="mt-4 py-2 px-6 rounded-xl bg-[#123B32] text-white text-xs font-semibold"
              >
                סגור
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Inquiry Type */}
              <div>
                <label className="block text-neutral-600 font-semibold mb-1.5">
                  סוג הפנייה:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('advertising')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      type === 'advertising'
                        ? 'border-[#123B32] bg-[#123B32] text-white'
                        : 'border-neutral-200 bg-[#F7F8F4] text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    מעוניין לפרסם טורניר / מועדון
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('general')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      type === 'general'
                        ? 'border-[#123B32] bg-[#123B32] text-white'
                        : 'border-neutral-200 bg-[#F7F8F4] text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    פנייה כללית / שאלות
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  שם מלא:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  כתובת דוא״ל לחזרה:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  תוכן הפנייה:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="פרט את המועדון, העיר, מבנה הטורניר או כל שאלה שיש לך..."
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#123B32]"
                  required
                />
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-[11px] text-neutral-500 leading-normal">
                כתובת יעד: <strong>alon.pokercircle@gmail.com</strong>. שליחת הטופס שומרת את הפנייה במסד הנתונים ופותחת את תוכנת הדוא״ל להשלמת שליחה.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-5 rounded-xl bg-[#123B32] hover:bg-[#1a4a40] text-white font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'שולח...' : 'שליחת פנייה'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
