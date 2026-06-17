import React, { useState, useEffect } from 'react';
import { Sparkles, CheckSquare, Calendar, Bell, Target, Award, RefreshCw, Star } from 'lucide-react';
import { UserProfile, Habit, TaskList, CalendarEvent, Reminder, Goal, TaskItem } from '../types';
import { MOTIVATIONAL_QUOTES, getTodayStr } from '../initialData';

interface DashboardProps {
  user: UserProfile;
  habits: Habit[];
  taskLists: TaskList[];
  events: CalendarEvent[];
  reminders: Reminder[];
  goals: Goal[];
  onNavigate: (section: string) => void;
}

export default function Dashboard({
  user,
  habits,
  taskLists,
  events,
  reminders,
  goals,
  onNavigate,
}: DashboardProps) {
  const [greeting, setGreeting] = useState('');
  const [randomReminder, setRandomReminder] = useState<Reminder | null>(null);

  // Set greeting based on current time
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) {
      setGreeting('Buenos días ✨');
    } else if (hours >= 12 && hours < 19) {
      setGreeting('Buenas tardes 🌤');
    } else {
      setGreeting('Buenas noches 🌙');
    }
  }, []);

  // Pick random reminder on load (favoriting doubles representation chances)
  useEffect(() => {
    if (reminders.length > 0) {
      const pool: Reminder[] = [];
      reminders.forEach((r) => {
        pool.push(r);
        if (r.favorite) {
          pool.push(r); // Add again to double chances
        }
      });
      const randIndex = Math.floor(Math.random() * pool.length);
      setRandomReminder(pool[randIndex] || reminders[0]);
    }
  }, [reminders]);

  const handleRotateReminder = () => {
    if (reminders.length > 0) {
      const filtered = reminders.filter(r => r.id !== randomReminder?.id);
      const activeList = filtered.length > 0 ? filtered : reminders;
      const randIndex = Math.floor(Math.random() * activeList.length);
      setRandomReminder(activeList[randIndex]);
    }
  };

  // Frase del día (stable for today's date)
  const currentDayOfMonth = new Date().getDate();
  const quoteOfTheDay = MOTIVATIONAL_QUOTES[currentDayOfMonth % MOTIVATIONAL_QUOTES.length];

  // Percent calculation for Today's Habits
  const todayStr = getTodayStr();
  const habitsCount = habits.length;
  const completedTodayHabits = habits.filter(h => h.history[todayStr] === true).length;
  const habitsPercent = habitsCount > 0 ? Math.round((completedTodayHabits / habitsCount) * 100) : 0;

  // Next 3 tasks
  const pendingTasks: { task: TaskItem; listName: string; listColor: string }[] = [];
  taskLists.forEach((list) => {
    list.tasks.forEach((task) => {
      if (!task.completed) {
        pendingTasks.push({ task, listName: list.name, listColor: list.color });
      }
    });
  });

  // Sort: prioritize high, then medium, then low
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  pendingTasks.sort((a, b) => {
    const aWeight = priorityWeight[a.task.priority] || 0;
    const bWeight = priorityWeight[b.task.priority] || 0;
    return bWeight - aWeight;
  });
  const upcomingTasks = pendingTasks.slice(0, 3);

  // Next 2 events starting today or in the future
  const upcomingEvents = [...events]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    })
    .slice(0, 2);

  // Goal average progress
  const activeGoals = goals.filter((g) => g.status === 'progress');
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      {/* Dynamic Header with playfair display italic greeting and integrated quote container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#7C6AF7]/10 pb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl italic text-[#F0EFF8] tracking-tight">
            {greeting}, <span className="text-[#7C6AF7]">{user.name}</span>
          </h1>
          <p className="text-[#8A89A0] mt-2 text-xs tracking-wider uppercase font-mono">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="md:text-right p-4 bg-[#1A1A24] border border-[#7C6AF7]/10 rounded-2xl shadow-lg max-w-sm">
          <div className="text-[10px] uppercase tracking-[2px] text-[#8A89A0] mb-1 font-semibold flex items-center justify-start md:justify-end gap-1.5">
            <Sparkles className="w-3 h-3 text-[#F7A26A] animate-pulse" />
            <span>Frase del día</span>
          </div>
          <p className="text-xs italic font-serif leading-relaxed text-[#F7A26A]">
            "{quoteOfTheDay}"
          </p>
        </div>
      </div>

      {/* Main widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Habit Jar Miniature */}
        <div 
          onClick={() => onNavigate('habits')}
          className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 hover:border-[#7C6AF7]/40 cursor-pointer transition-all duration-300 shadow-lg group relative flex flex-col justify-between h-[340px]"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">La Alcancía de Hábitos</span>
              <span className="text-xs px-2.5 py-1 bg-[#7C6AF7]/10 text-[#7C6AF7] rounded-full font-semibold border border-[#7C6AF7]/20 group-hover:bg-[#7C6AF7]/20">
                {habitsPercent}%
              </span>
            </div>
            <h3 className="font-serif text-xl font-medium mb-2 group-hover:text-[#7C6AF7] transition-colors">
              Tu frasco hoy
            </h3>
            <p className="text-[#8A89A0] text-xs">
              Has completado {completedTodayHabits} de {habitsCount} hábitos hoy.
            </p>
          </div>

          {/* Miniature animated representation of the SVG Jar */}
          <div className="my-3 flex justify-center items-center">
            <div className="relative w-28 h-36 border-[3.5px] border-[#8A89A0]/40 rounded-b-2xl rounded-t-lg overflow-hidden flex items-end bg-[#20202C]/50 shadow-inner">
              {/* Jar Cap */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-2 bg-[#8A89A0]/70 rounded-full border border-[#0F0F14]" />
              
              {/* Liquid */}
              <div 
                className="absolute inset-x-0 bottom-0 overflow-hidden leading-none transition-all duration-700 pointer-events-none"
                style={{ 
                  height: `${habitsPercent}%`, 
                  backgroundColor: habitsPercent === 100 ? '#5BC9A0' : habitsPercent >= 50 ? '#7C6AF7' : habitsPercent > 0 ? '#F7A26A' : 'transparent' 
                }}
              >
                {habitsPercent > 0 && habitsPercent < 100 && (
                  <div className="absolute w-[200%] h-[200%] bottom-[40%] left-1/2 -translate-x-1/2 animate-wave bg-white/10 rounded-[38%]" />
                )}
              </div>

              {/* Liquid % Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-[#F0EFF8] drop-shadow-md z-10">
                {habitsPercent}%
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#7C6AF7] text-center font-semibold group-hover:translate-x-1 transition-transform flex items-center justify-center gap-1">
            Ver y registrar hábitos ➜
          </div>
        </div>

        {/* Tasks Summary */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 hover:border-[#7C6AF7]/40 cursor-pointer transition-all duration-300 shadow-lg group flex flex-col justify-between h-[340px]"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">Tareas Pendientes</span>
              <CheckSquare className="w-4 h-4 text-[#7C6AF7] opacity-60" />
            </div>
            <h3 className="font-serif text-xl font-medium mb-3 group-hover:text-[#7C6AF7] transition-colors">
              Próximos Enfocados
            </h3>
            
            {upcomingTasks.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-[#8A89A0] italic">¡Libre de tareas pendientes!</p>
                <span className="text-2xl mt-1">🎉</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map(({ task, listName, listColor }) => (
                  <li 
                    key={task.id} 
                    className="flex items-start gap-2.5 p-2.5 bg-[#22222F]/80 border border-[#7C6AF7]/5 rounded-xl text-xs"
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" 
                      style={{ backgroundColor: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F7A26A' : '#5BC9A0' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#F0EFF8] truncate">{task.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border shrink-0"
                          style={{ borderColor: `${listColor}30`, color: listColor, backgroundColor: `${listColor}10` }}
                        >
                          {listName}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-[#8A89A0] font-mono">
                            Vence: {task.dueDate.split('-').reverse().slice(0, 2).join('/')}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-[11px] text-[#7C6AF7] text-center font-semibold group-hover:translate-x-1 transition-transform flex items-center justify-center gap-1 pt-2">
            Organizar mis listas ➜
          </div>
        </div>

        {/* Calendar Summary */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 hover:border-[#7C6AF7]/40 cursor-pointer transition-all duration-300 shadow-lg group flex flex-col justify-between h-[340px]"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">Calendario</span>
              <Calendar className="w-4 h-4 text-[#7C6AF7] opacity-60" />
            </div>
            <h3 className="font-serif text-xl font-medium mb-3 group-hover:text-[#7C6AF7] transition-colors">
              Agenda Próxima
            </h3>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-[#8A89A0] italic">Sin eventos agendados hoy</p>
                <span className="text-2xl mt-1">📅</span>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const catColor = 
                    event.category === 'work' ? '#7C6AF7' : 
                    event.category === 'health' ? '#5BC9A0' : 
                    event.category === 'social' ? '#F7A26A' : 
                    event.category === 'personal' ? '#EC4899' : '#8A89A0';

                  return (
                    <div 
                      key={event.id}
                      className="p-2.5 bg-[#22222F]/80 border border-[#7C6AF7]/5 rounded-xl text-xs flex items-center gap-2.5"
                    >
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#F0EFF8] truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8A89A0]">
                          <span className="font-mono">
                            {event.date === todayStr ? 'Hoy' : event.date.split('-').slice(1).reverse().join('/')}
                          </span>
                          {event.startTime && (
                            <span className="font-mono">
                              {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#7C6AF7] text-center font-semibold group-hover:translate-x-1 transition-transform flex items-center justify-center gap-1">
            Explorar calendario ➜
          </div>
        </div>

      </div>

      {/* Bottom Row Reminders + Goals Quick Look */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Self Reminder Carousel */}
        <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">Un Susurro para ti hoy 🔔</span>
              <button 
                onClick={handleRotateReminder}
                className="p-1.5 hover:bg-[#22222F] text-[#8A89A0] hover:text-[#7C6AF7] rounded-lg transition-colors cursor-pointer"
                title="Cambiar recordatorio"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {randomReminder ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#F7A26A]/10 border border-[#F7A26A]/20 rounded-xl">
                    <span className="text-xl">
                      {randomReminder.category === 'motivation' ? '💪' :
                       randomReminder.category === 'affirmation' ? '✨' :
                       randomReminder.category === 'reflection' ? '🌀' : '📌'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#F7A26A]">
                        {randomReminder.category === 'motivation' ? 'Motivación' :
                         randomReminder.category === 'affirmation' ? 'Afirmación' :
                         randomReminder.category === 'reflection' ? 'Reflexión' : 'Cosa por hacer'}
                      </span>
                      {randomReminder.favorite && (
                        <Star className="w-3.5 h-3.5 fill-[#F7A26A] text-[#F7A26A] inline" />
                      )}
                    </div>
                    <p className="font-serif text-[15px] text-[#F0EFF8] leading-relaxed">
                      "{randomReminder.message}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#8A89A0] italic text-center py-6">
                No tienes recordatorios creados aún.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#7C6AF7]/5 flex justify-between items-center text-xs">
            <span className="text-[#8A89A0]">Aparecen aleatoriamente según tus favoritos.</span>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-[#7C6AF7] font-semibold hover:underline"
            >
              Ver todos ➜
            </button>
          </div>
        </div>

        {/* Goals Progress Quick Look */}
        <div 
          onClick={() => onNavigate('goals')}
          className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 hover:border-[#7C6AF7]/40 cursor-pointer shadow-lg group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">Tus Objetivos Actuales</span>
              <Target className="w-4 h-4 text-[#F7A26A] opacity-60" />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#F7A26A]/30 flex items-center justify-center p-1 font-mono text-sm text-[#F7A26A] font-semibold">
                {avgGoalProgress}%
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium">Progreso de Enfoque</h4>
                <p className="text-xs text-[#8A89A0]">Promedio de {activeGoals.length} objetivos en progreso.</p>
              </div>
            </div>

            {activeGoals.length === 0 ? (
              <div className="text-xs text-[#8A89A0] italic py-3">
                No tienes objetivos activos en progreso. ¡Establece tu norte!
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#F0EFF8] truncate">{goal.title}</span>
                      <span className="text-[#F7A26A] font-mono">{goal.progress}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-1.5 w-full bg-[#22222F] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A] rounded-full transition-all duration-500" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#7C6AF7] font-semibold group-hover:translate-x-1 transition-transform flex items-center justify-center gap-1 pt-4">
            Ajustar metas y pasos ➜
          </div>
        </div>

      </div>

    </div>
  );
}
