import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Smile,
  Sparkles,
  Check,
  Camera,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { playSound } from '../../utils/sound';
import { getRankTier } from '../../utils/gamification';

interface AvatarPickerModalProps {
  isOpen: boolean;
  user: UserProfile;
  onUpdateAvatar: (data: { avatar?: string; avatarEmoji?: string }) => void;
  onClose: () => void;
}

export const PRESET_AVATARS = [
  {
    id: 'cyber-samurai',
    name: 'Cyber Samurai',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'neon-hacker',
    name: 'Neon Hacker',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie Blade',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pixel-pilot',
    name: 'Pixel Pilot',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'synth-ranger',
    name: 'Synth Ranger',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'shadow-monk',
    name: 'Shadow Monk',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'astro-warrior',
    name: 'Astro Warrior',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'mecha-knight',
    name: 'Mecha Knight',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
  },
];

export const EMOJI_CATEGORIES = [
  {
    name: 'Arcade & Cyber',
    emojis: ['👾', '🤖', '🕹️', '🎮', '⚡', '💾', '🚀', '🛸', '🦾', '🔮', '🛰️', '🔥'],
  },
  {
    name: 'Champions & Battle',
    emojis: ['🥷', '🧙‍♂️', '🥋', '⚔️', '🛡️', '👑', '🏆', '💎', '🦅', '🐉', '🥊', '🏹'],
  },
  {
    name: 'Mind, Zen & Power',
    emojis: ['🧘‍♂️', '🧠', '🌊', '🏔️', '🌌', '🌟', '🌿', '🕊️', '🎯', '🕯️', '☀️', '🌋'],
  },
  {
    name: 'Beasts & Guardians',
    emojis: ['🐺', '🦁', '🐯', '🦊', '🦉', '🦈', '🦍', '🦄', '🐼', '🐲', '🐆', '🦅'],
  },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  user,
  onUpdateAvatar,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'emojis' | 'url'>('upload');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(user.avatar || '');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(user.avatarEmoji || '👾');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(user.avatar || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rankTier = getRankTier(user.level || 1);

  if (!isOpen) return null;

  // Process and compress uploaded image file into a fast web-safe base64 data URL
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw and compress to square canvas 256x256 max
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Calculate aspect ratio crop to center square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewImage(dataUrl);
        setSelectedAvatarUrl(dataUrl);
        setIsProcessing(false);
        playSound('powerup');
      };
      img.onerror = () => {
        setErrorMessage('Failed to load image file.');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    playSound('powerup');
    if (activeTab === 'emojis') {
      onUpdateAvatar({
        avatar: '', // Clear photo to prioritize emoji
        avatarEmoji: selectedEmoji,
      });
    } else {
      onUpdateAvatar({
        avatar: selectedAvatarUrl || previewImage || '',
        avatarEmoji: selectedEmoji,
      });
    }
    onClose();
  };

  const handleClearPhoto = () => {
    playSound('click');
    setPreviewImage(null);
    setSelectedAvatarUrl('');
  };

  return (
    <div
      id="avatar-picker-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="avatar-picker-card"
        className="w-full max-w-lg bg-[#11092a] border-4 border-yellow-400 shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-slate-100 max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#3b2d60] bg-[#090416]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1f1242] border border-yellow-400 flex items-center justify-center text-yellow-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-400">CHOOSE PILOT PFP / AVATAR</h2>
              <p className="text-[10px] text-cyan-300 font-retro">
                CUSTOM DEVICE PHOTO UPLOAD OR 8-BIT ARCADE BADGE
              </p>
            </div>
          </div>
          <button
            id="avatar-modal-close-btn"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Live Preview Box */}
        <div className="p-4 bg-[#090416] border-b-2 border-[#3b2d60] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-16 h-16 bg-[#1f1242] border-2 flex items-center justify-center shadow-[3px_3px_0px_#000] relative overflow-hidden ${rankTier.borderColor}`}
            >
              {previewImage && activeTab !== 'emojis' ? (
                <img
                  src={previewImage}
                  alt="Pilot PFP"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">{selectedEmoji || '👾'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-arcade text-white uppercase">{user.name || 'PILOT'}</span>
                <span
                  className={`text-[8px] font-arcade px-1.5 py-0.5 border ${rankTier.badgeBg} ${rankTier.borderColor}`}
                  style={{ color: rankTier.color }}
                >
                  LV.{user.level} {rankTier.name}
                </span>
              </div>
              <p className="text-[10px] text-yellow-400 font-arcade mt-0.5">
                {user.currentTitle || 'STARTER'}
              </p>
              <p className="text-[9px] text-cyan-300 font-retro">
                {previewImage && activeTab !== 'emojis' ? 'Custom Photo Equipped' : `Emoji Badge: ${selectedEmoji}`}
              </p>
            </div>
          </div>

          {previewImage && (
            <button
              type="button"
              onClick={handleClearPhoto}
              className="p-2 bg-red-950/70 border border-red-500 text-red-300 text-[9px] font-arcade flex items-center space-x-1 hover:bg-red-900 shadow-[2px_2px_0px_#000]"
              title="Remove Custom Photo and use Emoji Badge"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[#3b2d60] bg-[#150b2e]">
          <button
            id="tab-avatar-upload"
            onClick={() => {
              playSound('click');
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD PHOTO</span>
          </button>

          <button
            id="tab-avatar-presets"
            onClick={() => {
              playSound('click');
              setActiveTab('presets');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>HERO ROSTER</span>
          </button>

          <button
            id="tab-avatar-emojis"
            onClick={() => {
              playSound('click');
              setActiveTab('emojis');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'emojis'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>8-BIT EMOJIS</span>
          </button>

          <button
            id="tab-avatar-url"
            onClick={() => {
              playSound('click');
              setActiveTab('url');
            }}
            className={`flex-1 py-2 text-[9px] sm:text-[10px] font-arcade flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-[#11092a] text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>IMAGE URL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DEVICE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-[#3b2d60] hover:border-yellow-400 bg-[#090416] flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group shadow-[3px_3px_0px_#000]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 bg-[#1f1242] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-arcade text-yellow-400">
                    CLICK TO BROWSE OR DRAG PHOTO HERE
                  </p>
                  <p className="text-[10px] text-cyan-300 font-retro">
                    Supports Android Gallery, Camera, PNG, JPG, WEBP (Auto-optimized)
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-retro">
                  {errorMessage}
                </div>
              )}

              {isProcessing && (
                <div className="p-3 bg-[#150b2e] border border-cyan-500 text-center text-xs font-arcade text-cyan-300 animate-pulse">
                  OPTIMIZING & ENCODING PILOT PROFILE PHOTO...
                </div>
              )}

              <div className="p-3 bg-[#090416] border border-[#3b2d60] text-[10px] font-retro text-slate-300 leading-relaxed space-y-1">
                <span className="text-yellow-400 font-arcade block text-[9px]">
                  💡 MOBILE & CLOUD STORAGE NOTE
                </span>
                <p>
                  Your profile picture is safely processed into a lightweight profile token that automatically syncs with your Google Firebase save state across all your devices.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
                SELECT A PILOT HERO ROSTER AVATAR:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        playSound('click');
                        setSelectedAvatarUrl(preset.url);
                        setPreviewImage(preset.url);
                      }}
                      className={`p-2 border-2 cursor-pointer transition-all flex flex-col items-center space-y-1.5 ${
                        isSelected
                          ? 'bg-[#1f1242] border-yellow-400 shadow-[3px_3px_0px_#000]'
                          : 'bg-[#090416] border-[#3b2d60] hover:border-slate-400'
                      }`}
                    >
                      <div className="w-14 h-14 bg-black border border-[#3b2d60] overflow-hidden relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-arcade text-white text-center truncate w-full">
                        {preset.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EMOJIS & SYMBOLS */}
          {activeTab === 'emojis' && (
            <div className="space-y-4">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <span className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
                    {cat.name}
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {cat.emojis.map((emoji) => {
                      const isSelected = selectedEmoji === emoji && activeTab === 'emojis';
                      return (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => {
                            playSound('click');
                            setSelectedEmoji(emoji);
                          }}
                          className={`h-11 flex items-center justify-center text-xl border-2 transition-all ${
                            isSelected
                              ? 'bg-[#1f1242] border-yellow-400 scale-105 shadow-[2px_2px_0px_#000]'
                              : 'bg-[#090416] border-[#3b2d60] hover:border-slate-500'
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DIRECT IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#090416] border-2 border-[#3b2d60] space-y-2">
                <label className="text-[9px] font-arcade text-yellow-400 uppercase tracking-wider block">
                  PASTE DIRECT IMAGE URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 bg-[#150b2e] border-2 border-[#3b2d60] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        playSound('powerup');
                        setPreviewImage(customUrlInput.trim());
                        setSelectedAvatarUrl(customUrlInput.trim());
                      }
                    }}
                    className="arcade-btn-cyan px-3 py-2 text-[9px] font-arcade"
                  >
                    TEST
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#090416] border border-[#3b2d60] text-[10px] font-retro text-cyan-300">
                You can paste direct image URLs from Discord avatars, GitHub profiles, Gravatar, or photo hosting services.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t-2 border-[#3b2d60] bg-[#090416] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="py-2 px-4 bg-[#1e1338] hover:bg-[#2e1d54] border-2 border-slate-600 text-slate-300 text-[10px] font-arcade shadow-[2px_2px_0px_#000] active:translate-y-0.5"
          >
            CANCEL
          </button>

          <button
            type="button"
            id="avatar-save-btn"
            onClick={handleSave}
            className="py-2 px-5 bg-yellow-400 hover:bg-yellow-300 border-2 border-yellow-200 text-black text-[10px] font-arcade font-bold shadow-[3px_3px_0px_#000] active:translate-y-0.5 flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>SAVE PILOT AVATAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
