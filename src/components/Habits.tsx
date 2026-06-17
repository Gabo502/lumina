import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { Habit } from '../types';
import { getTodayStr, getPast7Days } from '../initialData';

interface HabitsProps {
  habits: Habit[];
  onUpdateHabits: (newHabits: Habit[]) => void;
}

const QUICK_EMOJIS = ["💧", "🧘", "📚", "🤸", "🍎", "🏃", "🛌", "🍵", "💻", "🪴", "🎸", "🚶", "🔑", "🍳", "🦷"];
const HABIT_COLORS = ["#7C6AF7", "#5BC9A0", "#F7A26A", "#EC4899", "#3B82F6", "#EF4444"];

export default function Habits({ habits, onUpdateHabits }: HabitsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💧');
  const [color, setColor] = useState('#7C6AF7');

  // Confirmation popup states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const todayStr = getTodayStr();

  // Reset form
  const resetForm = () => {
    setName('');
    setEmoji('💧');
    setColor('#7C6AF7');
    setEditingHabit(null);
    setShowForm(false);
  };

  // Toggle checklist habit today
  const handleToggleHabit = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const historyCopy = { ...h.history };
        historyCopy[todayStr] = !historyCopy[todayStr];
        return { ...h, history: historyCopy };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  // Save Habit (Add or Edit)
  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      // Edit
      const updated = habits.map(h => {
        if (h.id === editingHabit.id) {
          return { ...h, name: name.trim(), emoji, color };
        }
        return h;
      });
      onUpdateHabits(updated);
    } else {
      // Create
      const newHabit: Habit = {
        id: 'hab_' + Date.now(),
        name: name.trim(),
        emoji,
        color,
        history: { [todayStr]: false } // Defaults to uncompleted today
      };
      onUpdateHabits([...habits, newHabit]);
    }
    resetForm();
  };

  // Set fields to Edit
  const handleStartEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setEmoji(habit.emoji);
    setColor(habit.color);
    setShowForm(true);
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    onUpdateHabits(updated);
    setConfirmDeleteId(null);
  };

  // Today progress statistics
  const totalCount = habits.length;
  const completedToday = habits.filter(h => h.history[todayStr] === true).length;
  const statusPercent = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0;

  // Motivational message depending on jar capacity
  let jarMessage = "¡Tu frasco está vacío hoy! Comienza a marcar tus hábitos para ver fluir tu bienestar. 🏺";
  if (statusPercent > 0 && statusPercent < 35) {
    jarMessage = "¡Un gran comienzo! Cada pequeña gota nutre tu bienestar. Sigue adelante. 💧";
  } else if (statusPercent >= 35 && statusPercent < 65) {
    jarMessage = "¡Frasco lleno a la mitad! Has sembrado un gran esfuerzo hoy, siéntete orgulloso. 🚀";
  } else if (statusPercent >= 65 && statusPercent < 100) {
    jarMessage = "¡Casi lleno! Excelente nivel de enfoque hoy. Una gota más y rebosará tu luz. ✨";
  } else if (statusPercent === 100) {
    jarMessage = "¡Felicidades! Frasco rebosante de bienestar absoluto. Has completado todo por hoy. 🏆🌟";
  }

  // Liquid color selector
  const liquidColor = 
    statusPercent === 100 ? '#5BC9A0' : 
    statusPercent >= 50 ? '#7C6AF7' : 
    statusPercent > 0 ? '#F7A26A' : 'transparent';

  // Week History calculation
  const past7 = getPast7Days();
  const historyStats = past7.map(day => {
    const totalOnDay = habits.length;
    let completedOnDay = 0;
    if (totalOnDay > 0) {
      completedOnDay = habits.filter(h => h.history[day.dateStr] === true).length;
    }
    const pct = totalOnDay > 0 ? Math.round((completedOnDay / totalOnDay) * 100) : 0;
    return {
      ...day,
      percent: pct,
      completed: completedOnDay,
      total: totalOnDay
    };
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">ALCANCÍA DE BIENESTAR</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Tus Hábitos Diarios</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Cultiva constancia. Llenar tu frasco te ayuda a equilibrar cuerpo y mente paso a paso.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingHabit(null); }}
          className="flex items-center justify-center gap-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          Añadir hábito
        </button>
      </div>

      {/* Grid of the 2 subsystems: Jar left, Register checklist right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col (4/12 spaces) - La Alcancía widget style */}
        <div className="lg:col-span-5 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-6 sticky top-6">
          <div className="text-center">
            <h2 className="font-serif text-xl font-medium mb-1">La Alcancía de Hábitos</h2>
            <p className="text-[#8A89A0] text-xs font-sans">El frasco mágico de tu consistencia diaria</p>
          </div>

          {/* SVG Jar simulation */}
          <div className="flex justify-center py-4 relative">
            <div className="relative w-44 h-56 border-[4px] border-[#8A89A0]/50 rounded-b-3xl rounded-t-xl overflow-hidden flex items-end bg-[#20202C]/50 shadow-inner">
              {/* Jar Neck/Cap */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#8A89A0]/70 rounded-full border border-[#0F0F14] z-10" />
              
              {/* Liquid content filling */}
              <div 
                className="absolute inset-x-0 bottom-0 overflow-hidden leading-none transition-all duration-1000 pointer-events-none"
                style={{ 
                  height: `${statusPercent}%`, 
                  backgroundColor: liquidColor 
                }}
              >
                {statusPercent > 0 && statusPercent < 100 && (
                  <div className="absolute w-[200%] h-[200%] bottom-[40%] left-1/2 -translate-x-1/2 animate-wave bg-white/10 rounded-[38%] z-0" />
                )}
              </div>

              {/* Big Percentage Center */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center z-10">
                <span className="font-mono text-3xl font-extrabold text-[#F0EFF8] drop-shadow-lg block">
                  {statusPercent}%
                </span>
                <span className="text-[10px] text-[#F0EFF8]/80 uppercase tracking-widest font-bold font-sans block mt-1 drop-shadow-sm">
                  {completedToday} / {totalCount} completados
                </span>
              </div>
            </div>
            
            {statusPercent === 100 && (
              <div className="absolute top-4 right-12 animate-bounce bg-[#5BC9A0] text-[#0F0F14] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Completo!
              </div>
            )}
          </div>

          {/* Message Area */}
          <div className="p-4 bg-[#22222F]/60 border border-[#7C6AF7]/10 rounded-xl text-center">
            <p className="font-sans text-xs text-[#F0EFF8] leading-relaxed">
              {jarMessage}
            </p>
          </div>

          {/* Historial semanal */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">Historial de últimos 7 días</h4>
            <div className="flex justify-between items-center bg-[#22222F]/40 border border-[#7C6AF7]/5 rounded-xl p-3">
              {historyStats.map((item, index) => {
                const isToday = item.dateStr === todayStr;
                const circleColor = 
                  item.percent === 100 ? 'bg-[#5BC9A0]' : 
                  item.percent >= 50 ? 'bg-[#7C6AF7]' : 
                  item.percent > 0 ? 'bg-[#F7A26A]' : 'bg-[#22222F] border border-[#7C6AF7]/10';

                return (
                  <div key={item.dateStr} className="flex flex-col items-center gap-1.5 flex-1 group">
                    <span className="text-[10px] text-[#8A89A0] font-mono">{item.label}</span>
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-[#0F0F14] ${circleColor} transition-all duration-300 relative`}
                      style={{ color: item.percent > 0 ? '#1A1A24' : '#8A89A0' }}
                    >
                      {item.percent > 0 ? `${item.percent}%` : '0%'}
                      
                      {/* Tooltip detail */}
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#0F0F14] border border-[#7C6AF7]/20 text-[#F0EFF8] text-[10px] rounded px-2 py-1 font-sans z-50 whitespace-nowrap transition-opacity duration-200 shadow-xl">
                        {item.completed} de {item.total} hábitos ({item.percent}%)
                      </div>
                    </div>
                    {isToday && (
                      <span className="w-1 h-1 rounded-full bg-[#7C6AF7]" title="Hoy" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col (7/12 spaces) - List of Habits checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl font-medium">Registro de Hoy</h2>
              <span className="text-xs text-[#8A89A0] font-mono">
                Se limpian solos a medianoche
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="text-4xl">🪴</div>
                <div className="space-y-2">
                  <p className="text-sm text-[#F0EFF8] font-medium">No has registrado ningún hábito todavía</p>
                  <p className="text-xs text-[#8A89A0] max-w-sm mx-auto">Comienza agregando pequeños rituales diarios como beber agua, leer o meditar.</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Registrar mi primer hábito +
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const isDone = habit.history[todayStr] === true;
                  const borderCol = isDone ? `${habit.color}35` : 'rgba(124, 106, 247, 0.1)';

                  return (
                    <div 
                      key={habit.id}
                      className="flex items-center justify-between bg-[#22222F]/90 border rounded-xl p-4 transition-all duration-300 hover:bg-[#22222F] hover:translate-x-0.5"
                      style={{ borderColor: borderCol }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                        {/* Status Checkbox */}
                        <button
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer ${
                            isDone 
                              ? 'text-[#0F0F14]' 
                              : 'border-[#8A89A0]/35 hover:border-[#7C6AF7]'
                          }`}
                          style={{ 
                            backgroundColor: isDone ? habit.color : 'transparent',
                            borderColor: isDone ? habit.color : undefined
                          }}
                        >
                          {isDone && <Check className="w-4 h-4 stroke-[3px]" />}
                        </button>

                        {/* Name and Tag color */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0" role="img" aria-label="icono-habito">
                            {habit.emoji}
                          </span>
                          <span className={`text-[15px] font-sans truncate ${isDone ? 'text-[#8A89A0] line-through decoration-[#8A89A0]/60' : 'text-[#F0EFF8] font-medium'}`}>
                            {habit.name}
                          </span>
                        </div>
                      </div>

                      {/* Utility Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0 relative">
                        <button
                          onClick={() => handleStartEdit(habit)}
                          className="p-1.5 text-[#8A89A0] hover:text-[#7C6AF7] hover:bg-[#1A1A24]/60 rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete with nested confirmation */}
                        {confirmDeleteId === habit.id ? (
                          <div className="absolute right-0 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-10 shadow-xl">
                            <span className="text-[10px] text-[#EF4444] font-medium">¿Borrar?</span>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="px-2 py-0.5 bg-[#EF4444] text-[#F0EFF8] text-[9px] font-bold rounded"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 bg-[#22222F] text-[#8A89A0] text-[9px] font-bold rounded border border-[#7C6AF7]/15"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(habit.id)}
                            className="p-1.5 text-[#8A89A0] hover:text-[#EF4444] hover:bg-[#1A1A24]/60 rounded-lg transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Habit Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito ✦'}
              </h3>
              <button 
                onClick={resetForm} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Nombre del hábito
                </label>
                <input
                  type="text"
                  maxLength={40}
                  required
                  placeholder="Ej: Beber agua, Yoga, Leer..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium"
                />
              </div>

              {/* Emoji selector */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
                  <span>Icono emoji</span>
                  <span className="text-[#7C6AF7] text-[10px]">O escribe tu propio emoji abajo</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-12 bg-[#22222F] border border-[#7C6AF7]/20 rounded-xl text-center text-xl outline-none"
                  />
                  <div className="flex-1 grid grid-cols-5 gap-1 p-1 bg-[#22222F]/60 rounded-xl border border-[#7C6AF7]/10 overflow-x-auto max-h-[82px]">
                    {QUICK_EMOJIS.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className={`text-lg p-1 hover:bg-[#7C6AF7]/10 rounded-lg transition-colors ${emoji === em ? 'bg-[#7C6AF7]/25 border border-[#7C6AF7]/30' : ''}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag/Label colors */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Color de etiqueta
                </label>
                <div className="flex gap-2.5">
                  {HABIT_COLORS.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${color === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-85 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
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
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  {editingHabit ? 'Guardar Cambios' : 'Añadir Hábito'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
