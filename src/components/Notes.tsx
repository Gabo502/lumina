import React, { useState } from 'react';
import { Search, Plus, Pin, Trash2, Edit2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Note } from '../types';

interface NotesProps {
  notes: Note[];
  onUpdateNotes: (newNotes: Note[]) => void;
}

const PASTEL_DARK_COLORS = [
  { hex: "#2C224E", label: "Dusk Violet" },
  { hex: "#1E332E", label: "Moss Green" },
  { hex: "#352A1E", label: "Amber Orange" },
  { hex: "#1E2D3D", label: "Deep Sea" },
  { hex: "#3D1E2D", label: "Plum Berry" },
  { hex: "#22222F", label: "Default Dark" }
];

export default function Notes({ notes, onUpdateNotes }: NotesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#2C224E');
  const [pinned, setPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Trash Confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor('#2C224E');
    setPinned(false);
    setTagInput('');
    setEditingNote(null);
    setShowModal(false);
  };

  const handleStartCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('#2C224E');
    setPinned(false);
    setTagInput('');
    setShowModal(true);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setPinned(note.pinned);
    setTagInput(note.tags.join(', '));
    setShowModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    // Parse tag input: comma separated strings
    const parsedTags = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const nowIso = new Date().toISOString();

    if (editingNote) {
      // Edit
      const updated = notes.map(n => {
        if (n.id === editingNote.id) {
          return {
            ...n,
            title: title.trim() || 'Sin Título',
            content: content.trim(),
            color,
            pinned,
            tags: parsedTags,
            updatedAt: nowIso
          };
        }
        return n;
      });
      onUpdateNotes(updated);
    } else {
      // Create
      const newNote: Note = {
        id: 'note_' + Date.now(),
        title: title.trim() || 'Sin Título',
        content: content.trim(),
        color,
        pinned,
        tags: parsedTags,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      onUpdateNotes([newNote, ...notes]);
    }
    resetForm();
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter(n => n.id !== noteId);
    onUpdateNotes(updated);
    setConfirmDeleteId(null);
  };

  const handleTogglePin = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    const updated = notes.map(n => {
      if (n.id === noteId) {
        return { ...n, pinned: !n.pinned };
      }
      return n;
    });
    onUpdateNotes(updated);
  };

  // Extract all tags for filter list
  const allTags = new Set<string>();
  notes.forEach(note => {
    note.tags.forEach(t => allTags.add(t));
  });
  const tagsList = ['Todos', ...Array.from(allTags)];

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTagFilter === 'Todos' || note.tags.includes(selectedTagFilter);

    return matchesSearch && matchesTag;
  });

  // Sort notes: Pinned first, then by updatedAt desc
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Both same pin status: sort by updatedAt descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Format date correctly in Spanish
  const formatDateToLocal = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">ESPACIO DE REFLEXIÓN</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Notas y Pensamientos</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Un diario libre para capturar tus inspiraciones, ideas creativas y reflexiones diarias.</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="flex items-center justify-center gap-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 self-start md:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva nota
        </button>
      </div>

      {/* Search and Tag Selector filter row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1A1A24] border border-[#7C6AF7]/15 p-4 rounded-2xl shadow-md">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A89A0]" />
          <input
            type="text"
            placeholder="Buscar nota o etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#22222F] border border-[#7C6AF7]/10 rounded-xl pl-10 pr-4 py-2 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-xs font-semibold"
          />
        </div>

        {/* Tags horizontal overflow list */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none select-none">
          <Tag className="w-3.5 h-3.5 text-[#8A89A0] shrink-0" />
          <div className="flex gap-1.5 shrink-0">
            {tagsList.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTagFilter(t)}
                className={`text-[11px] px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  selectedTagFilter === t 
                    ? 'bg-[#7C6AF7] text-[#F0EFF8] font-bold' 
                    : 'bg-[#22222F] text-[#8A89A0] hover:text-[#F0EFF8]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Post-it grid columns simulation (CSS columns) */}
      {sortedNotes.length === 0 ? (
        <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl py-16 text-center space-y-4 max-w-2xl mx-auto">
          <div className="text-4xl">📝</div>
          <div className="space-y-2">
            <h3 className="text-sm text-[#F0EFF8] font-semibold">Tus pensamientos están por nacer</h3>
            <p className="text-xs text-[#8A89A0] max-w-md mx-auto px-4">
              Aún no tienes notas que coincidan. No dejes escapar ninguna idea brillante, presiona el botón '+' para anotarla.
            </p>
          </div>
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg"
          >
            Escribir algo hoy +
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 [column-fill:_balance] space-y-5">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleStartEdit(note)}
              className="break-inside-avoid bg-[#1A1A24] border rounded-2xl p-5 hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between"
              style={{ 
                backgroundColor: note.color,
                borderColor: note.pinned ? '#7C6AF7' : 'rgba(124, 106, 247, 0.15)',
                borderWidth: note.pinned ? '1px' : '1px'
              }}
            >
              <div>
                {/* Floating Pin Indicator */}
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-serif text-lg font-semibold text-[#F0EFF8] leading-tight flex-1">
                    {note.title}
                  </h3>
                  <button
                    onClick={(e) => handleTogglePin(e, note.id)}
                    className={`p-1.5 rounded-lg transition-colors scale-90 md:scale-100 shrink-0 cursor-pointer ${
                      note.pinned ? 'text-[#F7A26A] bg-white/5' : 'text-[#8A89A0] hover:text-[#F0EFF8]'
                    }`}
                    title={note.pinned ? "Desanclar" : "Anclar nota"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-[#F7A26A]' : ''}`} />
                  </button>
                </div>

                {/* Body Content with linebreaks */}
                <p className="text-xs text-[#F0EFF8]/95 whitespace-pre-wrap leading-relaxed mb-4 font-sans">
                  {note.content}
                </p>
              </div>

              {/* Card Footer: Metadata and utilities */}
              <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2.5">
                {/* Tags section */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-[10px] bg-white/10 border border-white/5 text-[#F0EFF8] px-2 py-0.5 rounded-md font-sans font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 opacity-60" />
                    {formatDateToLocal(note.updatedAt)}
                  </span>

                  {/* Desktop Action overlay or bottom row */}
                  <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(note);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-white"
                      title="Editar"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete item confirmation overlay block */}
                    {confirmDeleteId === note.id ? (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 bottom-3 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-20 shadow-xl text-[9px]"
                      >
                        <span className="text-[#EF4444] font-medium">¿Borrar?</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="px-1.5 py-0.5 bg-[#EF4444] text-[#F0EFF8] font-bold rounded"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 bg-[#22222F]/80 text-[#8A89A0] font-bold rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(note.id);
                        }}
                        className="p-1 hover:bg-[#EF4444]/20 hover:text-[#EF4444] rounded text-white"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button for Mobile Quick entry */}
      <button
        onClick={handleStartCreate}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-[#7C6AF7] hover:bg-[#7C6AF7]/95 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-30 cursor-pointer border border-white/15"
        title="Crear nueva nota"
      >
        <Plus className="w-6 h-6 stroke-[2.5px]" />
      </button>

      {/* Note Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                {editingNote ? 'Editar Pensamiento' : 'Capturar Pensamiento ✦'}
              </h3>
              <button 
                onClick={resetForm} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Título de la nota
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ideas para el fin de semana, Diario nocturno..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium"
                />
              </div>

              {/* Content text */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Escribe tus pensamientos
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Comienza a escribir libremente tus sensaciones, tareas pendientes informales, ideas o reflexiones..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium resize-none"
                />
              </div>

              {/* Tags comma separation */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans flex justify-between">
                  <span>Etiquetas (Comas para separar)</span>
                  <span className="text-[#8A89A0] text-[10px]">Ej: Creativo, Diario, Metas</span>
                </label>
                <input
                  type="text"
                  placeholder="viajes, bienestar, código"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-[#F0EFF8] placeholder-[#8A89A0]/50 outline-none focus:border-[#7C6AF7] transition-all text-sm"
                />
              </div>

              {/* Color list and Pin switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Background color picker */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans block mb-1">
                    Color de la nota
                  </label>
                  <div className="flex gap-2">
                    {PASTEL_DARK_COLORS.map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setColor(col.hex)}
                        className={`w-7 h-7 rounded-lg border transition-all ${color === col.hex ? 'border-white scale-110' : 'border-transparent opacity-80 hover:opacity-100'}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Pin Toggle */}
                <div className="flex items-center justify-start md:justify-end gap-3 pt-3">
                  <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                    Anclar arriba
                  </label>
                  <button
                    type="button"
                    onClick={() => setPinned(!pinned)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      pinned 
                        ? 'bg-[#F7A26A] text-[#0F0F14]' 
                        : 'bg-[#22222F] text-[#8A89A0] border border-[#7C6AF7]/15 hover:text-[#F0EFF8]'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`} />
                    {pinned ? 'Anclado 📌' : 'Desanclado'}
                  </button>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[#7C6AF7]/15">
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
                  {editingNote ? 'Guardar Cambios' : 'Añadir Nota'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
