import React, { useState } from 'react';
import { Plus, Trash2, Star, Filter, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import { Reminder } from '../types';

interface RemindersProps {
  reminders: Reminder[];
  onUpdateReminders: (newReminders: Reminder[]) => void;
}

const CATEGORY_MAP = {
  motivation: { label: 'Motivación', emoji: '💪', color: '#F7A26A' },
  affirmation: { label: 'Afirmación', emoji: '✨', color: '#5BC9A0' },
  chore: { label: 'Tarea', emoji: '📌', color: '#EC4899' },
  reflection: { label: 'Reflexión', emoji: '🌀', color: '#7C6AF7' }
};

const FREQUENCY_LABELS = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  random: 'Aleatorio'
};

export default function Reminders({ reminders, onUpdateReminders }: RemindersProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Todos');
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [message, setMessage] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'medium' | 'monthly' | 'random'>('daily');
  const [category, setCategory] = useState<'motivation' | 'affirmation' | 'chore' | 'reflection'>('motivation');
  const [favorite, setFavorite] = useState(false);

  // Deletions
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setMessage('');
    setFrequency('daily');
    setCategory('motivation');
    setFavorite(false);
    setShowModal(false);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newReminder: Reminder = {
      id: 'rem_' + Date.now(),
      message: message.trim(),
      frequency: frequency === 'medium' ? 'daily' : frequency as any,
      category,
      favorite
    };

    onUpdateReminders([newReminder, ...reminders]);
    resetForm();
  };

  const handleDeleteReminder = (reminderId: string) => {
    const updated = reminders.filter(r => r.id !== reminderId);
    onUpdateReminders(updated);
    setConfirmDeleteId(null);
  };

  // Toggle Favorite
  const handleToggleFavorite = (reminderId: string) => {
    const updated = reminders.map(r => {
      if (r.id === reminderId) {
        return { ...r, favorite: !r.favorite };
      }
      return r;
    });
    onUpdateReminders(updated);
  };

  // Filter list
  const filteredReminders = reminders.filter(r => {
    if (activeCategoryFilter === 'Todos') return true;
    
    // Match based on Spanish emoji names or categories
    if (activeCategoryFilter === 'motivation') return r.category === 'motivation';
    if (activeCategoryFilter === 'affirmation') return r.category === 'affirmation';
    if (activeCategoryFilter === 'chore') return r.category === 'chore';
    if (activeCategoryFilter === 'reflection') return r.category === 'reflection';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">MENSAJES INTERNOS DE LUZ</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Recordatorios de Aliento</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Escríbete afirmaciones, tareas suaves de bienestar o reflexiones que rotarán en tu pantalla principal.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nuevo recordatorio
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none border-b border-[#7C6AF7]/5">
        <Filter className="w-3.5 h-3.5 text-[#8A89A0] shrink-0 mr-1" />
        
        <button
          onClick={() => setActiveCategoryFilter('Todos')}
          className={`text-[11px] px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
            activeCategoryFilter === 'Todos' 
              ? 'bg-[#22222F]/90 text-white border border-[#7C6AF7]/40 ring-1 ring-[#7C6AF7]/20 shadow' 
              : 'text-[#8A89A0] hover:text-white'
          }`}
        >
          🏷️ Todos ({reminders.length})
        </button>

        {Object.entries(CATEGORY_MAP).map(([key, value]) => {
          const isActive = activeCategoryFilter === key;
          const count = reminders.filter(r => r.category === key).length;
          
          return (
            <button
              key={key}
              onClick={() => setActiveCategoryFilter(key)}
              className={`text-[11px] px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#22222F]/90 text-white border shadow ring-1 ring-[#7C6AF7]/20' 
                  : 'text-[#8A89A0] hover:text-white'
              }`}
              style={{ borderColor: isActive ? value.color : 'transparent' }}
            >
              {value.emoji} {value.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid checklist list */}
      {filteredReminders.length === 0 ? (
        <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl py-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-4xl text-[#8A89A0]/60">🍃</div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#F0EFF8]">Tus reflexiones están quietas</h3>
            <p className="text-xs text-[#8A89A0] max-w-sm mx-auto px-4">Recuérdate beber agua, respira hondo o reconfirma tus capacidades diarias para impulsarte.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-xs font-semibold rounded-lg"
          >
            Añadir recordatorio +
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReminders.map((rem) => {
            const catObj = CATEGORY_MAP[rem.category] || CATEGORY_MAP.motivation;
            const borderCol = rem.favorite ? '#F7A26A/40' : 'rgba(124, 106, 247, 0.1)';

            return (
              <div
                key={rem.id}
                className="bg-[#1A1A24] border rounded-2xl p-5 hover:border-[#7C6AF7]/30 hover:scale-[1.005] shadow-lg transition-all relative flex flex-col justify-between"
                style={{ 
                  borderColor: rem.favorite ? '#F7A26A' : undefined,
                  borderWidth: rem.favorite ? '1px' : '1px'
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-3xl p-2 bg-[#22222F] rounded-xl font-sans" role="img" aria-label="icono-categoria">
                      {catObj.emoji}
                    </span>

                    {/* Right side icons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleFavorite(rem.id)}
                        className={`p-1.5 rounded-lg hover:bg-[#22222F]/60 transition-colors cursor-pointer ${
                          rem.favorite ? 'text-[#F7A26A]' : 'text-[#8A89A0] hover:text-[#F0EFF8]'
                        }`}
                        title={rem.favorite ? "Quitar de favoritos" : "Marcar como favorito"}
                      >
                        <Star className={`w-4 h-4 ${rem.favorite ? 'fill-[#F7A26A]' : ''}`} />
                      </button>

                      {confirmDeleteId === rem.id ? (
                        <div className="absolute right-3 top-3 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-10 shadow-xl text-[9px]">
                          <span className="text-[#EF4444] font-medium">¿Borrar?</span>
                          <button
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(rem.id)}
                          className="p-1.5 text-[#8A89A0] hover:text-[#EF4444] hover:bg-[#22222F] rounded-lg transition-colors cursor-pointer"
                          title="Eliminar recordatorio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message details */}
                  <p className="font-serif text-[15px] text-[#F0EFF8] italic leading-relaxed">
                    "{rem.message}"
                  </p>
                </div>

                {/* Foot indicators */}
                <div className="flex items-center gap-2 border-t border-[#7C6AF7]/5 pt-3.5 mt-4 text-[10px] uppercase font-bold tracking-wider font-sans">
                  <span 
                    className="px-2.5 py-0.5 rounded-full border"
                    style={{ borderColor: `${catObj.color}30`, color: catObj.color, backgroundColor: `${catObj.color}10` }}
                  >
                    {catObj.label}
                  </span>
                  <span className="bg-[#22222F] text-[#8A89A0] px-2.5 py-0.5 rounded-full">
                    ⏱️ Frecuencia: {FREQUENCY_LABELS[rem.frequency] || rem.frequency}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE RECORDATORIO MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                Crear Recordatorio ✦
              </h3>
              <button 
                onClick={resetForm} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              {/* Message content */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Mensaje o Afirmación
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={180}
                  placeholder="Ej: Respira hondo tres veces y recuerda que estás avanzando increíblemente a tu propio ritmo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/40 outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans block mb-1">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                        category === key 
                          ? 'border-white text-white' 
                          : 'border-[#7C6AF7]/5 bg-[#22222F]/60 text-[#8A89A0] hover:text-white'
                      }`}
                      style={{ borderColor: category === key ? val.color : undefined }}
                    >
                      <span>{val.emoji}</span>
                      <span>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans block mb-1">
                  Frecuencia de aparición
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FREQUENCY_LABELS).map(([freqKey, freqLabel]) => (
                    <button
                      key={freqKey}
                      type="button"
                      onClick={() => setFrequency(freqKey as any)}
                      className={`p-2 rounded-xl text-center text-xs font-medium border transition-colors cursor-pointer ${
                        frequency === freqKey 
                          ? 'bg-[#7C6AF7]/15 border-[#7C6AF7] text-white font-bold' 
                          : 'bg-[#22222F]/60 border-transparent text-[#8A89A0] hover:text-[#F0EFF8]'
                      }`}
                    >
                      {freqLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorito block toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#22222F]/40 border border-[#7C6AF7]/10 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#F0EFF8]">Marcar de Favorito ⭐</span>
                  <p className="text-[10px] text-[#8A89A0]">Aumenta el doble las probabilidades de rotación en el Dashboard.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFavorite(!favorite)}
                  className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${favorite ? 'bg-[#F7A26A]' : 'bg-[#22222F] border border-[#7C6AF7]/10'}`}
                >
                  <div 
                    className="w-5 h-5 bg-white rounded-full shadow transition-all transform"
                    style={{ transform: favorite ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#7C6AF7]/15">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-[#22222F] border border-[#7C6AF7]/15 text-[#8A89A0] text-xs font-semibold rounded-lg hover:text-[#F0EFF8] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Crear recordatorio
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
