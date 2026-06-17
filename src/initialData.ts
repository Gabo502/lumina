import { UserProfile, Habit, Note, TaskList, PhotoFolder, CalendarEvent, Reminder, Goal } from './types';

export const MOTIVATIONAL_QUOTES = [
  "El único modo de hacer un gran trabajo es amar lo que haces. - Steve Jobs",
  "La persistencia y constancia vencen al talento cuando el talento no se esfuerza.",
  "No dejes que el ayer ocupe demasiado del día de hoy. - Proverbio Cherokee",
  "Pequeños hábitos diarios construyen grandes destinos a largo plazo.",
  "Haz de cada día tu obra maestra. - John Wooden",
  "La felicidad no es algo que se pospone para el futuro; es algo que se diseña para el presente.",
  "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
  "Cree que puedes y casi lo habrás logrado. - Theodore Roosevelt",
  "No busques el momento perfecto, toma este momento y hazlo perfecto.",
  "La disciplina es el puente entre tus metas y tus logros.",
  "No te canses de intentar hacer de tu vida algo extraordinario.",
  "Tu bienestar mental no es opcional. Protegerlo es tu prioridad número uno.",
  "Da el primer paso con fe. No tienes que ver toda la escalera, solo el primer escalón. - Martin Luther King",
  "La perseverancia no es una carrera larga, son muchas carreras cortas una tras otra.",
  "El secreto de tu futuro está oculto en tu rutina diaria.",
  "Mira hacia atrás solo para ver lo lejos que has llegado.",
  "Hoy tienes una nueva oportunidad de escribir una página increíble en tu historia.",
  "Agradécete a ti mismo por el esfuerzo de ayer. Tu futuro yo te lo agradecerá.",
  "Cada progreso, por pequeño que sea, te acerca un paso más a tus metas.",
  "Respira hondo, sonríe y sigue adelante. Todo llega cuando tiene que llegar."
];

export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPast7Days = () => {
  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const list = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayName = weekdays[d.getDay()];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayVal}`;
    list.push({
      dateStr,
      label: dayName,
      dayNum: d.getDate()
    });
  }
  return list;
};

// Initial data objects
export const DEFAULT_USER: UserProfile = {
  name: "Gabriel",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
  appName: "Lumina ✦",
  theme: "dark"
};

export const DEFAULT_HABITS = (todayStr: string, yesterdayStr: string): Habit[] => [
  {
    id: "h1",
    name: "Beber 2 litros de agua",
    emoji: "💧",
    color: "#7C6AF7",
    history: {
      [todayStr]: true,
      [yesterdayStr]: true
    }
  },
  {
    id: "h2",
    name: "Meditar 10 minutos",
    emoji: "🧘",
    color: "#5BC9A0",
    history: {
      [todayStr]: false,
      [yesterdayStr]: true
    }
  },
  {
    id: "h3",
    name: "Leer 15 páginas",
    emoji: "📚",
    color: "#F7A26A",
    history: {
      [todayStr]: true,
      [yesterdayStr]: false
    }
  },
  {
    id: "h4",
    name: "Estirar el cuerpo",
    emoji: "🤸",
    color: "#EF4444",
    history: {
      [todayStr]: true,
      [yesterdayStr]: true
    }
  }
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: "n1",
    title: "💡 Visiones para Lumina",
    content: "Lumina no es solo una herramienta de organización, es una filosofía de vida. Busca balancear el logro (tareas, objetivos) con el cuidado propio (hábitos, pensamientos, recordatorios) en una atmósfera visualmente cálida y acogedora.",
    color: "#2C224E", // Violeta suave pastel
    pinned: true,
    tags: ["Filosofía", "Proyecto"],
    createdAt: "2026-06-15T10:30:00.000Z",
    updatedAt: "2026-06-15T10:30:00.000Z"
  },
  {
    id: "n2",
    title: "📋 Ruta de crecimiento",
    content: "1. Terminar diseño base de Lumina.\n2. Configurar almacenamiento offline local robusto.\n3. Añadir animaciones hermosas al llenar el frasco de hábitos.\n4. Diseñar el álbum de fotos inspirador.",
    color: "#1E332E", // Verde menta pastel oscuro
    pinned: false,
    tags: ["Planificación"],
    createdAt: "2026-06-16T14:15:00.000Z",
    updatedAt: "2026-06-16T14:15:00.000Z"
  },
  {
    id: "n3",
    title: "📝 Ideas de afirmaciones diarias",
    content: "- Soy capaz de crear un día maravilloso.\n- Avanzo a mi propio ritmo.\n- Mi paz mental es mi posesión más valiosa.\n- Celebro cada pequeño avance hoy.",
    color: "#352A1E", // Naranja pastel cálido oscuro
    pinned: false,
    tags: ["Bienestar", "Afirmaciones"],
    createdAt: "2026-06-16T09:00:00.000Z",
    updatedAt: "2026-06-16T09:00:00.000Z"
  }
];

export const DEFAULT_TASKS: TaskList[] = [
  {
    id: "tl1",
    name: "Trabajo",
    color: "#7C6AF7",
    tasks: [
      { id: "t1", text: "Preparar presentación del sprint energético", priority: "high", completed: false, dueDate: "2026-06-18" },
      { id: "t2", text: "Responder correos de planificación semanal", priority: "medium", completed: true, dueDate: "2026-06-16" },
      { id: "t3", text: "Estructurar metas del tercer trimestre", priority: "low", completed: false, dueDate: "2026-06-25" }
    ]
  },
  {
    id: "tl2",
    name: "Personal",
    color: "#F7A26A",
    tasks: [
      { id: "t4", text: "Comprar fruta y verduras frescas", priority: "medium", completed: false, dueDate: "2026-06-17" },
      { id: "t5", text: "Regar las plantas del balcón", priority: "low", completed: true, dueDate: "2026-06-16" },
      { id: "t6", text: "Llamar a mi abuela para saludar", priority: "high", completed: false, dueDate: "2026-06-20" }
    ]
  },
  {
    id: "tl3",
    name: "Compras",
    color: "#5BC9A0",
    tasks: [
      { id: "t7", text: "Libro de Hábitos Atómicos", priority: "low", completed: false }
    ]
  }
];

export const DEFAULT_PHOTOS: PhotoFolder[] = [
  {
    id: "f1",
    name: "Viajes Inspiradores",
    emoji: "✈️",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        caption: "Playa tranquila al atardecer, recordándome respirar profundo.",
        uploadedAt: "2026-06-15T18:00:00.000Z"
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
        caption: "Aventura en las montañas sagradas.",
        uploadedAt: "2026-06-15T18:10:00.000Z"
      }
    ]
  },
  {
    id: "f2",
    name: "Momentos Zen",
    emoji: "🧘",
    photos: [
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
        caption: "Espacio de meditación matinal.",
        uploadedAt: "2026-06-16T08:00:00.000Z"
      }
    ]
  }
];

export const DEFAULT_CALENDAR = (todayStr: string): CalendarEvent[] => [
  {
    id: "c1",
    title: "🧘 Sesión de Yoga Restaurativo",
    date: todayStr,
    startTime: "08:00",
    endTime: "09:00",
    category: "health",
    notes: "Clase para estirar y calmar la mente antes de empezar el día."
  },
  {
    id: "c2",
    title: "📈 Revisión Mensual de Objetivos",
    date: todayStr,
    startTime: "15:00",
    endTime: "16:00",
    category: "work",
    notes: "Analizar el progreso en Lumina y replantear estrategias."
  },
  {
    id: "c3",
    title: "☕ Café con Sofía",
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    startTime: "17:00",
    endTime: "18:30",
    category: "social",
    notes: "Platicar sobre sus nuevos proyectos artísticos."
  },
  {
    id: "c4",
    title: "🏥 Chequeo dental de rutina",
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    startTime: "10:30",
    endTime: "11:30",
    category: "health"
  }
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: "r1",
    message: "El éxito consiste en avanzar de fracaso en fracaso sin perder el entusiasmo. ¡Sigue dando lo mejor!",
    frequency: "daily",
    category: "motivation",
    favorite: true
  },
  {
    id: "r2",
    message: "Estoy en paz con mi proceso. Mi crecimiento no es lineal y está bien florecer a mi propio tiempo.",
    frequency: "weekly",
    category: "affirmation",
    favorite: true
  },
  {
    id: "r3",
    message: "Hacer una pausa para estirarse profundamente, beber un vaso con agua fresca y tomar tres respiraciones conscientes.",
    frequency: "daily",
    category: "reflection",
    favorite: false
  },
  {
    id: "r4",
    message: "Anota tus tres agradecimientos del día en tus Notas. La gratitud cambia el lente con el que miras la vida.",
    frequency: "random",
    category: "reflection",
    favorite: false
  }
];

export const DEFAULT_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Dominio de la Salud Integral",
    description: "Establecer y consolidar una rutina que priorice mi bienestar corporal, equilibrio psicológico y nutrición consciente.",
    deadline: "2026-12-31",
    status: "progress",
    progress: 60,
    steps: [
      { id: "s1", text: "Meditar al menos 4 veces por semana", completed: true },
      { id: "s2", text: "Completar chequeo médico preventivo", completed: true },
      { id: "s3", text: "Dormir sistemáticamente 8 horas", completed: false }
    ],
    notes: "El bienestar es la base de todo logro profesional y felicidad."
  },
  {
    id: "g2",
    title: "Aprender Creación de Software Único",
    description: "Lograr dominar técnicas de frontend avanzado para construir interfaces con diseño de ultra-alta calidad espacial y funcional.",
    deadline: "2026-09-30",
    status: "progress",
    progress: 75,
    steps: [
      { id: "s4", text: "Aprender animaciones fluidas con Motion", completed: true },
      { id: "s5", text: "Integrar bases de datos localStorage", completed: true },
      { id: "s6", text: "Dominar arquitectura orientada a componentes", completed: false }
    ],
    notes: "Poco a poco se llega lejos."
  },
  {
    id: "g3",
    title: "Reto de Lectura Anual",
    description: "Leer 12 libros de desarrollo personal, filosofía y ficción para expandir horizontes.",
    deadline: "2026-12-25",
    status: "completed",
    progress: 100,
    steps: [
      { id: "s7", text: "Comprar los libros seleccionados", completed: true },
      { id: "s8", text: "Dedicar 15 minutos de lectura diaria", completed: true },
      { id: "s9", text: "Resumir las grandes lecciones de cada libro", completed: true }
    ],
    notes: "El conocimiento compartido y aplicado multiplica su valor."
  }
];
