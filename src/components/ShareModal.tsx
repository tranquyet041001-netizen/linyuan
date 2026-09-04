import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Download, 
  ExternalLink, 
  Globe,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';
import { BirthdayData } from '../types/birthday';
import { generateUniversalShareUrl } from '../utils/shareEncoder';

interface ShareModalProps {
  birthday: BirthdayData;
  isOpen: boolean;
  onClose: () => void;
  onContinueEditing?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  birthday,
  isOpen,
  onClose,
  onContinueEditing,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const universalUrl = generateUniversalShareUrl(birthday);

  // Generate QR as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(universalUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#080c18',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error', err));
    }
  }, [isOpen, universalUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(universalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `A Birthday Surprise 🌸 — ${birthday.name}`,
        text: `I created a special Japanese Sakura birthday surprise for you! 🌸`,
        url: universalUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `sakura-birthday-${birthday.slug}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-pink-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-zinc-100 animate-in fade-in zoom-in-95 duration-200 relative my-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30 mb-2">
            🌸
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {birthday.status === 'published' ? 'Birthday Surprise is Ready! 🎉' : 'Birthday Saved! 💾'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            Chia sẻ link hoặc quét mã QR để mở trang sinh nhật của <strong className="text-pink-300">{birthday.name}</strong>.
          </p>
        </div>

        {/* Share Link Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Universal Link (mọi thiết bị)</span>
            </span>
            <span className="text-zinc-500 font-mono">/{birthday.slug}</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-inner">
            <Globe className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span className="text-xs font-mono text-zinc-200 truncate select-all flex-1">
              {universalUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-pink-600/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code — Always visible */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-pink-500/20 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-300">
            <Smartphone className="w-4 h-4" />
            <span>Quét QR bằng camera điện thoại để mở ngay</span>
          </div>

          {qrDataUrl ? (
            <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img src={qrDataUrl} alt="Birthday QR Code" className="w-full h-full rounded-xl" />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-zinc-600 animate-pulse" />
            </div>
          )}

          <p className="text-[11px] font-mono text-zinc-500">
            Dành cho: {birthday.name}
          </p>

          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="mx-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Download className="w-3.5 h-3.5 text-pink-400" />
            <span>Tải ảnh QR (PNG)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ 🎁</span>
          </button>

          <a
            href={universalUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-zinc-700"
          >
            <span>Xem thử</span>
            <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
          </a>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800">
          <button
            onClick={() => {
              if (onContinueEditing) onContinueEditing();
              onClose();
            }}
            className="hover:text-pink-300 transition-colors"
          >
            ← Chỉnh sửa lại
          </button>
          <a
            href="#/my-birthdays"
            className="hover:text-pink-300 transition-colors underline decoration-pink-500/40"
          >
            My Birthdays →
          </a>
        </div>
      </div>
    </div>
  );
};
