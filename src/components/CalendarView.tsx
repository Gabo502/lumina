import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Tag, FileText, AlertCircle, List } from 'lucide-react';
import { CalendarEvent } from '../types';
import { getTodayStr } from '../initialData';

interface CalendarViewProps {
  events: CalendarEvent[];
  onUpdateEvents: (newEvents: CalendarEvent[]) => void;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CATEGORIES = [
  { id: 'personal', label: 'Personal 🟣', color: '#EC4899' },
  { id: 'work', label: 'Trabajo 🔵', color: '#7C6AF7' },
  { id: 'health', label: 'Salud 🟢', color: '#5BC9A0' },
  { id: 'social', label: 'Social 🟠', color: '#F7A26A' },
  { id: 'other', label: 'Otro ⚪', color: '#A1A1AA' }
];

export default function CalendarView({ events, onUpdateEvents }: CalendarViewProps) {
  const [tabMode, setTabMode] = useState<'month' | 'upcoming'>('month');
  
  // Date trackers
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0 - 11
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  // Form states on selected date
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<'personal' | 'work' | 'health' | 'social' | 'other'>('personal');
  const [notes, setNotes] = useState('');

  // Trash confirms
  const [confirmEventId, setConfirmEventId] = useState<string | null>(null);

  // Math calculations for Classic Calendar
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y: number, m: number) => {
    let index = new Date(y, m, 1).getDay();
    // Monday is index 0 in Spanish, Sunday is index 6
    return index === 0 ? 6 : index - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getFirstDayIndex(year, month);

  // Month navigation
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Add Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: title.trim(),
      date: selectedDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      notes: notes.trim() || undefined
    };

    onUpdateEvents([...events, newEvent]);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setNotes('');
  };

  // Delete Event
  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    onUpdateEvents(updated);
    setConfirmEventId(null);
  };

  // Events filtered for currently selected day
  const dailyEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Calendar squares dataset creator
  const calendarDaysList: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];
  
  // Padding cells before day 1
  for (let i = 0; i < startOffset; i++) {
    calendarDaysList.push({ dateStr: '', dayNum: 0, isPadding: true });
  }

  // Active day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    calendarDaysList.push({
      dateStr: `${year}-${mStr}-${dStr}`,
      dayNum: d,
      isPadding: false
    });
  }

  // Upcoming 2 weeks view calculation
  const todayStr = getTodayStr();
  const twoWeeksLaterDate = new Date();
  twoWeeksLaterDate.setDate(twoWeeksLaterDate.getDate() + 14);
  const twoWeeksLaterStr = twoWeeksLaterDate.toISOString().split('T')[0];

  const upcomingEventsList = events
    .filter(e => e.date >= todayStr && e.date <= twoWeeksLaterStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

  // Spanish formatting name for Selected Date
  const formatSelectedDateLocal = () => {
    try {
      const d = new Date(selectedDate + 'T00:00:00'); // Prevent timezone offset shift
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">ORGANIZACIÓN DEL TIEMPO</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Agenda y Calendario</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Sincroniza tus compromisos, planifica espacios de auto-cuidado y haz seguimiento a tus rituales.</p>
        </div>

        {/* Calendar toggle button list */}
        <div className="flex gap-2 p-1 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-xl self-start md:self-auto select-none">
          <button
            onClick={() => setTabMode('month')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              tabMode === 'month' 
                ? 'bg-[#7C6AF7] text-[#F0EFF8] shadow' 
                : 'text-[#8A89A0] hover:text-[#F0EFF8]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Mes clásico
          </button>
          <button
            onClick={() => setTabMode('upcoming')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              tabMode === 'upcoming' 
                ? 'bg-[#7C6AF7] text-[#F0EFF8] shadow' 
                : 'text-[#8A89A0] hover:text-[#F0EFF8]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Próximos 14 días
          </button>
        </div>
      </div>

      {/* RENDER VIEW A : Monthly classic Grid + Side Scheduler Panel (Flex layout) */}
      {tabMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Month Grid (8/12 blocks) */}
          <div className="lg:col-span-8 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Nav month and year */}
            <div className="flex justify-between items-center bg-[#22222F]/40 border border-[#7C6AF7]/5 px-4 py-3.5 rounded-xl">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-[#22222F]/80 text-[#8A89A0] hover:text-[#7C6AF7] rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="font-serif text-lg font-semibold text-[#F0EFF8] tracking-wide">
                {MONTHS_ES[month]} {year}
              </h2>

              <button 
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-[#22222F]/80 text-[#8A89A0] hover:text-[#7C6AF7] rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Classic Calendar Table */}
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-sans font-bold uppercase tracking-wider text-[#8A89A0]">
                {WEEKDAYS_ES.map(day => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>

              {/* Squares Grid wrapper */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDaysList.map((cell, index) => {
                  if (cell.isPadding) {
                    return <div key={`pad-${index}`} className="aspect-square bg-transparent rounded-xl" />;
                  }

                  const dateEvents = events.filter(e => e.date === cell.dateStr);
                  const isDaySelected = cell.dateStr === selectedDate;
                  const isCurrentToday = cell.dateStr === getTodayStr();

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`aspect-square rounded-xl p-2.5 flex flex-col justify-between items-start transition-all duration-200 cursor-pointer group relative overflow-hidden bg-[#22222F]/60 border ${
                        isDaySelected 
                          ? 'border-[#7C6AF7] bg-[#7C6AF7]/10' 
                          : isCurrentToday
                            ? 'border-[#5BC9A0]/60 bg-[#5BC9A0]/5'
                            : 'border-[#7C6AF7]/5 hover:border-[#7C6AF7]/30 hover:bg-[#22222F]'
                      }`}
                    >
                      {/* Day Number text */}
                      <span className={`text-xs font-mono font-bold ${
                        isCurrentToday 
                          ? 'text-[#5BC9A0] bg-[#5BC9A0]/10 px-1.5 py-0.5 rounded-md' 
                          : 'text-[#F0EFF8] group-hover:text-[#7C6AF7]'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {/* Display events markers (Horizontal pills or count) */}
                      {dateEvents.length > 0 && (
                        <div className="w-full flex gap-1.5 mt-2.5 overflow-x-hidden pt-1 shrink-0">
                          {dateEvents.slice(0, 3).map((evt) => {
                            const catColor = CATEGORIES.find(c => c.id === evt.category)?.color || '#8A89A0';
                            return (
                              <div
                                key={evt.id}
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: catColor }}
                                title={evt.title}
                              />
                            );
                          })}
                          {dateEvents.length > 3 && (
                            <span className="text-[7px] text-[#8A89A0] font-bold font-mono">+{dateEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Side Scheduler Panel (4/12 spaces) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Lists of events scheduled for selected Day */}
            <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-[#7C6AF7]/10 pb-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">AGENDA PARA EL</span>
                <h3 className="font-serif text-[15px] font-medium text-[#F0EFF8] capitalize mt-0.5">
                  {formatSelectedDateLocal()}
                </h3>
              </div>

              {dailyEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8A89A0] italic">
                  Libre de eventos hoy. Súbete un recordatorio abajo.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {dailyEvents.map(evt => {
                    const catObj = CATEGORIES.find(c => c.id === evt.category) || CATEGORIES[4];
                    return (
                      <div 
                        key={evt.id}
                        className="p-3 bg-[#22222F]/90 border border-[#7C6AF7]/5 rounded-xl text-xs space-y-1.5 hover:border-[#7C6AF7]/15 relative group"
                      >
                        <div className="flex justify-between items-start gap-4 pr-6">
                          <h4 className="font-semibold text-[#F0EFF8] line-clamp-1">{evt.title}</h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8A89A0] font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#7C6AF7]" />
                            {evt.startTime ? `${evt.startTime} ${evt.endTime ? `- ${evt.endTime}` : ''}` : 'Todo el día'}
                          </span>
                          <span className="flex items-center gap-1" style={{ color: catObj.color }}>
                            <Tag className="w-3 h-3" />
                            {catObj.label.split(' ')[0]}
                          </span>
                        </div>

                        {evt.notes && (
                          <p className="text-[10px] italic text-[#8A89A0] border-t border-[#7C6AF7]/5 pt-1 mt-1 leading-relaxed">
                            {evt.notes}
                          </p>
                        )}

                        {/* Delete Event Icon buttons */}
                        {confirmEventId === evt.id ? (
                          <div className="absolute right-2 top-2 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1 flex items-center gap-1 z-10 shadow-xl text-[9px] whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmEventId(null)}
                              className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmEventId(evt.id)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-[#8A89A0] hover:text-[#EF4444] transition-all cursor-pointer"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Event Form widget */}
            <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-medium border-b border-[#7C6AF7]/10 pb-2">
                Añadir Evento
              </h3>

              <form onSubmit={handleAddEvent} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                    Título del evento
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ej: Yoga matinal, Revisión de metas..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold"
                  />
                </div>

                {/* Times split */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                      Inicio
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-2.5 py-2 text-[#F0EFF8] outline-none text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-2.5 py-2 text-[#F0EFF8] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Category select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-1 px-1 bg-[#22222F]/60 rounded-xl border border-[#7C6AF7]/10 p-1 overflow-x-auto max-h-[82px]">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`text-[10px] p-1.5 text-center font-bold tracking-wide rounded-lg transition-colors ${category === cat.id ? 'bg-[#7C6AF7]/30 border border-[#7C6AF7]/40' : 'text-[#8A89A0] hover:text-[#F0EFF8]'}`}
                        style={{ color: category === cat.id ? cat.color : undefined }}
                      >
                        {cat.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
                    <span>Notas breves</span>
                    <span className="text-[#8A89A0]/50 text-[9px]">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={140}
                    placeholder="Lugar, detalles, links..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-[#F0EFF8] placeholder-[#8A89A0]/40 outline-none focus:border-[#7C6AF7] transition-all text-xs font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  Añadir Suceso
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW B : Chronological upcoming events feed for next 14 days */}
      {tabMode === 'upcoming' && (
        <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#7C6AF7]/15 pb-4">
            <h2 className="font-serif text-xl font-medium">Línea de Tiempo - Próximas 2 Semanas</h2>
            <p className="text-[#8A89A0] text-xs">Mantén la vista a medio plazo sobre tus compromisos más relevantes.</p>
          </div>

          {upcomingEventsList.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="text-4xl">🕊️</div>
              <p className="text-xs text-[#8A89A0] italic">No tienes ningún evento guardado para las próximas dos semanas.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#7C6AF7]/20 pl-4 ml-2 space-y-6">
              {upcomingEventsList.map((evt) => {
                const catObj = CATEGORIES.find(c => c.id === evt.category) || CATEGORIES[4];
                const parts = evt.date.split('-');
                const displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

                return (
                  <div key={evt.id} className="relative group">
                    {/* Floating chronological node bullet */}
                    <div 
                      className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#1A1A24] transition-transform duration-300 group-hover:scale-130"
                      style={{ backgroundColor: catObj.color }}
                    />

                    <div className="bg-[#22222F]/60 border border-[#7C6AF7]/5 hover:border-[#7C6AF7]/25 p-4 rounded-xl space-y-2 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] font-bold font-mono text-[#7C6AF7] bg-[#7C6AF7]/10 px-2.5 py-0.5 rounded-full">
                          {displayDate}
                        </span>
                        
                        <div className="relative">
                          {confirmEventId === evt.id ? (
                            <div className="absolute right-0 top-0 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-10 shadow-xl text-[9px] whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteEvent(evt.id)}
                                className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setConfirmEventId(null)}
                                className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmEventId(evt.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#8A89A0] hover:text-[#EF4444] transition-opacity cursor-pointer"
                              title="Eliminar evento de línea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif text-lg font-medium text-[#F0EFF8]">{evt.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#8A89A0] font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#7C6AF7]" />
                          {evt.startTime ? `${evt.startTime} ${evt.endTime ? `- ${evt.endTime}` : ''}` : 'Todo el día'}
                        </span>
                        <span className="flex items-center gap-1" style={{ color: catObj.color }}>
                          <Tag className="w-3.5 h-3.5" />
                          Categoría: {catObj.label.split(' ')[0]}
                        </span>
                      </div>

                      {evt.notes && (
                        <p className="text-xs text-[#8A89A0] bg-[#1A1A24]/50 border border-[#7C6AF7]/5 p-2.5 rounded-lg italic">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
