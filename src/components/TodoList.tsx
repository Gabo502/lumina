import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Check, AlertCircle, ArrowUp, ArrowDown, ListPlus } from 'lucide-react';
import { TaskList, TaskItem } from '../types';

interface TodoListProps {
  taskLists: TaskList[];
  onUpdateTaskLists: (newLists: TaskList[]) => void;
}

const LIST_COLORS = ["#7C6AF7", "#5BC9A0", "#F7A26A", "#EC4899", "#3B82F6", "#EF4444"];

export default function TodoList({ taskLists, onUpdateTaskLists }: TodoListProps) {
  const [activeListId, setActiveListId] = useState<string>(taskLists[0]?.id || '');
  const [showAddList, setShowAddList] = useState(false);
  
  // New List Form Fields
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#7C6AF7');

  // New Task Form Fields
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Trash popup flags
  const [confirmDeleteListId, setConfirmDeleteListId] = useState<string | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const activeList = taskLists.find(l => l.id === activeListId) || taskLists[0];

  // Change active list
  const handleSelectList = (id: string) => {
    setActiveListId(id);
    setConfirmDeleteListId(null);
  };

  // Create list
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList: TaskList = {
      id: 'lst_' + Date.now(),
      name: newListName.trim(),
      color: newListColor,
      tasks: []
    };

    const updated = [...taskLists, newList];
    onUpdateTaskLists(updated);
    setActiveListId(newList.id);
    setNewListName('');
    setNewListColor('#7C6AF7');
    setShowAddList(false);
  };

  // Delete entire active list
  const handleDeleteActiveList = () => {
    if (taskLists.length <= 1) return; // Must have at least one list left
    
    const updated = taskLists.filter(l => l.id !== activeList.id);
    onUpdateTaskLists(updated);
    setActiveListId(updated[0].id);
    setConfirmDeleteListId(null);
  };

  // Add Task to active list
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !activeList) return;

    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      text: taskText.trim(),
      priority,
      completed: false,
      dueDate: dueDate || undefined
    };

    const updated = taskLists.map(list => {
      if (list.id === activeList.id) {
        return {
          ...list,
          tasks: [newTask, ...list.tasks]
        };
      }
      return list;
    });

    onUpdateTaskLists(updated);
    setTaskText('');
    setPriority('medium');
    setDueDate('');
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    const updated = taskLists.map(list => {
      if (list.id === activeList.id) {
        return {
          ...list,
          tasks: list.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return list;
    });
    onUpdateTaskLists(updated);
  };

  // Delete single task
  const handleDeleteTask = (taskId: string) => {
    const updated = taskLists.map(list => {
      if (list.id === activeList.id) {
        return {
          ...list,
          tasks: list.tasks.filter(t => t.id !== taskId)
        };
      }
      return list;
    });
    onUpdateTaskLists(updated);
    setTaskToDeleteId(null);
  };

  // Clear completed tasks from active list
  const handleClearCompleted = () => {
    const updated = taskLists.map(list => {
      if (list.id === activeList.id) {
        return {
          ...list,
          tasks: list.tasks.filter(t => !t.completed)
        };
      }
      return list;
    });
    onUpdateTaskLists(updated);
  };

  // Drag and Drop native APIs implementation
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const listTasks = [...activeList.tasks];
    const draggedItem = listTasks[draggedIndex];
    listTasks.splice(draggedIndex, 1);
    listTasks.splice(index, 0, draggedItem);

    const updated = taskLists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, tasks: listTasks };
      }
      return list;
    });

    onUpdateTaskLists(updated);
    setDraggedIndex(null);
  };

  // Sort tasks: put completed tasks at the very bottom
  // but let uncompleted tasks keep their ordered state
  const getSortedTasks = (): { task: TaskItem; originalIndex: number }[] => {
    if (!activeList) return [];
    
    // Map tasks with their original index to respect drag order accurately
    const indexed = activeList.tasks.map((task, originalIndex) => ({ task, originalIndex }));
    
    const uncompleted = indexed.filter(item => !item.task.completed);
    const completed = indexed.filter(item => item.task.completed);
    
    return [...uncompleted, ...completed];
  };

  const sortedTasksAndIndexes = getSortedTasks();
  const pendingCount = activeList?.tasks.filter(t => !t.completed).length || 0;

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">GESTIÓN DE ENFOQUE</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Listas de Tareas</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Define prioridades, agrupa tus pendientes por áreas y mantén el control de tu agenda diaria.</p>
        </div>
        <button
          onClick={() => setShowAddList(true)}
          className="flex items-center justify-center gap-2 bg-[#22222F] border border-[#7C6AF7]/20 hover:border-[#7C6AF7]/60 hover:bg-[#7C6AF7]/10 text-[#F0EFF8] text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 self-start md:self-auto"
        >
          <ListPlus className="w-4 h-4 text-[#F7A26A]" />
          Nueva lista
        </button>
      </div>

      {/* Lists Tabs Container */}
      <div className="space-y-4">
        {/* Horizontal tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#7C6AF7]/10 pb-2">
          {taskLists.map((list) => {
            const isActive = list.id === activeListId;
            const listPending = list.tasks.filter(t => !t.completed).length;

            return (
              <button
                key={list.id}
                onClick={() => handleSelectList(list.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'text-[#F0EFF8] shadow-md border' 
                    : 'bg-[#1A1A24]/60 text-[#8A89A0] hover:text-[#F0EFF8] border border-transparent'
                }`}
                style={{
                  backgroundColor: isActive ? `${list.color}25` : undefined,
                  borderColor: isActive ? list.color : undefined
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: list.color }} />
                <span>{list.name}</span>
                {listPending > 0 && (
                  <span className="bg-[#0F0F14]/70 px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ color: list.color }}>
                    {listPending}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main active List panel */}
      {activeList ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Task listing & order (8 columns) */}
          <div className="lg:col-span-8 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeList.color }} />
                <h2 className="font-serif text-xl font-medium">{activeList.name}</h2>
                <span className="text-xs px-2.5 py-0.5 bg-[#22222F] text-[#8A89A0] font-mono rounded-full">
                  {pendingCount} pendientes
                </span>
              </div>

              {/* Utility actions on active list */}
              <div className="flex items-center gap-4 relative">
                {activeList.tasks.some(t => t.completed) && (
                  <button
                    onClick={handleClearCompleted}
                    className="text-xs font-semibold text-[#8A89A0] hover:text-[#EF4444] transition-colors cursor-pointer"
                  >
                    Limpiar completadas
                  </button>
                )}

                {/* Trash current List entirely */}
                {taskLists.length > 1 && (
                  <>
                    {confirmDeleteListId === activeList.id ? (
                      <div className="absolute right-0 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-2 flex items-center gap-2 z-10 shadow-xl text-xs whitespace-nowrap">
                        <span className="text-[#EF4444] font-medium">¿Eliminar {activeList.name}?</span>
                        <button
                          onClick={handleDeleteActiveList}
                          className="px-2 py-0.5 bg-[#EF4444] text-[#F0EFF8] text-[10px] font-bold rounded cursor-pointer"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDeleteListId(null)}
                          className="px-2 py-0.5 bg-[#22222F] text-[#8A89A0] text-[10px] font-bold rounded border border-[#7C6AF7]/15 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteListId(activeList.id)}
                        className="p-1.5 text-[#8A89A0] hover:text-[#EF4444] hover:bg-[#22222F] rounded-lg transition-colors cursor-pointer"
                        title="Eliminar esta lista completa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Todo items */}
            {activeList.tasks.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="text-4xl text-[#8A89A0]/50">✓</div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#F0EFF8]">Lista limpia</p>
                  <p className="text-xs text-[#8A89A0] max-w-xs mx-auto">No hay tareas pendientes en esta lista. Escribe una tarea a la derecha para empezar.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[10px] text-[#8A89A0] italic">
                  * Arrastra y suelta para reordenar las tareas pendientes
                </p>
                
                <ul className="space-y-2.5">
                  {sortedTasksAndIndexes.map(({ task, originalIndex }, displayIndex) => {
                    const isDone = task.completed;
                    
                    const priorityColor = 
                      task.priority === 'high' ? 'bg-[#EF4444] text-white' : 
                      task.priority === 'medium' ? 'bg-[#F7A26A] text-[#0F0F14]' : 
                      'bg-[#5BC9A0] text-[#0F0F14]';

                    const priorityLabel = 
                      task.priority === 'high' ? 'Alta' : 
                      task.priority === 'medium' ? 'Media' : 'Baja';

                    return (
                      <li
                        key={task.id}
                        draggable={!isDone}
                        onDragStart={(e) => handleDragStart(e, originalIndex)}
                        onDragOver={(e) => handleDragOver(e, originalIndex)}
                        onDrop={(e) => handleDrop(e, originalIndex)}
                        className={`flex items-center justify-between p-4 bg-[#22222F]/90 border rounded-xl group transition-all duration-300 ${
                          isDone 
                            ? 'opacity-55 border-transparent task-completed hover:bg-[#22222F]/70' 
                            : 'border-[#7C6AF7]/10 hover:border-[#7C6AF7]/30 hover:bg-[#22222F] cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-4">
                          {/* Toggle checkbox */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer ${
                              isDone 
                                ? 'text-[#0F0F14]' 
                                : 'border-[#8A89A0]/35 hover:border-[#7C6AF7]'
                            }`}
                            style={{ 
                              backgroundColor: isDone ? activeList.color : 'transparent',
                              borderColor: isDone ? activeList.color : undefined
                            }}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>

                          {/* Task details wrapper */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <p 
                              className={`text-[14px] font-sans task-line-through transition-colors truncate ${
                                isDone ? 'text-[#8A89A0] line-through' : 'text-[#F0EFF8] font-medium'
                              }`}
                            >
                              {task.text}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              {/* Priority label */}
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityColor}`}>
                                {priorityLabel}
                              </span>

                              {/* Due date */}
                              {task.dueDate && (
                                <span className="text-[10px] text-[#8A89A0] font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3 opacity-60" />
                                  Vence: {task.dueDate.split('-').reverse().join('/')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inline Task Actions */}
                        <div className="flex items-center shrink-0 relative">
                          {taskToDeleteId === task.id ? (
                            <div className="absolute right-0 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1 z-10 shadow-xl text-[10px] whitespace-nowrap">
                              <span className="text-[#EF4444] font-medium">¿Borrar?</span>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-1.5 py-0.5 bg-[#EF4444] text-[#F0EFF8] font-bold rounded"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setTaskToDeleteId(null)}
                                className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] font-bold rounded"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setTaskToDeleteId(task.id)}
                              className="p-1.5 text-[#8A89A0] hover:text-[#EF4444] opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Borrar tarea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Right panel: Add task inputs (4 columns) */}
          <div className="lg:col-span-4 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-medium border-b border-[#7C6AF7]/10 pb-2">
              Añadir Tarea
            </h3>

            <form onSubmit={handleAddTask} className="space-y-4.5">
              {/* Task text */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Nombre de la tarea
                </label>
                <textarea
                  required
                  placeholder="Ej: Rediseñar landing de Lumina, Hacer las compras..."
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold resize-none"
                />
              </div>

              {/* Priority select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans block mb-1">
                  Nivel de Prioridad
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => {
                    const isSelected = priority === p;
                    const styleCol = 
                      p === 'high' ? 'border-[#EF4444] text-[#EF4444]' : 
                      p === 'medium' ? 'border-[#F7A26A] text-[#F7A26A]' : 'border-[#5BC9A0] text-[#5BC9A0]';

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all text-center cursor-pointer ${
                          isSelected 
                            ? `${styleCol} bg-${p === 'high' ? '[#EF4444]' : p === 'medium' ? '[#F7A26A]' : '[#5BC9A0]'}/15` 
                            : 'border-transparent bg-[#22222F] text-[#8A89A0] hover:text-[#F0EFF8]'
                        }`}
                      >
                        {p === 'high' ? '🔴 Alta' : p === 'medium' ? '🟡 Media' : '🟢 Baja'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date picker */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
                  <span>Vencimiento</span>
                  <span className="text-[#8A89A0]/50 text-[9px]">(Opcional)</span>
                </label>
                <input
                  type="date"
                  placeholder="Selecciona fecha..."
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-bold uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5px]" />
                Insertar Tarea
              </button>
            </form>
          </div>

        </div>
      ) : null}

      {/* Add New List Modal */}
      {showAddList && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                Crear Nueva Lista ✦
              </h3>
              <button 
                onClick={() => setShowAddList(false)} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4.5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Nombre de la lista
                </label>
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="Ej: Trabajo, Gimnasio, Compras, Proyecto X..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium"
                />
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Color de distincción
                </label>
                <div className="flex gap-2 text-center items-center">
                  {LIST_COLORS.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewListColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${newListColor === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-85 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Form actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#7C6AF7]/15">
                <button
                  type="button"
                  onClick={() => setShowAddList(false)}
                  className="px-4 py-2 bg-[#22222F] border border-[#7C6AF7]/15 text-[#8A89A0] text-xs font-semibold rounded-lg hover:text-[#F0EFF8] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Crear Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
