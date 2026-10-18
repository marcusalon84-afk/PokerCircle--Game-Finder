import React, { useState } from 'react';
import type { TournamentEvent } from '../types/poker.ts';
import { api } from '../utils/api.ts';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Instagram, 
  Facebook, 
  Smartphone 
} from 'lucide-react';

interface ShareModalProps {
  event: TournamentEvent | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [instaNotice, setInstaNotice] = useState(false);

  if (!event) return null;

  const url = `${window.location.origin}?event=${event.id}`;
  const title = `טורניר פוקר: ${event.title} (${event.city}) - PokerCircle`;
  const text = `מצאתי טורניר ב-PokerCircle: ${event.title} ב${event.city}. סך הכל כניסה: ${event.totalBuyIn} ₪ (${event.prizePoolAmount} ₪ לפרסים + ${event.houseFeeAmount} ₪ עמלה). כנס לפרטים:`;

  const logShare = (channel: string) => {
    api.logInteraction({
      actionType: 'share_click',
      targetType: 'event',
      targetId: event.id,
      channel
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    logShare('copy_link');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    logShare('native_share');
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    logShare('whatsapp');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
  };

  const handleTelegram = () => {
    logShare('telegram');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleFacebook = () => {
    logShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleInstagram = () => {
    logShare('instagram');
    navigator.clipboard.writeText(url);
    setInstaNotice(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        <div className="bg-[#123B32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D8F36A]" />
            <h2 id="share-modal-title" className="text-base font-bold">
              שיתוף טורניר
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

        <div className="p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#17231F] mb-1">
              {event.title}
            </h3>
            <p className="text-neutral-500">
              {event.city} · סך הכל: {event.totalBuyIn} ₪ ({event.prizePoolAmount} ₪ לפרסים)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleWhatsApp}
              className="p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#123B32] font-semibold flex items-center justify-center gap-2 transition-colors border border-[#25D366]/30"
            >
              <Send className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleTelegram}
              className="p-3 rounded-xl bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 text-[#123B32] font-semibold flex items-center justify-center gap-2 transition-colors border border-[#2AABEE]/30"
            >
              <span>Telegram</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-neutral-600" />
              <span>שלח לחבר בנייד</span>
            </button>

            <button
              onClick={handleFacebook}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold flex items-center justify-center gap-2 transition-colors border border-blue-200"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>Facebook</span>
            </button>

            <button
              onClick={handleInstagram}
              className="p-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 font-semibold flex items-center justify-center gap-2 transition-colors border border-pink-200 col-span-2"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Instagram (העתקת קישור ושיתוף בסטורי/הודעה)</span>
            </button>
          </div>

          {instaNotice && (
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 text-pink-950 text-[11px] leading-relaxed">
              הקישור הועתק ללוח! פתח את אפליקציית Instagram והדבק את הקישור במדבקת קישור (Link Sticker) בסטורי או בהודעה פרטית לחברים.
            </div>
          )}

          {/* Direct link box */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              קישור ישיר לאירוע:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full p-2 bg-[#F7F8F4] border rounded-lg text-[11px] font-mono text-neutral-600"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-[#123B32] text-white hover:bg-[#1a4a40] transition-colors shrink-0"
                title="העתק"
              >
                {copied ? <Check className="w-4 h-4 text-[#D8F36A]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                הקישור הועתק בהצלחה!
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
