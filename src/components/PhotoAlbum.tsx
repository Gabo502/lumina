import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, Plus, ArrowLeft, Trash2, Eye, Compass, Info, Image as ImageIcon, ChevronLeft, ChevronRight, X, Edit, Sliders } from 'lucide-react';
import { PhotoFolder, Photo } from '../types';

interface PhotoAlbumProps {
  folders: PhotoFolder[];
  onUpdateFolders: (newFolders: PhotoFolder[]) => void;
}

const QUICK_FOLDER_EMOJIS = ["✈️", "🏡", "🧘", "🎨", "🐾", "✨", "🏞️", "🍔", "🎓", "🎉", "🔥", "🚲"];

export default function PhotoAlbum({ folders, onUpdateFolders }: PhotoAlbumProps) {
  const [viewMode, setViewMode] = useState<'folders' | 'all-gallery'>('folders'); // folders or general gallery
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Modals / Creators
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('✈️');

  // Lightbox
  const [lightboxActive, setLightboxActive] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Compress indicator / warning
  const [isCompressing, setIsCompressing] = useState(false);
  const [storageUsedKb, setStorageUsedKb] = useState(0);

  // Delete confirmations
  const [confirmFolderId, setConfirmFolderId] = useState<string | null>(null);
  const [confirmPhotoId, setConfirmPhotoId] = useState<string | null>(null);

  useEffect(() => {
    // Estimate localStorage usage for photos
    const totalString = JSON.stringify(folders);
    const kb = Math.round(totalString.length / 1024);
    setStorageUsedKb(kb);
  }, [folders]);

  // Handle keyboard events in lightbox
  useEffect(() => {
    if (!lightboxActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleLightboxNext();
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'Escape') setLightboxActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxActive, lightboxIndex, lightboxPhotos]);

  // Add folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: PhotoFolder = {
      id: 'fld_' + Date.now(),
      name: newFolderName.trim(),
      emoji: newFolderEmoji,
      photos: []
    };

    onUpdateFolders([...folders, newFolder]);
    setNewFolderName('');
    setNewFolderEmoji('✈️');
    setShowCreateFolder(false);
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    const updated = folders.filter(f => f.id !== folderId);
    onUpdateFolders(updated);
    if (activeFolderId === folderId) {
      setActiveFolderId(null);
    }
    setConfirmFolderId(null);
  };

  // Automated Canvas Image Resizing and Compression Helper
  const compressAndAddImages = (fileList: FileList, folderId: string) => {
    setIsCompressing(true);
    const files = Array.from(fileList);
    let loadedCount = 0;
    const newPhotosBatch: Photo[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Initialize canvas to shrink and optimize high-resolution files
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Export compressed JPEG base64 (quality: 0.70)
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.70);
            
            newPhotosBatch.push({
              id: 'pic_' + Math.random().toString(36).substr(2, 9),
              url: compressedUrl,
              caption: file.name.substring(0, file.name.lastIndexOf('.')) || 'Sin descripción',
              uploadedAt: new Date().toISOString()
            });
          }

          loadedCount++;
          if (loadedCount === files.length) {
            // Apply updates
            const updated = folders.map(f => {
              if (f.id === folderId) {
                return {
                  ...f,
                  photos: [...newPhotosBatch, ...f.photos]
                };
              }
              return f;
            });
            onUpdateFolders(updated);
            setIsCompressing(false);
          }
        };

        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete photo
  const handleDeletePhoto = (folderId: string, photoId: string) => {
    const updated = folders.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          photos: f.photos.filter(p => p.id !== photoId)
        };
      }
      return f;
    });
    onUpdateFolders(updated);

    // If active in lightbox, close or slide
    if (lightboxActive) {
      const remaining = lightboxPhotos.filter(p => p.id !== photoId);
      if (remaining.length === 0) {
        setLightboxActive(false);
      } else {
        setLightboxPhotos(remaining);
        setLightboxIndex(prev => Math.min(prev, remaining.length - 1));
      }
    }
    setConfirmPhotoId(null);
  };

  // Edit photo caption
  const handleUpdatePhotoCaption = (folderId: string, photoId: string, text: string) => {
    const updated = folders.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          photos: f.photos.map(p => p.id === photoId ? { ...p, caption: text } : p)
        };
      }
      return f;
    });
    onUpdateFolders(updated);

    // Update state inside lightbox
    const updatedPhotos = lightboxPhotos.map(p => p.id === photoId ? { ...p, caption: text } : p);
    setLightboxPhotos(updatedPhotos);
  };

  // Open Lightbox slideshow
  const openLightbox = (photosList: Photo[], index: number) => {
    setLightboxPhotos(photosList);
    setLightboxIndex(index);
    setLightboxActive(true);
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxPhotos.length);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
  };

  // Find parent folder of a photo for general gallery management
  const findParentFolderId = (photoId: string): string => {
    const found = folders.find(f => f.photos.some(p => p.id === photoId));
    return found ? found.id : '';
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);
  
  // Aggregate all photos
  const allPhotosAndFolders: { photo: Photo; folder: PhotoFolder }[] = [];
  folders.forEach(f => {
    f.photos.forEach(p => {
      allPhotosAndFolders.push({ photo: p, folder: f });
    });
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F0EFF8]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7C6AF7]/15 pb-6">
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C6AF7]">MURAL DE VISUALIZACIÓN</span>
          <h1 className="font-serif text-3xl font-semibold mt-1">Álbum de Fotos</h1>
          <p className="text-[#8A89A0] text-sm mt-1">Sube tus fotos de inspiración, metas visuales o momentos de calma para energizar tu portal.</p>
        </div>

        {/* Global toggles and uploads */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setViewMode('folders'); setActiveFolderId(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
              viewMode === 'folders' && !activeFolderId
                ? 'bg-[#7C6AF7]/15 text-[#7C6AF7] border-[#7C6AF7]'
                : 'bg-[#1A1A24]/60 text-[#8A89A0] border-transparent hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            📁 Mis Carpetas ({folders.length})
          </button>

          <button
            onClick={() => { setViewMode('all-gallery'); setActiveFolderId(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
              viewMode === 'all-gallery'
                ? 'bg-[#7C6AF7]/15 text-[#7C6AF7] border-[#7C6AF7]'
                : 'bg-[#1A1A24]/60 text-[#8A89A0] border-transparent hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-[#F7A26A]" />
            🌌 Galería General ({allPhotosAndFolders.length})
          </button>
        </div>
      </div>

      {/* Info Warning Limit card */}
      <div className="bg-[#22222F]/40 border border-[#7C6AF7]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-[#F7A26A] shrink-0" />
          <div className="space-y-0.5">
            <span className="font-semibold text-[#F0EFF8]">Compresión Inteligente Offline Activada</span>
            <p className="text-[#8A89A0]">
              Cualquier imagen subida se optimiza automáticamente en ancho y peso para proteger tus cargamentos locales.
            </p>
          </div>
        </div>
        <div className="font-mono text-[10px] text-[#8A89A0] bg-[#1A1A24] px-3 py-1.5 rounded-lg shrink-0 border border-[#7C6AF7]/5">
          Datos en caché: <span className="text-[#7C6AF7] font-bold">{storageUsedKb} KB</span> / ~4500 KB
        </div>
      </div>

      {/* RENDER MODE A : Folders view list */}
      {viewMode === 'folders' && !activeFolderId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-medium">Tus Carpetas</h2>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#7C6AF7] hover:bg-[#7C6AF7]/10 px-3 py-1.5 rounded-lg border border-[#7C6AF7]/20 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              Crear Carpeta
            </button>
          </div>

          {folders.length === 0 ? (
            <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl py-16 text-center space-y-4 max-w-lg mx-auto">
              <div className="text-4xl text-[#8A89A0]/75">📂</div>
              <div className="space-y-1">
                <p className="text-sm font-semibold select-none">No tienes carpetas de imágenes</p>
                <p className="text-xs text-[#8A89A0] max-w-sm mx-auto px-4">Crea una carpeta de inspiración como "Metas", "Vacaciones" o "Familia", y comienza a colgar fotos zen.</p>
              </div>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="px-4 py-2 bg-[#7C6AF7] text-xs font-semibold rounded-lg"
              >
                Crear mi primera carpeta +
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => { setActiveFolderId(folder.id); setViewMode('folders'); }}
                  className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl p-5 hover:border-[#7C6AF7]/40 cursor-pointer shadow-lg group hover:-translate-y-0.5 transition-all relative overflow-hidden flex flex-col justify-between h-44"
                >
                  <div className="absolute top-0 right-0 transform translate-x-5 -translate-y-5 w-20 h-20 bg-[#7C6AF7]/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <span className="text-3xl p-2.5 bg-[#22222F] rounded-xl font-sans" role="img" aria-label="icono-carpeta">
                      {folder.emoji}
                    </span>

                    {/* Trash whole folder action */}
                    {confirmFolderId === folder.id ? (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-3 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-10 shadow-xl text-[10px]"
                      >
                        <span className="text-[#EF4444] font-medium">¿Borrar?</span>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="px-1.5 py-0.5 bg-[#EF4444] text-white font-bold rounded"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmFolderId(null)}
                          className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] font-bold rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmFolderId(folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8A89A0] hover:text-[#EF4444] hover:bg-[#22222F] rounded-lg transition-all absolute right-3 top-3"
                        title="Borrar carpeta entera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5 mt-4">
                    <h3 className="font-serif text-lg font-semibold group-hover:text-[#7C6AF7] transition-all truncate">
                      {folder.name}
                    </h3>
                    <p className="text-[#8A89A0] text-xs font-sans">
                      {folder.photos.length} {folder.photos.length === 1 ? 'fotografía' : 'fotografías'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER MODE B : Inside a specific folder */}
      {viewMode === 'folders' && activeFolderId && activeFolder && (
        <div className="space-y-6">
          {/* Top Return panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#7C6AF7]/10 pb-4">
            <button
              onClick={() => setActiveFolderId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-[#8A89A0] hover:text-[#7C6AF7] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Carpetas
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeFolder.emoji}</span>
              <h2 className="font-serif text-xl font-semibold text-[#F0EFF8]">{activeFolder.name}</h2>
              <span className="text-xs px-2.5 py-0.5 bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-full text-[#8A89A0] font-mono">
                {activeFolder.photos.length} fotos
              </span>
            </div>

            {/* Multiple files input trigger */}
            <div className="relative shrink-0 select-none">
              <input
                type="file"
                multiple
                accept="image/*"
                id="image-uploader-input"
                className="hidden"
                disabled={isCompressing}
                onChange={(e) => {
                  if (e.target.files) {
                    compressAndAddImages(e.target.files, activeFolder.id);
                  }
                }}
              />
              <label
                htmlFor="image-uploader-input"
                className={`flex items-center justify-center gap-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-4 h-4" />
                {isCompressing ? 'Procesando...' : 'Subir Fotos'}
              </label>
            </div>
          </div>

          {/* Folder Photos Grid */}
          {activeFolder.photos.length === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
              <div className="text-4xl">🌌</div>
              <p className="text-xs text-[#8A89A0]">Aún no has agregado fotos en esta carpeta. ¡Anímate a colgar recuerdos o inspiraciones visuales!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {activeFolder.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl overflow-hidden group hover:border-[#7C6AF7]/40 transition-all shadow-xl flex flex-col relative"
                >
                  {/* Photo itself */}
                  <div 
                    onClick={() => openLightbox(activeFolder.photos, index)}
                    className="relative pb-[70%] bg-[#0F0F14] overflow-hidden cursor-zoom-in"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#0F0F14]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="p-2 bg-[#0F0F14]/80 rounded-full text-white text-xs">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Caption & Metadata bar */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <p className="text-[12px] text-[#F0EFF8]/90 font-medium font-sans truncate" title={photo.caption}>
                      {photo.caption}
                    </p>

                    <div className="flex items-center justify-between border-t border-[#7C6AF7]/10 pt-2 text-[10px] text-[#8A89A0] font-mono">
                      <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                      
                      {/* Delete this photo with nested popup confirms */}
                      <div className="relative">
                        {confirmPhotoId === photo.id ? (
                          <div className="absolute right-0 bottom-6 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-25 shadow-xl">
                            <button
                              onClick={() => handleDeletePhoto(activeFolder.id, photo.id)}
                              className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded font-bold"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmPhotoId(null)}
                              className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded font-bold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmPhotoId(photo.id)}
                            className="p-1 hover:text-[#EF4444] text-[#8A89A0]"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* RENDER MODE C : General aggregate gallery (all photos) */}
      {viewMode === 'all-gallery' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-medium">Galería General</h2>
          
          {allPhotosAndFolders.length === 0 ? (
            <div className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="text-4xl text-[#8A89A0]/70">🏜️</div>
              <p className="text-xs text-[#8A89A0] px-4">No hay fotos en ninguna carpeta. Crea una carpeta primero para colgar imágenes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {allPhotosAndFolders.map((item, index) => {
                const photList = allPhotosAndFolders.map(x => x.photo);

                return (
                  <div
                    key={item.photo.id}
                    className="bg-[#1A1A24] border border-[#7C6AF7]/15 rounded-2xl overflow-hidden group hover:border-[#7C6AF7]/40 transition-all shadow-xl flex flex-col relative"
                  >
                    {/* Photo */}
                    <div 
                      onClick={() => openLightbox(photList, index)}
                      className="relative pb-[70%] bg-[#0F0F14] overflow-hidden cursor-zoom-in"
                    >
                      <img
                        src={item.photo.url}
                        alt={item.photo.caption}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Floating tag of parent folder name */}
                      <span className="absolute top-2.5 left-2.5 bg-[#0F0F14]/75 border border-[#7C6AF7]/15 text-[#F0EFF8] px-2 py-0.5 rounded-lg text-[9px] font-bold font-sans">
                        {item.folder.emoji} {item.folder.name}
                      </span>
                    </div>

                    {/* Caption & settings */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <p className="text-[12px] text-[#F0EFF8]/95 font-medium font-sans truncate">
                        {item.photo.caption}
                      </p>

                      <div className="flex items-center justify-between border-t border-[#7C6AF7]/10 pt-2 text-[10px] text-[#8A89A0]">
                        <span className="font-mono">{new Date(item.photo.uploadedAt).toLocaleDateString()}</span>
                        
                        <div className="relative">
                          {confirmPhotoId === item.photo.id ? (
                            <div className="absolute right-0 bottom-6 bg-[#0F0F14] border border-[#EF4444]/30 rounded-lg p-1.5 flex items-center gap-1.5 z-25 shadow-xl text-[10px]">
                              <button
                                onClick={() => handleDeletePhoto(item.folder.id, item.photo.id)}
                                className="px-1.5 py-0.5 bg-[#EF4444] text-white rounded font-bold"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setConfirmPhotoId(null)}
                                className="px-1.5 py-0.5 bg-[#22222F] text-[#8A89A0] rounded font-bold"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmPhotoId(item.photo.id)}
                              className="p-1 hover:text-[#EF4444]"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW FOLDER POPUP/MODAL */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-[#0F0F14]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1A1A24] border border-[#7C6AF7]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-[#7C6AF7]/15 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#F0EFF8]">
                Crear Nueva Carpeta 📁
              </h3>
              <button 
                onClick={() => setShowCreateFolder(false)} 
                className="text-[#8A89A0] hover:text-[#F0EFF8] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              
              {/* Folder Title */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Nombre de la carpeta
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder="Ej: Viajes, Inspiración, Yo, Naturaleza..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-[#22222F] border border-[#7C6AF7]/15 rounded-xl px-4 py-2.5 text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all text-sm font-medium"
                />
              </div>

              {/* Folder Emoji */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#8A89A0] font-bold font-sans">
                  Emoji identificador
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={newFolderEmoji}
                    onChange={(e) => setNewFolderEmoji(e.target.value)}
                    className="w-12 bg-[#22222F] border border-[#7C6AF7]/20 rounded-xl text-center text-xl outline-none"
                  />
                  <div className="flex-1 flex gap-2 p-1.5 bg-[#22222F]/60 rounded-xl border border-[#7C6AF7]/10 overflow-x-auto max-w-[280px]">
                    {QUICK_FOLDER_EMOJIS.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewFolderEmoji(em)}
                        className={`text-lg p-1 hover:bg-[#7C6AF7]/10 rounded-lg transition-colors ${newFolderEmoji === em ? 'bg-[#7C6AF7]/25' : ''}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[#7C6AF7]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 bg-[#22222F] border border-[#7C6AF7]/15 text-[#8A89A0] text-xs font-semibold rounded-lg hover:text-[#F0EFF8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C6AF7] hover:bg-[#7C6AF7]/85 text-[#F0EFF8] text-xs font-semibold rounded-lg shadow-md cursor-pointer"
                >
                  Crear Carpeta
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FULL SCREEN SLIDE LIGHTBOX VIEW */}
      {lightboxActive && lightboxPhotos.length > 0 && (
        <div className="fixed inset-0 bg-[#07070B]/98 backdrop-blur-md flex flex-col justify-between z-50 p-4 select-none animate-fade-in text-[#F0EFF8]">
          
          {/* Lightbox Head: Close, counters and slide keys */}
          <div className="flex items-center justify-between p-2">
            <span className="font-mono text-xs text-[#8A89A0]">
              Foto {lightboxIndex + 1} de {lightboxPhotos.length}
            </span>
            <button
              onClick={() => setLightboxActive(false)}
              className="p-2 bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Center Slider row */}
          <div className="flex-1 flex items-center justify-between gap-4 py-4 relative">
            {/* Backward button */}
            <button
              onClick={handleLightboxPrev}
              className="absolute left-2 md:left-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer z-10"
              title="Anterior (←)"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5px]" />
            </button>

            {/* Central responsive image */}
            <div className="max-w-4xl max-h-[68vh] mx-auto flex items-center justify-center p-2 relative">
              <img
                src={lightboxPhotos[lightboxIndex]?.url}
                alt={lightboxPhotos[lightboxIndex]?.caption}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[68vh] rounded-xl object-contain shadow-2xl scale-100"
              />
            </div>

            {/* Forward button */}
            <button
              onClick={handleLightboxNext}
              className="absolute right-2 md:right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer z-10"
              title="Siguiente (→)"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5px]" />
            </button>
          </div>

          {/* Lightbox Foot: caption details editing on the fly */}
          <div className="bg-[#13131C] border border-[#7C6AF7]/10 max-w-xl w-full mx-auto p-4 rounded-2xl flex flex-col gap-2.5 shadow-xl mb-4 text-center">
            <div className="flex items-center gap-2 justify-center">
              <Edit className="w-3.5 h-3.5 text-[#7C6AF7]" />
              <span className="text-[10px] text-[#8A89A0] uppercase tracking-widest font-bold">Descripción de la foto</span>
            </div>
            
            <input
              type="text"
              value={lightboxPhotos[lightboxIndex]?.caption}
              placeholder="Añade un caption inspirador..."
              onChange={(e) => {
                const pid = lightboxPhotos[lightboxIndex]?.id;
                const fid = findParentFolderId(pid);
                if (pid && fid) {
                  handleUpdatePhotoCaption(fid, pid, e.target.value);
                }
              }}
              className="w-full bg-[#1C1C29] border border-[#7C6AF7]/15 rounded-xl px-4 py-2 text-center text-sm text-[#F0EFF8] outline-none focus:border-[#7C6AF7] transition-all"
            />
          </div>

        </div>
      )}

    </div>
  );
}
