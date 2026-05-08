// screens/HomeScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Circular progress ring ────────────────────────────────────────────────────
function CircularProgress({ percentage, size = 72, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (1 - percentage / 100);
  return (
    <Svg width={size} height={size}>
      <Circle cx={size/2} cy={size/2} r={radius} stroke="#d1fae5" strokeWidth={strokeWidth} fill="none"/>
      <Circle
        cx={size/2} cy={size/2} r={radius}
        stroke="#10b981" strokeWidth={strokeWidth} fill="none"
        strokeDasharray={`${circumference}`} strokeDashoffset={filled}
        strokeLinecap="round" rotation="-90" origin={`${size/2}, ${size/2}`}
      />
    </Svg>
  );
}

// ── Last-5-days strip ─────────────────────────────────────────────────────────
function WeekMini({ habits }) {
  const days = useMemo(() => {
    const LABELS = ['D','L','M','X','J','V','S'];
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - i));
      const dateStr = d.toISOString().split('T')[0];
      const done  = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      const total = habits.length;
      const isToday = i === 4;
      let type = 'none';
      if (total > 0) { if (done===total) type='full'; else if (done>0) type='partial'; }
      return { label: LABELS[d.getDay()], type, isToday };
    });
  }, [habits]);

  return (
    <View style={week.container}>
      <Text style={week.title}>Últimos 5 días</Text>
      <View style={week.row}>
        {days.map((day, idx) => (
          <View key={idx} style={week.col}>
            <Text style={week.label}>{day.label}</Text>
            <View style={[week.dot,
              day.type==='full'    && week.dotFull,
              day.type==='partial' && week.dotPartial,
              day.type==='none'    && week.dotNone,
              day.isToday          && week.dotToday,
            ]}>
              {day.type==='full'    && <Ionicons name="checkmark" size={12} color="#fff"/>}
              {day.type==='partial' && <Text style={week.dotTxt}>~</Text>}
            </View>
            {day.isToday && <Text style={week.todayLbl}>hoy</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Session counter ───────────────────────────────────────────────────────────
// FIX: cada hábito tiene su propio contador independiente.
// Al presionar +/- solo se afecta ESE hábito por su id único.
function SessionCounter({ habit, date, onUpdate }) {
  // Lee las sesiones completadas HOY solo para este hábito específico
  const done   = habit.dailySessions?.[date] ?? 0;
  const target = habit.sessionsPerDay ?? 1;
  const full   = done >= target;

  if (target === 1) {
    return (
      <TouchableOpacity
        onPress={() => onUpdate(habit.id, date, full ? 'remove' : 'add')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={full ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={full ? '#10b981' : '#86efac'}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={sc.wrap}>
      <TouchableOpacity
        style={[sc.btn, done === 0 && sc.btnOff]}
        onPress={() => onUpdate(habit.id, date, 'remove')}
        disabled={done === 0}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={13} color={done === 0 ? '#d1fae5' : '#166534'}/>
      </TouchableOpacity>

      <View style={[sc.display, full && sc.displayFull]}>
        <Text style={[sc.txt, full && sc.txtFull]}>{done}/{target}</Text>
      </View>

      <TouchableOpacity
        style={[sc.btn, full && sc.btnOff]}
        onPress={() => onUpdate(habit.id, date, 'add')}
        disabled={full}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={13} color={full ? '#d1fae5' : '#166534'}/>
      </TouchableOpacity>
    </View>
  );
}

// ── Date badge ────────────────────────────────────────────────────────────────
function DateBadge({ habit }) {
  if (!habit.startDate && !habit.endDate) return null;
  const today   = new Date().toISOString().split('T')[0];
  const expired = habit.endDate && today > habit.endDate;
  const future  = habit.startDate && today < habit.startDate;
  const fmtD = iso => { const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; };

  return (
    <View style={db.wrap}>
      <Ionicons name="calendar-outline" size={11} color={expired?'#ef4444':future?'#6366f1':'#10b981'}/>
      <Text style={[db.txt, expired&&db.red, future&&db.purple]}>
        {expired ? 'Finalizado' : future ? `Inicia ${fmtD(habit.startDate)}` : habit.endDate ? `Hasta ${fmtD(habit.endDate)}` : `Desde ${fmtD(habit.startDate)}`}
      </Text>
    </View>
  );
}

// ── Habit row ─────────────────────────────────────────────────────────────────
// FIX: cada fila es completamente independiente. El estado "completado" (tachado,
// opacidad) se calcula individualmente por habit.id, no en lote.
function HabitRow({ habit, today, isActive, onUpdate }) {
  // "completo" solo cuando las sesiones de ESTE hábito alcanzan su meta
  const doneSessions = habit.dailySessions?.[today] ?? 0;
  const target       = habit.sessionsPerDay ?? 1;
  const isFullDone   = doneSessions >= target;

  return (
    <View style={[
      styles.habitRow,
      isFullDone && styles.habitRowDone,
      !isActive  && styles.habitRowOff,
    ]}>
      <View style={[styles.habitBar, { backgroundColor: habit.categoryColor ?? '#10b981' }]}/>
      <View style={styles.habitInfo}>
        <Text style={[styles.habitName, isFullDone && styles.habitNameDone]}>
          {habit.name}
        </Text>
        <Text style={styles.habitMeta}>{habit.category}</Text>
        <DateBadge habit={habit}/>
      </View>
      {isActive
        ? <SessionCounter habit={habit} date={today} onUpdate={onUpdate}/>
        : <Ionicons name="pause-circle-outline" size={26} color="#d1fae5"/>
      }
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user, logout }                               = useAuth();
  const { habits, updateSession, isHabitActiveOnDate } = useHabits();

  const today = new Date().toISOString().split('T')[0];

  // Solo los hábitos activos hoy entran en el cálculo de progreso
  const activeHabits = habits.filter(h => isHabitActiveOnDate(h, today));

  // FIX: un hábito se cuenta como "completado hoy" cuando sus sesiones alcanzan
  // su meta individual. Nunca depende del estado de otro hábito.
  const completedToday = activeHabits.filter(h => {
    const done   = h.dailySessions?.[today] ?? 0;
    const target = h.sessionsPerDay ?? 1;
    return done >= target;
  }).length;

  const progress = activeHabits.length > 0
    ? Math.round((completedToday / activeHabits.length) * 100)
    : 0;

  const currentStreak = useMemo(() => {
    let streak = 0;
    const check = new Date();
    while (true) {
      const ds     = check.toISOString().split('T')[0];
      const active = habits.filter(h => isHabitActiveOnDate(h, ds));
      if (!active.length) break;
      // Todos los hábitos activos ese día deben estar completados
      const allDone = active.every(h => {
        const done   = h.dailySessions?.[ds] ?? 0;
        const target = h.sessionsPerDay ?? 1;
        return done >= target;
      });
      if (!allDone) break;
      streak++;
      check.setDate(check.getDate() - 1);
    }
    return streak;
  }, [habits]);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await logout(); navigation.replace('Login'); } },
    ]);
  };

  const displayName = user?.name && user.name !== user?.email?.split('@')[0]
    ? user.name
    : user?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <ScrollView style={styles.container}>

      {/* ── Header with greeting ── */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>LifeCare</Text>
        <Text style={styles.greeting}>
          {getGreeting()}, <Text style={styles.greetingName}>{displayName}</Text> 👋
        </Text>
      </View>

      {/* ── Stats grid ── */}
      <View style={styles.grid}>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={28} color="#10b981"/>
          </View>
          <Text style={styles.cardTitle}>Progreso Hoy</Text>
          <View style={ring.wrap}>
            <CircularProgress percentage={progress} size={78} strokeWidth={7}/>
            <View style={ring.center}><Text style={ring.pct}>{progress}%</Text></View>
          </View>
          <Text style={styles.bigNum}>{completedToday} <Text style={styles.small}>/ {activeHabits.length}</Text></Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width:`${progress}%` }]}/></View>
          <Text style={styles.cardSub}>{progress}% completado</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={28} color="#f59e0b"/>
          </View>
          <Text style={styles.cardTitle}>Racha Actual</Text>
          <Text style={styles.bigNum}>{currentStreak}</Text>
          <Text style={styles.cardSub}>días consecutivos</Text>
        </View>

        <View style={[styles.card, { width:'100%' }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={28} color="#10b981"/>
          </View>
          <Text style={styles.cardTitle}>Motivación</Text>
          <Text style={styles.motivTxt}>
            {progress===100 ? '¡Gran día! Estás cultivando consistencia 🌿' : 'La consistencia vence a la perfección. ¡Sigue adelante!'}
          </Text>
        </View>
      </View>

      {/* ── Habit list ── */}
      <View style={styles.habitsCard}>
        <View style={styles.habitsHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkbox-outline" size={24} color="#10b981"/>
          </View>
          <Text style={styles.habitsTitle}>Hábitos de Hoy</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddHabit')}>
            <Ionicons name="add" size={18} color="#fff"/>
            <Text style={styles.addBtnTxt}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={38} color="#86efac"/>
            <Text style={styles.emptyTxt}>Aún no tienes hábitos</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddHabit')}>
              <Text style={styles.emptyBtnTxt}>+ Crear mi primer hábito</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // FIX: cada hábito usa HabitRow que calcula su propio estado.
          // Marcar un hábito NO afecta a los demás, incluso si vienen del mismo pack.
          habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              today={today}
              isActive={isHabitActiveOnDate(habit, today)}
              onUpdate={updateSession}
            />
          ))
        )}
      </View>

      {habits.length > 0 && <WeekMini habits={habits}/>}

      <TouchableOpacity style={styles.statsBtn} onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.statsBtnTxt}>Ver Estadísticas Detalladas →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={19} color="#ef4444"/>
        <Text style={styles.logoutTxt}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#f0fdf4', padding:16 },

  appHeader:   { alignItems:'center', marginBottom:24, paddingTop:8 },
  appTitle:    { fontSize:28, fontWeight:'bold', color:'#166534' },
  greeting:    { fontSize:15, color:'#4ade80', marginTop:4, fontWeight:'500' },
  greetingName:{ color:'#10b981', fontWeight:'800' },

  grid:        { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  card:        { width:'48%', backgroundColor:'#fff', borderRadius:20, padding:14, marginBottom:12, alignItems:'center', shadowColor:'#166534', shadowOffset:{width:0,height:5}, shadowOpacity:0.1, shadowRadius:10, elevation:8, borderWidth:1, borderColor:'#86efac' },
  iconCircle:  { width:52, height:52, borderRadius:26, backgroundColor:'#ecfdf5', alignItems:'center', justifyContent:'center', marginBottom:8 },
  cardTitle:   { fontSize:14, fontWeight:'600', color:'#166534', marginBottom:8 },
  bigNum:      { fontSize:32, fontWeight:'bold', color:'#166534' },
  small:       { fontSize:16, color:'#4ade80' },
  barBg:       { width:'100%', height:7, backgroundColor:'#d1fae5', borderRadius:999, marginVertical:8, overflow:'hidden' },
  barFill:     { height:'100%', backgroundColor:'#10b981', borderRadius:999 },
  cardSub:     { fontSize:13, color:'#4ade80', fontWeight:'600' },
  motivTxt:    { fontSize:14, lineHeight:22, textAlign:'center', color:'#166534', marginTop:6 },

  habitsCard:   { backgroundColor:'#fff', borderRadius:20, padding:16, marginBottom:16, borderWidth:1, borderColor:'#86efac', shadowColor:'#166534', shadowOffset:{width:0,height:5}, shadowOpacity:0.1, shadowRadius:10, elevation:8 },
  habitsHeader: { flexDirection:'row', alignItems:'center', marginBottom:12, gap:10 },
  habitsTitle:  { flex:1, fontSize:16, fontWeight:'700', color:'#166534' },
  addBtn:       { flexDirection:'row', alignItems:'center', backgroundColor:'#10b981', borderRadius:10, paddingHorizontal:12, paddingVertical:6, gap:4 },
  addBtnTxt:    { color:'#fff', fontWeight:'700', fontSize:13 },

  empty:        { alignItems:'center', paddingVertical:22, gap:10 },
  emptyTxt:     { color:'#86efac', fontSize:14 },
  emptyBtn:     { backgroundColor:'#10b981', paddingHorizontal:20, paddingVertical:12, borderRadius:12 },
  emptyBtnTxt:  { color:'#fff', fontWeight:'600', fontSize:14 },

  // FIX: habitRow no depende de completedDates globales, sino de dailySessions del hábito
  habitRow:     { flexDirection:'row', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f0fdf4', gap:12 },
  habitRowDone: { opacity:0.7 },
  habitRowOff:  { opacity:0.4 },
  habitBar:     { width:4, height:38, borderRadius:2 },
  habitInfo:    { flex:1 },
  habitName:    { fontSize:14, color:'#166534', fontWeight:'600' },
  habitNameDone:{ textDecorationLine:'line-through', color:'#86efac' },
  habitMeta:    { fontSize:12, color:'#86efac', marginTop:2 },

  statsBtn:     { backgroundColor:'#10b981', padding:16, borderRadius:16, alignItems:'center', marginTop:4, marginBottom:20 },
  statsBtnTxt:  { color:'#fff', fontSize:16, fontWeight:'600' },
  logoutBtn:    { flexDirection:'row', alignItems:'center', justifyContent:'center', padding:16, marginBottom:40, gap:8 },
  logoutTxt:    { color:'#ef4444', fontSize:15, fontWeight:'600' },
});

const ring = StyleSheet.create({
  wrap:   { width:78, height:78, alignItems:'center', justifyContent:'center', marginBottom:8 },
  center: { position:'absolute', alignItems:'center', justifyContent:'center' },
  pct:    { fontSize:15, fontWeight:'bold', color:'#166534' },
});

const sc = StyleSheet.create({
  wrap:       { flexDirection:'row', alignItems:'center', gap:5 },
  btn:        { width:24, height:24, borderRadius:12, backgroundColor:'#ecfdf5', borderWidth:1, borderColor:'#86efac', alignItems:'center', justifyContent:'center' },
  btnOff:     { borderColor:'#d1fae5', backgroundColor:'#f9fffe' },
  display:    { minWidth:40, height:26, borderRadius:8, backgroundColor:'#f0fdf4', borderWidth:1, borderColor:'#86efac', alignItems:'center', justifyContent:'center', paddingHorizontal:5 },
  displayFull:{ backgroundColor:'#10b981', borderColor:'#10b981' },
  txt:        { fontSize:12, fontWeight:'700', color:'#166534' },
  txtFull:    { color:'#fff' },
});

const db = StyleSheet.create({
  wrap:   { flexDirection:'row', alignItems:'center', gap:4, marginTop:3 },
  txt:    { fontSize:11, color:'#10b981', fontWeight:'600' },
  red:    { color:'#ef4444' },
  purple: { color:'#6366f1' },
});

const week = StyleSheet.create({
  container: { backgroundColor:'#fff', borderRadius:20, padding:20, marginBottom:16, borderWidth:1, borderColor:'#86efac', shadowColor:'#166534', shadowOffset:{width:0,height:5}, shadowOpacity:0.1, shadowRadius:10, elevation:8 },
  title:     { fontSize:14, fontWeight:'600', color:'#166534', marginBottom:14, textAlign:'center' },
  row:       { flexDirection:'row', justifyContent:'space-around', alignItems:'flex-start' },
  col:       { alignItems:'center', gap:4 },
  label:     { fontSize:11, color:'#86efac', fontWeight:'600', marginBottom:4 },
  dot:       { width:36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center' },
  dotFull:   { backgroundColor:'#10b981' },
  dotPartial:{ backgroundColor:'#86efac' },
  dotNone:   { backgroundColor:'#f0fdf4', borderWidth:1, borderColor:'#d1fae5' },
  dotToday:  { borderWidth:2, borderColor:'#10b981' },
  dotTxt:    { fontSize:12, color:'#166534', fontWeight:'600' },
  todayLbl:  { fontSize:9, color:'#10b981', fontWeight:'600', marginTop:2 },
});