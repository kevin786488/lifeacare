// screens/AddHabitScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHabits } from '../context/HabitContext';

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  { id: '1', name: 'Salud Física',    icon: 'fitness',      color: '#10b981' },
  { id: '2', name: 'Salud Mental',    icon: 'brain',        color: '#6366f1' },
  { id: '3', name: 'Productividad',   icon: 'trending-up',  color: '#eab308' },
  { id: '4', name: 'Bienestar',       icon: 'heart',        color: '#14b8a6' },
  { id: '5', name: 'Hábitos Diarios', icon: 'sunny',        color: '#3b82f6' },
];

// ── Individual presets per category ──────────────────────────────────────────
const PRESETS = {
  'Salud Física': [
    { name: 'Hacer ejercicio',       description: 'Actividad física para mantener el cuerpo sano.',    sessionsPerDay: 1 },
    { name: 'Beber 8 vasos de agua', description: 'Hidratación esencial para el organismo.',           sessionsPerDay: 8 },
    { name: 'Caminar 30 minutos',    description: 'Caminata diaria para mejorar la circulación.',      sessionsPerDay: 1 },
    { name: 'Estiramientos',         description: 'Flexibilidad para reducir tensión muscular.',        sessionsPerDay: 2 },
    { name: 'Dormir 8 horas',        description: 'Descanso reparador para el cuerpo y la mente.',     sessionsPerDay: 1 },
  ],
  'Salud Mental': [
    { name: 'Meditar',                   description: 'Sesión de meditación para calmar la mente.',      sessionsPerDay: 1 },
    { name: 'Escribir en el diario',     description: 'Reflexión sobre pensamientos y emociones.',       sessionsPerDay: 1 },
    { name: 'Respiración profunda',      description: 'Ejercicios para reducir el estrés.',              sessionsPerDay: 3 },
    { name: 'Desconectarme del celular', description: 'Tiempo sin pantallas para descansar la mente.',   sessionsPerDay: 1 },
    { name: 'Leer un libro',             description: 'Lectura diaria para estimular la mente.',          sessionsPerDay: 1 },
  ],
  'Productividad': [
    { name: 'Planificar el día',   description: 'Organizar tareas y prioridades cada mañana.',          sessionsPerDay: 1 },
    { name: 'Revisar mis metas',   description: 'Verificar el progreso hacia objetivos personales.',    sessionsPerDay: 1 },
    { name: 'Estudiar',            description: 'Sesión de aprendizaje enfocado.',                      sessionsPerDay: 2 },
    { name: 'Pomodoro de trabajo', description: 'Bloques de trabajo concentrado de 25 minutos.',        sessionsPerDay: 4 },
    { name: 'Ordenar mi espacio',  description: 'Mantener el entorno limpio y organizado.',             sessionsPerDay: 1 },
  ],
  'Bienestar': [
    { name: 'Llamar a un ser querido', description: 'Conectar con familia o amigos.',                  sessionsPerDay: 1 },
    { name: 'Practicar gratitud',      description: 'Anotar 3 cosas por las que estoy agradecido/a.',  sessionsPerDay: 1 },
    { name: 'Salir a la naturaleza',   description: 'Tiempo al aire libre para reconectar.',            sessionsPerDay: 1 },
    { name: 'Cocinar saludable',       description: 'Preparar una comida nutritiva en casa.',           sessionsPerDay: 1 },
    { name: 'Tiempo de ocio',          description: 'Dedicar tiempo a algo que disfruto sin culpa.',    sessionsPerDay: 1 },
  ],
  'Hábitos Diarios': [
    { name: 'Cepillarme los dientes',        description: 'Higiene dental completa, mañana y noche.',  sessionsPerDay: 2 },
    { name: 'Tomar vitaminas',               description: 'Suplementos diarios para la salud.',         sessionsPerDay: 1 },
    { name: 'No usar el celular al despertar', description: 'Empezar el día sin pantallas.',            sessionsPerDay: 1 },
    { name: 'Hacer la cama',                 description: 'Comenzar el día con orden.',                 sessionsPerDay: 1 },
    { name: 'Revisar mis finanzas',          description: 'Control diario de gastos e ingresos.',       sessionsPerDay: 1 },
  ],
};

// ── Group packs (multiple habits added at once) ───────────────────────────────
const GROUPS = [
  {
    id: 'g1',
    name: 'Pack Salud Completa',
    description: 'Cuerpo y mente en equilibrio',
    icon: '💪',
    color: '#10b981',
    habits: [
      { name: 'Hacer ejercicio',       category: 'Salud Física',    icon: 'fitness',   color: '#10b981', description: 'Actividad física diaria.',              sessionsPerDay: 1 },
      { name: 'Beber 8 vasos de agua', category: 'Salud Física',    icon: 'fitness',   color: '#10b981', description: 'Hidratación esencial.',                  sessionsPerDay: 8 },
      { name: 'Meditar',               category: 'Salud Mental',    icon: 'brain',     color: '#6366f1', description: 'Sesión de meditación diaria.',           sessionsPerDay: 1 },
      { name: 'Dormir 8 horas',        category: 'Salud Física',    icon: 'fitness',   color: '#10b981', description: 'Descanso reparador.',                    sessionsPerDay: 1 },
    ],
  },
  {
    id: 'g2',
    name: 'Pack Bienestar',
    description: 'Cultiva tu paz interior y conexiones',
    icon: '🌿',
    color: '#14b8a6',
    habits: [
      { name: 'Practicar gratitud',      category: 'Bienestar', icon: 'heart', color: '#14b8a6', description: 'Anotar 3 cosas por las que estar agradecido/a.', sessionsPerDay: 1 },
      { name: 'Llamar a un ser querido', category: 'Bienestar', icon: 'heart', color: '#14b8a6', description: 'Conectar con familia o amigos.',                  sessionsPerDay: 1 },
      { name: 'Tiempo de ocio',          category: 'Bienestar', icon: 'heart', color: '#14b8a6', description: 'Tiempo para algo que disfruto sin culpa.',         sessionsPerDay: 1 },
      { name: 'Salir a la naturaleza',   category: 'Bienestar', icon: 'heart', color: '#14b8a6', description: 'Tiempo al aire libre.',                            sessionsPerDay: 1 },
    ],
  },
  {
    id: 'g3',
    name: 'Pack Productividad',
    description: 'Enfoque y rendimiento máximo',
    icon: '🚀',
    color: '#eab308',
    habits: [
      { name: 'Planificar el día',   category: 'Productividad', icon: 'trending-up', color: '#eab308', description: 'Organizar tareas y prioridades.',        sessionsPerDay: 1 },
      { name: 'Pomodoro de trabajo', category: 'Productividad', icon: 'trending-up', color: '#eab308', description: 'Bloques de trabajo de 25 minutos.',       sessionsPerDay: 4 },
      { name: 'Revisar mis metas',   category: 'Productividad', icon: 'trending-up', color: '#eab308', description: 'Verificar progreso hacia mis objetivos.', sessionsPerDay: 1 },
      { name: 'Ordenar mi espacio',  category: 'Productividad', icon: 'trending-up', color: '#eab308', description: 'Mantener el entorno organizado.',         sessionsPerDay: 1 },
    ],
  },
  {
    id: 'g4',
    name: 'Pack Rutina Matutina',
    description: 'Empieza cada día con energía',
    icon: '🌅',
    color: '#3b82f6',
    habits: [
      { name: 'Hacer la cama',                   category: 'Hábitos Diarios', icon: 'sunny',   color: '#3b82f6', description: 'Comenzar el día con orden.',          sessionsPerDay: 1 },
      { name: 'No usar el celular al despertar', category: 'Hábitos Diarios', icon: 'sunny',   color: '#3b82f6', description: 'Empezar el día sin pantallas.',         sessionsPerDay: 1 },
      { name: 'Estiramientos',                   category: 'Salud Física',    icon: 'fitness', color: '#10b981', description: 'Flexibilidad para reducir tensión.',    sessionsPerDay: 2 },
      { name: 'Tomar vitaminas',                 category: 'Hábitos Diarios', icon: 'sunny',   color: '#3b82f6', description: 'Suplementos diarios.',                  sessionsPerDay: 1 },
    ],
  },
  {
    id: 'g5',
    name: 'Pack Salud Mental',
    description: 'Cuida tu mente cada día',
    icon: '🧘',
    color: '#6366f1',
    habits: [
      { name: 'Meditar',                   category: 'Salud Mental', icon: 'brain', color: '#6366f1', description: 'Sesión de meditación.',               sessionsPerDay: 1 },
      { name: 'Escribir en el diario',     category: 'Salud Mental', icon: 'brain', color: '#6366f1', description: 'Reflexión sobre pensamientos.',        sessionsPerDay: 1 },
      { name: 'Respiración profunda',      category: 'Salud Mental', icon: 'brain', color: '#6366f1', description: 'Ejercicios para reducir el estrés.',   sessionsPerDay: 3 },
      { name: 'Desconectarme del celular', category: 'Salud Mental', icon: 'brain', color: '#6366f1', description: 'Tiempo sin pantallas para la mente.',  sessionsPerDay: 1 },
    ],
  },
];

const forbiddenWords = ['fumar','cigarrillo','alcohol','droga','marihuana','jugar','apostar','porno','masturbar','vicio','maldad','malo'];

const daysOfWeek = [
  { id: 'monday',    name: 'Lunes',     short: 'L' },
  { id: 'tuesday',   name: 'Martes',    short: 'M' },
  { id: 'wednesday', name: 'Miércoles', short: 'X' },
  { id: 'thursday',  name: 'Jueves',    short: 'J' },
  { id: 'friday',    name: 'Viernes',   short: 'V' },
  { id: 'saturday',  name: 'Sábado',    short: 'S' },
  { id: 'sunday',    name: 'Domingo',   short: 'D' },
];

const DAY_QUICK = [
  { label: 'Todos',         ids: daysOfWeek.map(d => d.id) },
  { label: 'Lun–Vie',       ids: ['monday','tuesday','wednesday','thursday','friday'] },
  { label: 'Fin de semana', ids: ['saturday','sunday'] },
];

function toISO(date) { return date.toISOString().split('T')[0]; }
function fmt(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ── Inline date picker ────────────────────────────────────────────────────────
function InlineDatePicker({ label, value, onChange, minDate }) {
  const today  = new Date();
  const parsed = value ? new Date(value + 'T12:00:00') : today;
  const [year,  setYear]  = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [day,   setDay]   = useState(parsed.getDate());
  const [open,  setOpen]  = useState(false);
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const dim = new Date(year, month, 0).getDate();
  const cd  = Math.min(day, dim);

  const confirm = () => {
    const iso = `${year}-${String(month).padStart(2,'0')}-${String(cd).padStart(2,'0')}`;
    if (minDate && iso < minDate) { Alert.alert('Fecha inválida','La fecha fin no puede ser anterior al inicio.'); return; }
    onChange(iso); setOpen(false);
  };

  const Step = ({ display, onInc, onDec }) => (
    <View style={dp.row}>
      <TouchableOpacity style={dp.btn} onPress={onDec}><Ionicons name="chevron-back" size={14} color="#166534"/></TouchableOpacity>
      <Text style={dp.val}>{display}</Text>
      <TouchableOpacity style={dp.btn} onPress={onInc}><Ionicons name="chevron-forward" size={14} color="#166534"/></TouchableOpacity>
    </View>
  );

  return (
    <View>
      <TouchableOpacity style={dp.trigger} onPress={() => setOpen(o => !o)}>
        <Ionicons name="calendar-outline" size={16} color="#10b981"/>
        <Text style={dp.trigLabel}>{label}</Text>
        <Text style={dp.trigVal}>{value ? fmt(value) : 'Seleccionar'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#86efac"/>
      </TouchableOpacity>
      {open && (
        <View style={dp.panel}>
          <View style={dp.cols}>
            <View style={dp.col}><Text style={dp.colLabel}>Día</Text><Step display={String(cd)} onInc={()=>setDay(d=>Math.min(d+1,dim))} onDec={()=>setDay(d=>Math.max(d-1,1))}/></View>
            <View style={dp.col}><Text style={dp.colLabel}>Mes</Text><Step display={MONTHS[month-1]} onInc={()=>setMonth(m=>m===12?1:m+1)} onDec={()=>setMonth(m=>m===1?12:m-1)}/></View>
            <View style={dp.col}><Text style={dp.colLabel}>Año</Text><Step display={String(year)} onInc={()=>setYear(y=>y+1)} onDec={()=>setYear(y=>Math.max(y-1,today.getFullYear()))}/></View>
          </View>
          <TouchableOpacity style={dp.confirm} onPress={confirm}>
            <Ionicons name="checkmark-circle" size={16} color="#fff"/>
            <Text style={dp.confirmTxt}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Group config modal (days + dates for the whole group) ─────────────────────
function GroupConfigScreen({ group, onConfirm, onBack }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startDate,    setStartDate]    = useState(toISO(new Date()));
  const [endDate,      setEndDate]      = useState('');
  const [selected, setSelected] = useState(group.habits.map((_, i) => i));

  const toggleDay = id => setSelectedDays(p => p.includes(id) ? p.filter(d=>d!==id) : [...p,id]);
  const toggleHabit = idx => setSelected(p => p.includes(idx) ? p.filter(i=>i!==idx) : [...p,idx]);

  const handleConfirm = () => {
    if (!selectedDays.length) { Alert.alert('Error','Selecciona al menos un día'); return; }
    if (!selected.length)     { Alert.alert('Error','Selecciona al menos un hábito del grupo'); return; }
    onConfirm({ days: selectedDays, startDate, endDate: endDate || null, habitIndexes: selected });
  };

  return (
    <ScrollView style={s.container}>
      <TouchableOpacity style={s.back} onPress={onBack}>
        <Ionicons name="chevron-back" size={17} color="#10b981"/>
        <Text style={s.backTxt}>Volver</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <Text style={s.groupEmoji}>{group.icon}</Text>
        <Text style={s.title}>{group.name}</Text>
        <Text style={s.subtitle}>{group.description}</Text>
      </View>

      <View style={s.form}>

        <Text style={s.label}>¿Cuáles hábitos quieres agregar?</Text>
        {group.habits.map((h, idx) => {
          const sel = selected.includes(idx);
          return (
            <TouchableOpacity
              key={idx}
              style={[s.groupHabitRow, sel && s.groupHabitRowSel, { borderLeftColor: h.color }]}
              onPress={() => toggleHabit(idx)}
            >
              <View style={[s.groupHabitCheck, sel && { backgroundColor: h.color, borderColor: h.color }]}>
                {sel && <Ionicons name="checkmark" size={14} color="#fff"/>}
              </View>
              <View style={s.groupHabitInfo}>
                <Text style={s.groupHabitName}>{h.name}</Text>
                <Text style={s.groupHabitMeta}>{h.category}{h.sessionsPerDay > 1 ? ` · ${h.sessionsPerDay}× al día` : ''}</Text>
              </View>
              {h.sessionsPerDay > 1 && (
                <View style={[s.badge, { backgroundColor: h.color }]}>
                  <Text style={s.badgeTxt}>{h.sessionsPerDay}×</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <Text style={s.selCount}>{selected.length} de {group.habits.length} seleccionados</Text>

        <Text style={s.label}>¿Qué días?</Text>
        <View style={s.days}>
          {daysOfWeek.map(day => {
            const sel = selectedDays.includes(day.id);
            return (
              <TouchableOpacity key={day.id} style={[s.dayBtn, sel && s.dayBtnSel]} onPress={() => toggleDay(day.id)}>
                <Text style={[s.dayShort, sel && s.daySel]}>{day.short}</Text>
                <Text style={[s.dayName,  sel && s.daySel]}>{day.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={s.quickRow}>
          {DAY_QUICK.map(q => (
            <TouchableOpacity key={q.label} style={s.quickBtn} onPress={() => setSelectedDays(q.ids)}>
              <Text style={s.quickTxt}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Período</Text>
        <View style={s.dateCard}>
          <InlineDatePicker label="Inicio" value={startDate} onChange={v => { setStartDate(v); if (endDate && endDate<v) setEndDate(''); }}/>
          <View style={s.dateLine}/>
          <InlineDatePicker label="Fin (opcional)" value={endDate} onChange={setEndDate} minDate={startDate}/>
          {startDate && endDate && (
            <View style={s.durBadge}>
              <Ionicons name="time-outline" size={13} color="#10b981"/>
              <Text style={s.durTxt}>{Math.round((new Date(endDate)-new Date(startDate))/86400000)} días</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[s.createBtn, (!selectedDays.length || !selected.length) && s.createBtnOff]}
          onPress={handleConfirm}
          disabled={!selectedDays.length || !selected.length}
        >
          <Ionicons name="layers" size={22} color="#fff"/>
          <Text style={s.createTxt}>Agregar {selected.length} hábito{selected.length !== 1 ? 's' : ''}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Single habit form ─────────────────────────────────────────────────────────
function HabitForm({ selectedCategory, initialName, initialDesc, initialSessions, onConfirm, onBack }) {
  const [name,           setName]           = useState(initialName    ?? '');
  const [description,    setDescription]    = useState(initialDesc    ?? '');
  const [sessionsPerDay, setSessionsPerDay] = useState(initialSessions ?? 1);
  const [selectedDays,   setSelectedDays]   = useState([]);
  const [startDate,      setStartDate]      = useState(toISO(new Date()));
  const [endDate,        setEndDate]        = useState('');

  const toggleDay = id => setSelectedDays(p => p.includes(id) ? p.filter(d=>d!==id) : [...p,id]);
  const canCreate = selectedCategory && name.trim() && selectedDays.length > 0;

  const handleCreate = () => {
    if (!name.trim())         { Alert.alert('Error','El nombre es obligatorio'); return; }
    if (!selectedDays.length) { Alert.alert('Error','Selecciona al menos un día'); return; }
    if (endDate && endDate < startDate) { Alert.alert('Error','La fecha fin no puede ser anterior al inicio'); return; }
    if (forbiddenWords.some(w => name.toLowerCase().includes(w))) {
      Alert.alert('Hábito no permitido','Solo se permiten hábitos positivos y saludables.',[{text:'Entendido'}]); return;
    }
    onConfirm({ name: name.trim(), description: description.trim(), sessionsPerDay, days: selectedDays, startDate, endDate: endDate || null });
  };

  return (
    <ScrollView style={s.container}>
      <TouchableOpacity style={s.back} onPress={onBack}>
        <Ionicons name="chevron-back" size={17} color="#10b981"/>
        <Text style={s.backTxt}>Volver a plantillas</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <View style={[s.catPill, { backgroundColor: selectedCategory?.color + '22' }]}>
          <Ionicons name={selectedCategory?.icon} size={16} color={selectedCategory?.color}/>
          <Text style={[s.catPillTxt, { color: selectedCategory?.color }]}>{selectedCategory?.name}</Text>
        </View>
        <Text style={s.title}>{name || 'Nuevo hábito'}</Text>
        <Text style={s.subtitle}>Configura los detalles</Text>
      </View>

      <View style={s.form}>
        <Text style={s.label}>Nombre</Text>
        <TextInput style={s.input} placeholder="Ej: Beber 2 litros de agua" value={name} onChangeText={setName} maxLength={65}/>

        <Text style={s.label}>Descripción (opcional)</Text>
        <TextInput style={[s.input, s.area]} placeholder="¿Para qué lo quieres lograr?" value={description} onChangeText={setDescription} multiline numberOfLines={3}/>

        <Text style={s.label}>¿Qué días?</Text>
        <View style={s.days}>
          {daysOfWeek.map(day => {
            const sel = selectedDays.includes(day.id);
            return (
              <TouchableOpacity key={day.id} style={[s.dayBtn, sel && s.dayBtnSel]} onPress={() => toggleDay(day.id)}>
                <Text style={[s.dayShort, sel && s.daySel]}>{day.short}</Text>
                <Text style={[s.dayName,  sel && s.daySel]}>{day.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={s.quickRow}>
          {DAY_QUICK.map(q => (
            <TouchableOpacity key={q.label} style={s.quickBtn} onPress={() => setSelectedDays(q.ids)}>
              <Text style={s.quickTxt}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>¿Cuántas veces al día?</Text>
        <View style={s.sessRow}>
          <TouchableOpacity style={s.sessBtn} onPress={() => setSessionsPerDay(n => Math.max(1,n-1))}>
            <Ionicons name="remove" size={22} color="#166534"/>
          </TouchableOpacity>
          <View style={s.sessDisplay}>
            <Text style={s.sessNum}>{sessionsPerDay}</Text>
            <Text style={s.sessLbl}>{sessionsPerDay===1?'vez por día':'veces por día'}</Text>
          </View>
          <TouchableOpacity style={s.sessBtn} onPress={() => setSessionsPerDay(n => Math.min(20,n+1))}>
            <Ionicons name="add" size={22} color="#166534"/>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>Período</Text>
        <View style={s.dateCard}>
          <InlineDatePicker label="Inicio" value={startDate} onChange={v => { setStartDate(v); if (endDate && endDate<v) setEndDate(''); }}/>
          <View style={s.dateLine}/>
          <InlineDatePicker label="Fin (opcional)" value={endDate} onChange={setEndDate} minDate={startDate}/>
          {startDate && endDate && (
            <View style={s.durBadge}>
              <Ionicons name="time-outline" size={13} color="#10b981"/>
              <Text style={s.durTxt}>{Math.round((new Date(endDate)-new Date(startDate))/86400000)} días</Text>
            </View>
          )}
        </View>

        {canCreate && (
          <View style={s.summary}>
            <Text style={s.summaryTitle}>Resumen</Text>
            <Text style={s.summaryLine}>📌 {name}</Text>
            <Text style={s.summaryLine}>🔁 {sessionsPerDay}× al día · {selectedDays.length} días/semana</Text>
            <Text style={s.summaryLine}>📅 {fmt(startDate)}{endDate ? ` → ${fmt(endDate)}` : ' (sin fecha fin)'}</Text>
          </View>
        )}

        <TouchableOpacity style={[s.createBtn, !canCreate && s.createBtnOff]} onPress={handleCreate} disabled={!canCreate}>
          <Ionicons name="checkmark-circle" size={22} color="#fff"/>
          <Text style={s.createTxt}>Crear Hábito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AddHabitScreen({ navigation }) {
  const { addHabit, addHabits } = useHabits();

  const [mode,            setMode]            = useState('choose');
  const [selectedGroup,   setSelectedGroup]   = useState(null);
  const [selectedCat,     setSelectedCat]     = useState(null);
  const [presetData,      setPresetData]      = useState(null);
  const [tab,             setTab]             = useState('groups');

  const resetAll = () => {
    setMode('choose');
    setSelectedGroup(null);
    setSelectedCat(null);
    setPresetData(null);
  };

  const handleSingleConfirm = (data) => {
    addHabit({
      name: data.name, description: data.description,
      category: selectedCat.name, categoryIcon: selectedCat.icon, categoryColor: selectedCat.color,
      days: data.days, sessionsPerDay: data.sessionsPerDay,
      startDate: data.startDate, endDate: data.endDate,
    });
    Alert.alert('¡Creado!', `"${data.name}" fue agregado correctamente`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    resetAll();
  };

  const handleGroupConfirm = ({ days, startDate, endDate, habitIndexes }) => {
    const chosen = selectedGroup.habits.filter((_, i) => habitIndexes.includes(i));
    // FIX: addHabits (batch) en lugar de forEach para evitar IDs duplicados
    addHabits(chosen.map(h => ({
      name: h.name, description: h.description,
      category: h.category, categoryIcon: h.icon, categoryColor: h.color,
      days, sessionsPerDay: h.sessionsPerDay, startDate, endDate,
    })));
    Alert.alert(
      '¡Pack agregado!',
      `Se crearon ${chosen.length} hábitos del ${selectedGroup.name}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    resetAll();
  };

  if (mode === 'group-config' && selectedGroup) {
    return <GroupConfigScreen group={selectedGroup} onConfirm={handleGroupConfirm} onBack={resetAll}/>;
  }

  if (mode === 'habit-form' && selectedCat) {
    return (
      <HabitForm
        selectedCategory={selectedCat}
        initialName={presetData?.name}
        initialDesc={presetData?.description}
        initialSessions={presetData?.sessionsPerDay}
        onConfirm={handleSingleConfirm}
        onBack={resetAll}
      />
    );
  }

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Ionicons name="add-circle-outline" size={50} color="#10b981"/>
        <Text style={s.title}>Nuevo Hábito</Text>
        <Text style={s.subtitle}>Elige un pack o un hábito individual</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab==='groups' && s.tabActive]}
          onPress={() => setTab('groups')}
        >
          <Ionicons name="layers-outline" size={16} color={tab==='groups'?'#fff':'#166534'}/>
          <Text style={[s.tabTxt, tab==='groups' && s.tabTxtActive]}>Packs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab==='individual' && s.tabActive]}
          onPress={() => setTab('individual')}
        >
          <Ionicons name="list-outline" size={16} color={tab==='individual'?'#fff':'#166534'}/>
          <Text style={[s.tabTxt, tab==='individual' && s.tabTxtActive]}>Individual</Text>
        </TouchableOpacity>
      </View>

      <View style={s.form}>

        {tab === 'groups' && GROUPS.map(group => (
          <TouchableOpacity
            key={group.id}
            style={[s.groupCard, { borderLeftColor: group.color }]}
            onPress={() => { setSelectedGroup(group); setMode('group-config'); }}
          >
            <Text style={s.groupEmoji}>{group.icon}</Text>
            <View style={s.groupCardInfo}>
              <Text style={s.groupCardName}>{group.name}</Text>
              <Text style={s.groupCardDesc}>{group.description}</Text>
              <View style={s.groupCardHabits}>
                {group.habits.map((h, i) => (
                  <View key={i} style={[s.miniChip, { backgroundColor: h.color + '22', borderColor: h.color + '55' }]}>
                    <Text style={[s.miniChipTxt, { color: h.color }]}>{h.name}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={group.color}/>
          </TouchableOpacity>
        ))}

        {tab === 'individual' && categories.map(cat => (
          <View key={cat.id} style={s.catBlock}>
            <View style={[s.catBar, { borderLeftColor: cat.color }]}>
              <Ionicons name={cat.icon} size={18} color={cat.color}/>
              <Text style={s.catBarText}>{cat.name}</Text>
            </View>
            <View style={s.chips}>
              {(PRESETS[cat.name]??[]).map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.chip, { borderColor: cat.color + '44' }]}
                  onPress={() => { setSelectedCat(cat); setPresetData(p); setMode('habit-form'); }}
                >
                  <Text style={s.chipName}>{p.name}</Text>
                  {p.sessionsPerDay > 1 && (
                    <View style={[s.chipBadge, { backgroundColor: cat.color }]}>
                      <Text style={s.chipBadgeTxt}>{p.sessionsPerDay}×</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.chip, s.chipCustom, { borderColor: cat.color }]}
                onPress={() => { setSelectedCat(cat); setPresetData(null); setMode('habit-form'); }}
              >
                <Ionicons name="pencil-outline" size={13} color={cat.color}/>
                <Text style={[s.chipName, { color: cat.color }]}>Crear el mío</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f0fdf4' },
  header:    { alignItems:'center', paddingTop:34, paddingBottom:24, backgroundColor:'#fff', borderBottomLeftRadius:24, borderBottomRightRadius:24 },
  title:     { fontSize:24, fontWeight:'bold', color:'#166534', marginTop:10 },
  subtitle:  { fontSize:13, color:'#4ade80', marginTop:4 },
  groupEmoji:{ fontSize:32, marginBottom:4 },
  form:      { padding:16 },
  label:     { fontSize:15, fontWeight:'600', color:'#166534', marginBottom:10, marginTop:20 },

  back:      { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:14, gap:4 },
  backTxt:   { fontSize:14, color:'#10b981', fontWeight:'600' },
  catPill:   { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:6, borderRadius:99, marginBottom:6 },
  catPillTxt:{ fontSize:13, fontWeight:'700' },

  tabs:      { flexDirection:'row', margin:16, marginBottom:0, backgroundColor:'#fff', borderRadius:14, borderWidth:1, borderColor:'#86efac', overflow:'hidden' },
  tab:       { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:12, gap:6 },
  tabActive: { backgroundColor:'#10b981' },
  tabTxt:    { fontSize:14, fontWeight:'700', color:'#166534' },
  tabTxtActive:{ color:'#fff' },

  groupCard:     { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:18, padding:16, marginBottom:14, borderLeftWidth:5, borderWidth:1, borderColor:'#e5e7eb', shadowColor:'#166534', shadowOffset:{width:0,height:3}, shadowOpacity:0.08, shadowRadius:8, elevation:5, gap:12 },
  groupCardInfo: { flex:1 },
  groupCardName: { fontSize:16, fontWeight:'700', color:'#166534', marginBottom:2 },
  groupCardDesc: { fontSize:13, color:'#6b7280', marginBottom:8 },
  groupCardHabits:{ flexDirection:'row', flexWrap:'wrap', gap:5 },
  miniChip:      { borderWidth:1, borderRadius:8, paddingHorizontal:7, paddingVertical:3 },
  miniChipTxt:   { fontSize:11, fontWeight:'600' },

  groupHabitRow:    { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, borderLeftWidth:4, borderWidth:1, borderColor:'#e5e7eb', gap:12 },
  groupHabitRowSel: { borderColor:'#86efac', backgroundColor:'#f0fdf4' },
  groupHabitCheck:  { width:24, height:24, borderRadius:12, borderWidth:2, borderColor:'#86efac', alignItems:'center', justifyContent:'center' },
  groupHabitInfo:   { flex:1 },
  groupHabitName:   { fontSize:14, fontWeight:'600', color:'#166534' },
  groupHabitMeta:   { fontSize:12, color:'#86efac', marginTop:2 },
  badge:            { borderRadius:8, paddingHorizontal:7, paddingVertical:3 },
  badgeTxt:         { fontSize:11, color:'#fff', fontWeight:'700' },
  selCount:         { fontSize:13, color:'#10b981', fontWeight:'600', marginTop:6, textAlign:'center' },

  catBlock:    { marginBottom:20 },
  catBar:      { flexDirection:'row', alignItems:'center', gap:10, borderLeftWidth:4, paddingLeft:10, marginBottom:10 },
  catBarText:  { fontSize:15, fontWeight:'700', color:'#166534' },
  chips:       { flexDirection:'row', flexWrap:'wrap', gap:8 },
  chip:        { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#fff', borderWidth:1.5, borderRadius:12, paddingHorizontal:12, paddingVertical:8 },
  chipName:    { fontSize:13, fontWeight:'600', color:'#166534' },
  chipBadge:   { borderRadius:6, paddingHorizontal:5, paddingVertical:1 },
  chipBadgeTxt:{ fontSize:11, color:'#fff', fontWeight:'700' },
  chipCustom:  { backgroundColor:'transparent' },

  days:      { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', gap:8 },
  dayBtn:    { width:'31%', backgroundColor:'#fff', paddingVertical:12, borderRadius:14, alignItems:'center', borderWidth:2, borderColor:'#d1fae5', marginBottom:6 },
  dayBtnSel: { backgroundColor:'#10b981', borderColor:'#10b981' },
  dayShort:  { fontSize:19, fontWeight:'bold', color:'#166534' },
  dayName:   { fontSize:11, fontWeight:'600', color:'#166534', marginTop:3 },
  daySel:    { color:'#fff' },
  quickRow:  { flexDirection:'row', gap:8, marginTop:8 },
  quickBtn:  { flex:1, backgroundColor:'#ecfdf5', borderRadius:10, paddingVertical:8, alignItems:'center', borderWidth:1, borderColor:'#86efac' },
  quickTxt:  { fontSize:11, fontWeight:'700', color:'#166534' },

  sessRow:    { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#86efac', padding:12, gap:24 },
  sessBtn:    { width:40, height:40, borderRadius:20, backgroundColor:'#ecfdf5', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#86efac' },
  sessDisplay:{ alignItems:'center' },
  sessNum:    { fontSize:34, fontWeight:'bold', color:'#166534' },
  sessLbl:    { fontSize:12, color:'#4ade80', fontWeight:'600' },

  dateCard:  { backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#86efac', overflow:'hidden' },
  dateLine:  { height:1, backgroundColor:'#d1fae5' },
  durBadge:  { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:16, paddingVertical:10, backgroundColor:'#ecfdf5' },
  durTxt:    { fontSize:13, color:'#10b981', fontWeight:'600' },

  summary:      { backgroundColor:'#ecfdf5', borderRadius:14, padding:14, marginTop:20, borderLeftWidth:4, borderLeftColor:'#10b981' },
  summaryTitle: { fontSize:13, fontWeight:'700', color:'#166534', marginBottom:6 },
  summaryLine:  { fontSize:13, color:'#166534', marginBottom:3 },

  input: { backgroundColor:'#fff', borderWidth:1, borderColor:'#86efac', borderRadius:14, padding:14, fontSize:15, color:'#166534', marginBottom:4 },
  area:  { height:90, textAlignVertical:'top' },

  createBtn:    { backgroundColor:'#10b981', flexDirection:'row', alignItems:'center', justifyContent:'center', padding:17, borderRadius:16, marginTop:32, gap:8, marginBottom:40 },
  createBtnOff: { backgroundColor:'#86efac' },
  createTxt:    { color:'#fff', fontSize:16, fontWeight:'bold' },
});

const dp = StyleSheet.create({
  trigger:   { flexDirection:'row', alignItems:'center', padding:16, gap:10 },
  trigLabel: { fontSize:14, fontWeight:'600', color:'#166534', flex:1 },
  trigVal:   { fontSize:14, color:'#10b981', fontWeight:'700' },
  panel:     { backgroundColor:'#f0fdf4', borderTopWidth:1, borderTopColor:'#d1fae5', padding:16 },
  cols:      { flexDirection:'row', justifyContent:'space-around', marginBottom:16 },
  col:       { alignItems:'center', gap:8 },
  colLabel:  { fontSize:12, color:'#86efac', fontWeight:'600' },
  row:       { flexDirection:'row', alignItems:'center', gap:8 },
  btn:       { width:30, height:30, borderRadius:15, backgroundColor:'#fff', borderWidth:1, borderColor:'#86efac', alignItems:'center', justifyContent:'center' },
  val:       { fontSize:15, fontWeight:'bold', color:'#166534', minWidth:44, textAlign:'center' },
  confirm:   { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#10b981', borderRadius:12, padding:12, gap:8 },
  confirmTxt:{ color:'#fff', fontWeight:'700', fontSize:14 },
});