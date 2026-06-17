import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Calendar, CheckSquare, MessageSquare, Plus, Trash2, 
  Heart, Award, ArrowLeft, ArrowRight, Settings, Image as ImageIcon, 
  Folder, User, Compass, Pin, Eye, EyeOff, Search, FileText, Check, 
  Star, Filter, FolderPlus, Bell, Target, TrendingUp, RefreshCw, Sparkles, 
  Home 
} from 'lucide-react';

import { UserProfile, Habit, Note, TaskList, PhotoFolder, CalendarEvent, Reminder, Goal } from './types';
import { 
  DEFAULT_USER, 
  DEFAULT_HABITS, 
  DEFAULT_NOTES, 
  DEFAULT_TASKS, 
  DEFAULT_PHOTOS, 
  DEFAULT_CALENDAR, 
  DEFAULT_REMINDERS, 
  DEFAULT_GOALS, 
  getTodayStr 
} from './initialData';

// Component Imports
import Dashboard from './components/Dashboard';
import Habits from './components/Habits';
import Notes from './components/Notes';
import TodoList from './components/TodoList';
import PhotoAlbum from './components/PhotoAlbum';
import CalendarView from './components/CalendarView';
import Reminders from './components/Reminders';
import Goals from './components/Goals';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Today and Yesterday String Calculation for default states
  const todayStr = getTodayStr();
  const dYes = new Date();
  dYes.setDate(dYes.getDate() - 1);
  const mStr = String(dYes.getMonth() + 1).padStart(2, '0');
  const dStr = String(dYes.getDate()).padStart(2, '0');
  const yesterdayStr = `${dYes.getFullYear()}-${mStr}-${dStr}`;

  // State definitions from localStorage fallback to initial samples
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lumina_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lumina_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS(todayStr, yesterdayStr);
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('lumina_notes');
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [taskLists, setTaskLists] = useState<TaskList[]>(() => {
    const saved = localStorage.getItem('lumina_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [folders, setFolders] = useState<PhotoFolder[]>(() => {
    const saved = localStorage.getItem('lumina_photos');
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('lumina_calendar');
    return saved ? JSON.parse(saved) : DEFAULT_CALENDAR(todayStr);
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('lumina_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('lumina_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  // Keep Syncing variables to local storage automatically on states mutate
  useEffect(() => {
    localStorage.setItem('lumina_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lumina_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lumina_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('lumina_tasks', JSON.stringify(taskLists));
  }, [taskLists]);

  useEffect(() => {
    localStorage.setItem('lumina_photos', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('lumina_calendar', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('lumina_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('lumina_goals', JSON.stringify(goals));
  }, [goals]);

  // Track midnight reset for habits history tracking logs
  useEffect(() => {
    const lastReset = localStorage.getItem('lumina_last_habit_reset');
    if (lastReset !== todayStr) {
      localStorage.setItem('lumina_last_habit_reset', todayStr);
      // We don't delete history, because our history is keyed YYYY-MM-DD.
      // But we can clean entries older than 30 days if desired in larger scale apps.
    }
  }, [todayStr]);

  // Handle Sophisticated Dark design theme styling variables mapping
  const isLightStr = false;
  
  const outerBg = 'bg-[#0F0F14] text-[#F0EFF8]';
  const sidebarStyles = 'bg-[#1A1A24]/90 border-r border-[#7C6AF7]/15 text-[#F0EFF8] backdrop-blur-xl';
  const headerStyles = 'bg-[#12121C]/80 border-b border-[#7C6AF7]/10 backdrop-blur-md';

  // Sidebar navigation options list
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'habits', label: 'Hábitos', icon: Check },
    { id: 'notes', label: 'Pensamientos', icon: FileText },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'photos', label: 'Álbum', icon: ImageIcon },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'reminders', label: 'Instantes', icon: Bell },
    { id: 'goals', label: 'Objetivos', icon: Target }
  ];

  const handleNavigate = (sec: string) => {
    setActiveSection(sec);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${outerBg} transition-all-custom font-sans flex flex-col`}>
      
      {/* Mobile Top Header (only visible on mobile lg:hidden) */}
      <header className={`lg:hidden h-16 shrink-0 flex items-center justify-between px-5 sticky top-0 z-40 ${headerStyles} transition-all-custom`}>
        <div className="flex items-center gap-2.5">
          {/* Settings Bubble access left */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full overflow-hidden border border-[#7C6AF7]/40 relative active:scale-95 cursor-pointer shrink-0"
          >
            <img src={user.avatar} alt="Me" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </button>
          <span className="font-serif text-lg font-bold text-[#7C6AF7] tracking-wider select-none">
            {user.appName}
          </span>
        </div>

        {/* Small inline settings gear right */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isLightStr ? 'bg-black/5 text-[#1C1C24]' : 'bg-white/5 text-[#8A89A0]'
          }`}
          title="Configurar"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        {/* DESKTOP SIDEBAR PANEL (left side, fixed, hidden on mobile) */}
        <aside className={`hidden lg:flex flex-col justify-between w-[240px] shrink-0 h-screen sticky top-0 z-30 ${sidebarStyles} px-4 py-8 transition-all-custom`}>
          
          <div className="flex flex-col flex-1 h-full">
            {/* Sophisticated Dark Logo & Profile centering */}
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-serif italic mb-2 tracking-widest text-[#7C6AF7]">{user.appName}</div>
              <div className="w-16 h-16 rounded-full border-2 border-[#7C6AF7]/40 p-1 mb-4 shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer" 
                  className="w-full h-full rounded-full object-cover bg-[#0F0F14]" 
                />
              </div>
              <div className="text-xs font-bold uppercase tracking-[3px] text-[#8A89A0] truncate max-w-full">{user.name}</div>
            </div>

            {/* Navigation links block */}
            <nav className="flex-1 space-y-2 mt-6">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#7C6AF7]/10 border-l-[3px] border-[#7C6AF7] text-[#7C6AF7] rounded-r-lg font-semibold' 
                        : 'text-[#8A89A0] hover:text-[#F0EFF8] hover:bg-[#22222F] rounded-lg'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 mr-1 ${isActive ? 'text-[#7C6AF7]' : 'text-[#8A89A0]'}`} />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Lower setting buttons */}
          <div className="border-t border-[#7C6AF7]/10 pt-4 px-2">
            <button
               onClick={() => setIsSettingsOpen(true)}
               className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-[#8A89A0] hover:text-[#F0EFF8] hover:bg-white/5 rounded-xl cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="font-medium">Ajustes de Perfil</span>
            </button>
          </div>

        </aside>

        {/* CONTAINER WORKSPACE FOR RENDERING MODULES */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-12 h-auto">
          {activeSection === 'dashboard' && (
            <Dashboard 
              user={user}
              habits={habits}
              taskLists={taskLists}
              events={events}
              reminders={reminders}
              goals={goals}
              onNavigate={handleNavigate}
            />
          )}

          {activeSection === 'habits' && (
            <Habits 
              habits={habits}
              onUpdateHabits={setHabits}
            />
          )}

          {activeSection === 'notes' && (
            <Notes 
              notes={notes}
              onUpdateNotes={setNotes}
            />
          )}

          {activeSection === 'tasks' && (
            <TodoList 
              taskLists={taskLists}
              onUpdateTaskLists={setTaskLists}
            />
          )}

          {activeSection === 'photos' && (
            <PhotoAlbum 
              folders={folders}
              onUpdateFolders={setFolders}
            />
          )}

          {activeSection === 'calendar' && (
            <CalendarView 
              events={events}
              onUpdateEvents={setEvents}
            />
          )}

          {activeSection === 'reminders' && (
            <Reminders 
              reminders={reminders}
              onUpdateReminders={setReminders}
            />
          )}

          {activeSection === 'goals' && (
            <Goals 
              goals={goals}
              onUpdateGoals={setGoals}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile screens) */}
      <nav className={`lg:hidden fixed bottom-x-0 bottom-0 left-0 right-0 h-16 bg-[#12121C] border-t border-[#7C6AF7]/15 z-45 grid grid-cols-8 items-center px-2 shadow-2xl backdrop-blur-lg`}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="flex flex-col items-center justify-center p-2 text-center select-none active:scale-95 cursor-pointer"
              style={{ minHeight: '44px', minWidth: '44px' }}
              title={item.label}
            >
              <IconComponent 
                className={`w-5 h-5 ${isActive ? 'text-[#7C6AF7] scale-110 stroke-[2.5px]' : 'text-[#8A89A0]'}`} 
              />
              <span className={`text-[8px] truncate max-w-full font-medium ${isActive ? 'text-[#7C6AF7]' : 'text-[#8A89A0]'}`}>
                {item.label.substring(0, 5)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* RENDER PROFILE AND BRANDSETTINGS MODAL */}
      <SettingsModal 
        user={user}
        onUpdateUser={setUser}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
