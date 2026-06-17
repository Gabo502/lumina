import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Clock, Trash2, Edit2, Sliders, Play, Pause, Award, Sparkles, CheckSquare } from 'lucide-react';
import { Goal, GoalStep } from '../types';

interface GoalsProps {
  goals: Goal[];
  onUpdateGoals: (newGoals: Goal[]) => void;
}

export default function Goals({ goals, onUpdateGoals }: GoalsProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'progress' | 'completed' | 'paused'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'progress' | 'completed' | 'paused'>('progress');
  const [manualProgress, setManualProgress] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Custom temporary steps input separated by commas or lines
  const [stepsInput, setStepsInput] = useState('');

  // Celebration state
  const [celebratingGoalId, setCelebratingGoalId] = useState<string | null>(null);

  // Card subtask inline adder
  const [inlineStepText, setInlineStepText] = useState<{ [goalId: string]: string }>({});

  // Deletions
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setStatus('progress');
    setManualProgress(0);
    setNotes('');
    setStepsInput('');
    setShowModal(false);
  };

  // Trigger celebration on 100%
  const triggerCelebration = (goalId: string) => {
    setCelebratingGoalId(goalId);
    setTimeout(() => {
      setCelebratingGoalId(null);
    }, 4000);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Parse initial steps
    const parsedSteps: GoalStep[] = stepsInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, i) => ({
        id: 'step_' + Date.now() + '_' + i,
        text: line,
        completed: false
      }));

    // Calculate progress: if there are steps, it uses steps. Otherwise, manual progress value
    const finalProg = parsedSteps.length > 0 ? 0 : manualProgress;
    const finalStatus = finalProg === 100 ? 'completed' : status;

    const newGoal: Goal = {
      id: 'goal_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || undefined,
      status: finalStatus,
      progress: finalProg,
      steps: parsedSteps,
      notes: notes.trim() || undefined
    };

    onUpdateGoals([newGoal, ...goals]);
    
    if (finalProg === 100) {
      triggerCelebration(newGoal.id);
    }

    resetForm();
  };

  // Toggle Goal Sub-task Step Completion
  const handleToggleStep = (goalId: string, stepId: string) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const stepsCopy = g.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
        
        // Recalculate percent based on steps completed
        const completedCount = stepsCopy.filter(s => s.completed).length;
        const totalCount = stepsCopy.length;
        const newPct = Math.round((completedCount / totalCount) * 100);
        
        // If it newly reached 100%, trigger confetti celebration!
        const beforePct = g.progress;
        const wasCompleted = g.status === 'completed';
        const isCompletedNow = newPct === 100;

        let finalStatus = g.status;
        if (isCompletedNow) {
          finalStatus = 'completed';
        } else if (g.status === 'completed') {
          // If was complete, but they unchecked a step, dial back status to progress
          finalStatus = 'progress';
        }

        if (isCompletedNow && beforePct < 100) {
          triggerCelebration(goalId);
        }

        return {
          ...g,
          steps: stepsCopy,
          progress: newPct,
          status: finalStatus
        };
      }
      return g;
    });

    onUpdateGoals(updated);
  };

  // Add sub-task action inline to an existing goal card
  const handleAddInlineStep = (goalId: string) => {
    const text = inlineStepText[goalId] || '';
    if (!text.trim()) return;

    const updated = goals.map(g => {
      if (g.id === goalId) {
        const newStep: GoalStep = {
          id: 'step_inline_' + Date.now(),
          text: text.trim(),
          completed: false
        };
        const stepsCopy = [...g.steps, newStep];
        
        // Recalculate percent
        const completedCount = stepsCopy.filter(s => s.completed).length;
        const totalCount = stepsCopy.length;
        const newPct = Math.round((completedCount / totalCount) * 100);

        return {
          ...g,
          steps: stepsCopy,
          progress: newPct,
          status: newPct === 100 ? 'completed' : g.status === 'completed' ? 'progress' : g.status
        };
      }
      return g;
    });

    onUpdateGoals(updated);
    setInlineStepText({ ...inlineStepText, [goalId]: '' });
  };

  // Modify manual progress slider directly (only for goals without sub-steps)
  const handleUpdateManualProgress = (goalId: string, val: number) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const wasCompleted = g.status === 'completed';
        const isCompletedNow = val === 100;
        let finalStatus = g.status;
        if (isCompletedNow) {
          finalStatus = 'completed';
        } else if (wasCompleted) {
          finalStatus = 'progress';
        }

        if (isCompletedNow && g.progress < 100) {
          triggerCelebration(goalId);
        }

        return {
          ...g,
          progress: val,
          status: finalStatus
        };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  // Change Status value directly from Card toggle
  const handleUpdateStatus = (goalId: string, newStatus: Goal['status']) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : g.progress === 100 ? 90 : g.progress
        };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  // Update inline card notes
  const handleUpdateGoalNotes = (goalId: string, text: string) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, notes: text || undefined };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  // Clear single goal
  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId);
    onUpdateGoals(updated);
    setConfirmDeleteId(null);
  };

  // Stat computations
  const totalCount = goals.length;
  const completedCount = goals.filter(g => g.status === 'completed' || g.progress === 100).length;

  // Filter goals
  const filteredGoals = goals.filter(g => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'progress') return g.status === 'progress';
    if (activeFilter === 'completed') return g.status === 'completed';
    if (activeFilter === 'paused') return g.status === 'paused';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section with Stats layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">NORTE Y DIRECCIÓN</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Nuestros Objetivos</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Establece tus grandes metas de vida, detalla los pasos para lograrlas y monitoriza tu persistencia mental.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          Establecer Meta
        </button>
      </div>

      {/* Stats Board at top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#1A1A24] border border-[#7C6AF7]/15 p-5 rounded-2xl shadow-md items-center">
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8A89A0]">RESUMEN GLOBAL</span>
          <h3 className="font-serif text-xl font-bold text-[#F0EFF8] mt-1">
            {completedCount} de {totalCount} metas logradas
          </h3>
          <p className="text-xs text-[#8A89A0] mt-0.5">¡Apunta alto y avanza paso a paso!</p>
        </div>

        {/* Global Progress bar */}
        <div className="sm:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#8A89A0]">Progreso General</span>
            <span className="text-[#5BC9A0] font-mono">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 w-full bg-[#22222F] rounded-full overflow-hidden border border-[#7C6AF7]/10">
            <div 
              className="h-full bg-gradient-to-r from-[#7C6AF7] via-[#F7A26A] to-[#5BC9A0] rounded-full transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter tabs row */}
      <div className="flex flex-wrap gap-2 border-b border-[#7C6AF7]/10 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeFilter === 'all' 
              ? 'bg-[#7C6AF7] text-[#F0EFF8] font-bold shadow-md' 
              : 'text-[#8A89A0] hover:text-white'
          }`}
        >
          🎯 Todos
        </button>
        <button
          onClick={() => setActiveFilter('progress')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeFilter === 'progress' 
              ? 'bg-[#7C6AF7] text-[#F0EFF8] font-bold shadow-md' 
              : 'text-[#8A89A0] hover:text-white'
          }`}
        >
          🔄 En progreso
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeFilter === 'completed' 
              ? 'bg-[#7C6AF7] text-[#F0EFF8] font-bold shadow-md' 
              : 'text-[#8A89A0] hover:text-white'
          }`}
        >
          ✅ Completado
        </button>
        <button
          onClick={() => setActiveFilter('paused')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeFilter === 'paused' 
              ? 'bg-[#7C6AF7] text-[#F0EFF8] font-bold shadow-md' 
              : 'text-[#8A89A0] hover:text-white'
          }`}
        >
          ⏸ En pausa
        </button>
      </div>

      {/* Grid listing of goals */}
      {filteredGoals.length === 0 ? (
        <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl py-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-4xl text-[#8A89A0]/60">🏆</div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold select-none">No se encontraron metas en esta sección</h3>
            <p className="text-xs text-[#8A89A0] max-w-sm mx-auto px-4">Divide tus aspiraciones en metas cortas y añade sub-tareas paso a paso para que sientas fluir cada avance.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Añadir mi primera meta +
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {filteredGoals.map((goal) => {
            const hasSteps = goal.steps.length > 0;
            const completedSteps = goal.steps.filter(s => s.completed).length;
            const totalSteps = goal.steps.length;

            return (
              <div
                key={goal.id}
                className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-5 transition-all relative overflow-hidden group hover:border-[#7C6AF7]/25"
              >
                {/* Visual node background glow */}
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-32 h-32 bg-[#7C6AF7]/5 rounded-full blur-2xl pointer-events-none" />

                {/* Card header row status tags and dates */}
                <div className="flex justify-between items-start gap-4">
                  {/* Status switches */}
                  <div className="flex gap-1.5 shrink-0 select-none">
                    <button
                      onClick={() => handleUpdateStatus(goal.id, 'progress')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                        goal.status === 'progress' 
                          ? 'bg-[#7C6AF7]/20 border border-[#7C6AF7]/60 text-[#7C6AF7]' 
                          : 'bg-[#22222F] border border-transparent text-[#8A89A0] hover:text-white'
                      }`}
                    >
                      🔄 progreso
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(goal.id, 'completed')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                        goal.status === 'completed' 
                          ? 'bg-[#5BC9A0]/20 border border-[#5BC9A0]/60 text-[#5BC9A0]' 
                          : 'bg-[#22222F] border border-transparent text-[#8A89A0] hover:text-white'
                      }`}
                    >
                      ✅ completado
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(goal.id, 'paused')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                        goal.status === 'paused' 
                          ? 'bg-[#F7A26A]/20 border border-[#F7A26A]/60 text-[#F7A26A]' 
                          : 'bg-[#22222F] border border-transparent text-[#8A89A0] hover:text-white'
                      }`}
                    >
                      ⏸ pausa
                    </button>
                  </div>

                  {/* Deadline text info and Trash */}
                  <div className="flex items-center gap-2 relative">
                    {goal.deadline && (
                      <span className="text-[10px] font-mono text-[#8A89A0] flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-[#F7A26A]" />
                        Plazo: {goal.deadline.split('-').reverse().join('/')}
                      </span>
                    )}

                    {confirmDeleteId === goal.id ? (
                      <div className="absolute right-0 top-0 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1 z-15 shadow-xl text-[9px] whitespace-nowrap">
                        <span className="text-[#EF4444]">¿Borrar?</span>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded font-bold"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded font-bold"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8A89A0] hover:text-[#EF4444] hover:bg-[#22222F] rounded-lg transition-colors cursor-pointer"
                        title="Borrar objetivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & long description */}
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-[#F0EFF8] leading-snug">
                    {goal.title}
                  </h3>
                  <p className="text-xs text-[#8A89A0] leading-relaxed">
                    {goal.description}
                  </p>
                </div>

                {/* Progress bar container */}
                <div className="space-y-2 pb-1 border-b border-[#7C6AF7]/5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#8A89A0]">Nivel de Consolidación</span>
                    <span className="text-[#F7A26A] font-mono">{goal.progress}%</span>
                  </div>

                  <div className="h-2 w-full bg-[#22222F] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A] rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Manual Slider if there are NO Steps */}
                  {!hasSteps ? (
                    <div className="pt-2 flex items-center gap-3">
                      <Sliders className="w-3.5 h-3.5 text-[#8A89A0] shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleUpdateManualProgress(goal.id, Number(e.target.value))}
                        className="flex-1 accent-[#7C6AF7] h-1"
                      />
                      <span className="text-[10px] text-[#8A89A0] font-mono italic shrink-0">(Actualizar manual)</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8A89A0] italic mt-1 font-sans">
                      * El progreso se autocalcula de tu lista de checkpoints ({completedSteps} de {totalSteps} completados)
                    </p>
                  )}
                </div>

                {/* Subtask Section: Action Checklist */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8A89A0] flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#7C6AF7]" />
                    Pasos para lograrlo ({completedSteps}/{totalSteps})
                  </h4>

                  <div className="space-y-2">
                    {goal.steps.map((step) => (
                      <div 
                        key={step.id}
                        className="flex items-center gap-2.5 p-2 bg-[#22222F]/40 border border-[#7C6AF7]/5 rounded-xl text-xs"
                      >
                        <button
                          onClick={() => handleToggleStep(goal.id, step.id)}
                          className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                            step.completed 
                              ? 'bg-[#5BC9A0] border-[#5BC9A0] text-[#0F0F14]' 
                              : 'border-[#8A89A0]/35 hover:border-[#7C6AF7]'
                          }`}
                        >
                          {step.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                        </button>
                        <span className={`flex-1 font-sans truncate ${step.completed ? 'text-[#8A89A0] line-through' : 'text-[#F0EFF8] font-medium'}`}>
                          {step.text}
                        </span>
                      </div>
                    ))}

                    {/* Inline subtask inline adder form */}
                    <div className="flex gap-2 pt-1 font-sans">
                      <input
                        type="text"
                        maxLength={40}
                        placeholder="Agregar paso concreto..."
                        value={inlineStepText[goal.id] || ''}
                        onChange={(e) => setInlineStepText({ ...inlineStepText, [goal.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddInlineStep(goal.id);
                        }}
                        className="flex-1 bg-[#1A1A24]/50 border border-[#7C6AF7]/15 rounded-xl px-3 py-1.5 text-xs text-[#F0EFF8]"
                      />
                      <button
                        onClick={() => handleAddInlineStep(goal.id)}
                        className="px-3 py-1.5 bg-[#22222F] hover:bg-[#7C6AF7]/10 border border-[#7C6AF7]/20 hover:border-[#7C6AF7]/50 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Card Notes section */}
                <div className="space-y-1 pb-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#8A89A0] block">
                    Notas y Aprendizajes sobre esta meta
                  </label>
                  <textarea
                    rows={2}
                    maxLength={180}
                    placeholder="Escribe avances informales, dificultades superadas o insights sobre tu proceso..."
                    value={goal.notes || ''}
                    onChange={(e) => handleUpdateGoalNotes(goal.id, e.target.value)}
                    className="w-full bg-[#2a2a38]/40 border border-[#7C6AF7]/10 focus:border-[#7C6AF7]/30 rounded-xl px-3.5 py-2 text-xs text-[#F0EFF8]/85 outline-none font-medium resize-none"
                  />
                </div>

                {/* Full screen floating custom Emoji celebration shower */}
                {celebratingGoalId === goal.id && (
                  <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
                    {/* Floating elements styling animation */}
                    <div className="absolute top-1/4 animate-bounce text-6xl text-center flex gap-6">
                      <span className="scale-125 transform rotate-12 transition-all">🎉</span>
                      <span className="scale-150 transform -rotate-12 transition-all">🥳</span>
                      <span className="scale-125 transform rotate-6 transition-all">🏆</span>
                      <span className="scale-150 transform -rotate-6 transition-all">🏅</span>
                      <span className="scale-110 transform rotate-45 transition-all">🚀</span>
                    </div>
                    {/* Glowing card border overlay trigger */}
                    <div className="absolute inset-x-0 inset-y-0 border-8 border-dashed border-[#5BC9A0]/40 rounded-3xl animate-pulse" />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE META MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                Nuevo Horizonte ✦
              </h3>
              <button 
                onClick={resetForm} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Título de la meta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salud Integral, Aprender React Avanzado, Ahorrar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Descripción larga (Por qué de tu meta y cómo te transformará)
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder="Explica qué quieres lograr, por qué es de crucial bienestar para tu vida y qué te motivará..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold resize-none"
                />
              </div>

              {/* Deadline & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-3 py-2 text-[#F0EFF8] outline-none text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                    Estado inicial
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-3 py-2 text-[#F0EFF8] outline-none text-xs font-bold"
                  >
                    <option value="progress">🔄 En Progreso</option>
                    <option value="completed">✅ Completado</option>
                    <option value="paused">⏸ En Pausa</option>
                  </select>
                </div>
              </div>

              {/* Action checklist checklist lines */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
                  <span>Pasos para lograrlo (cada renglón es un paso)</span>
                  <span className="text-[#8A89A0]/50 text-[10px]">(Opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`Ej: Comprar balanza nutricional&#10;Consultar nutricionista&#10;Hacer comidas preparadas los domingos`}
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-xs resize-none"
                />
              </div>

              {/* Manual Progress Slider (Only if NO steps parsed) */}
              {stepsInput.trim().length === 0 && (
                <div className="bg-[#22222F]/40 border border-[#7C6AF7]/10 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#8A89A0]">Progreso inicial</span>
                    <span className="text-[#F7A26A] font-mono font-bold">{manualProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={manualProgress}
                    onChange={(e) => setManualProgress(Number(e.target.value))}
                    className="w-full accent-[#7C6AF7]"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Notas / Reflexiones iniciales
                </label>
                <input
                  type="text"
                  placeholder="Inscripciones adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-xs text-[#F0EFF8]"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#7C6AF7]/15">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-[#22222F] border border-[#7C6AF7]/15 text-[#8A89A0] text-xs font-semibold rounded-lg hover:text-[#F0EFF8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Agregar Meta
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
