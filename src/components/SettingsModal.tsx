import React, { useState } from 'react';
import { User, Image as ImageIcon, Sparkles, Sun, Moon, Sliders, X, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  user: UserProfile;
  onUpdateUser: (newUser: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=128&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=128&auto=format&fit=crop"
];

export default function SettingsModal({ user, onUpdateUser, isOpen, onClose }: SettingsModalProps) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [appName, setAppName] = useState(user.appName);
  const [theme, setTheme] = useState<UserProfile['theme']>(user.theme);
  
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Compress custom avatar upload to JPEG base64 of 150px max width for safe storage
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const rDim = 150; // 150px square thumbnail is plenty for premium avatar
        canvas.width = rDim;
        canvas.height = rDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw image cropped in center square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, rDim, rDim);

          const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedUrl);
        }
        setIsUploading(false);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim() || user.name,
      avatar: avatar || user.avatar,
      appName: appName.trim() || user.appName,
      theme
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-[#F0EFF8]">
      <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
        
        {/* Head */}
        <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
          <h3 className="font-serif text-lg font-semibold text-[#F0EFF8] flex items-center gap-1.5">
            <Sliders className="w-5 h-5 text-[#7C6AF7]" />
            Configurar Lumina
          </h3>
          <button 
            onClick={onClose} 
            className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm p-1 hover:bg-[#22222F] rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* User profile details */}
          <div className="space-y-3 p-3.5 bg-[#22222F]/40 border border-[#7C6AF7]/10 rounded-xl">
            <div className="flex items-center gap-4">
              <img 
                src={avatar} 
                alt="Profile Preview" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-[#7C6AF7] object-cover bg-[#0F0F14]"
              />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#F0EFF8]">Foto de Perfil</span>
                <p className="text-[#8A89A0]">Escribe la URL de una foto o súbela de tus archivos.</p>
                
                {/* Upload trigger */}
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-uploader"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="avatar-uploader"
                  className="inline-block mt-1 bg-[#22222F] hover:bg-[#7C6AF7]/15 hover:border-[#7C6AF7]/35 border border-[#7C6AF7]/15 text-[#F0EFF8] px-2.5 py-1 rounded font-semibold text-[10px] cursor-pointer transition-all"
                >
                  {isUploading ? 'Procesando...' : 'Subir archivo'}
                </label>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A89A0] block">Presets Populares</span>
              <div className="flex gap-2">
                {PRESET_AVATARS.map(url => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${avatar === url ? 'border-[#7C6AF7] scale-110' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={url} alt="Preset Face" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL text field */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Pegar URL de foto personalizada..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#1A1A24] border border-[#7C6AF7]/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#7C6AF7]"
              />
            </div>
          </div>

          {/* User Name input */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Ej: Gabriel, Sofía, Explorador..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-sm font-semibold"
            />
          </div>

          {/* App customizable Name title */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
              <span>Nombre de tu App</span>
              <span className="text-[10px] text-[#8A89A0]/50 font-normal">(Launcher)</span>
            </label>
            <input
              type="text"
              required
              maxLength={15}
              placeholder="Ej: Lumina ✦, Mi Templo..."
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-sm font-semibold"
            />
          </div>

          {/* Theme custom info badge indicating lock to Sophisticated Dark */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
              Identidad Estética
            </label>
            <div className="flex items-center gap-3 bg-[#7C6AF7]/10 border border-[#7C6AF7]/20 rounded-xl px-4 py-3 text-xs">
              <Moon className="w-5 h-5 text-[#7C6AF7] animate-pulse shrink-0" />
              <div>
                <p className="font-semibold text-[#F0EFF8]">Sophisticated Dark</p>
                <p className="text-[10px] text-[#8A89A0]">La paleta oscura oficial curada para tu enfoque continuo.</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-3 border-t border-[#7C6AF7]/15 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#22222F] border border-[#7C6AF7]/15 text-[#8A89A0] text-xs font-semibold rounded-lg hover:text-[#F0EFF8] transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
