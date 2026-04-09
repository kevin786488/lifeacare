// screens/HomeScreen.js
import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// ── Anillo de progreso circular ───────────────────────────────────────────────
function CircularProgress({ percentage, size = 72, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (1 - percentage / 100);

  return (
    <Svg width={size} height={size}>
      {/* Pista de fondo */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#d1fae5"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Arco de progreso */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#10b981"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={filled}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ── Mini vista de los últimos 5 días ─────────────────────────────────────────
function WeekMini({ habits }) {
  const days = useMemo(() => {
    const result = [];
    const LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const done = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      const total = habits.length;
      const isToday = i === 0;
      let type = 'none';
      if (total > 0) {
        if (done === total) type = 'full';
        else if (done > 0) type = 'partial';
      }
      result.push({ label: LABELS[d.getDay()], type, isToday, done, total });
    }
    return result;
  }, [habits]);

  return (
    <View style={week.container}>
      <Text style={week.sectionTitle}>Últimos 5 días</Text>
      <View style={week.row}>
        {days.map((day, idx) => (
          <View key={idx} style={week.dayCol}>
            <Text style={week.label}>{day.label}</Text>
            <View
              style={[
                week.dot,
                day.type === 'full' && week.dotFull,
                day.type === 'partial' && week.dotPartial,
                day.type === 'none' && week.dotNone,
                day.isToday && week.dotToday,
              ]}
            >
              {day.type === 'full' && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
              {day.type === 'partial' && (
                <Text style={week.dotText}>~</Text>
              )}
            </View>
            {day.isToday && <Text style={week.todayLabel}>hoy</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { habits, toggleHabitToday } = useContext(HabitContext);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const progress = habits.length > 0
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const currentStreak = useMemo(() => {
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!habits.some(h => h.completedDates?.includes(dateStr))) break;
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  }, [habits]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>LifeCare</Text>

      <View style={styles.grid}>

        {/* Card 1: Progreso — ahora con anillo circular */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={30} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Progreso Hoy</Text>

          {/* Anillo + número centrado */}
          <View style={progressRing.wrapper}>
            <CircularProgress percentage={progress} size={80} strokeWidth={7} />
            <View style={progressRing.center}>
              <Text style={progressRing.pct}>{progress}%</Text>
            </View>
          </View>

          <Text style={styles.bigNumber}>
            {completedToday} <Text style={styles.small}>/ {habits.length}</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.cardSubtitle}>{progress}% completado</Text>
        </View>

        {/* Card 2: Racha — sin cambios */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={30} color="#f59e0b" />
          </View>
          <Text style={styles.cardTitle}>Racha Actual</Text>
          <Text style={styles.bigNumber}>{currentStreak}</Text>
          <Text style={styles.cardSubtitle}>días consecutivos</Text>
        </View>

        {/* Card 3: Mis Hábitos — sin cambios */}
        <View style={[styles.card, styles.habitsCard]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkbox-outline" size={30} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Hábitos de Hoy</Text>

          {habits.length === 0 ? (
            <Text style={styles.noHabitsText}>Aún no tienes hábitos</Text>
          ) : (
            habits.slice(0, 4).map(habit => (
              <TouchableOpacity
                key={habit.id}
                style={styles.miniHabitRow}
                onPress={() => toggleHabitToday(habit.id)}
              >
                <Text style={styles.miniCategory}>{habit.categoryEmoji}</Text>
                <Text style={[
                  styles.miniHabitName,
                  habit.completedDates?.includes(today) && styles.completedText,
                ]}>
                  {habit.name}
                </Text>
                <Ionicons
                  name={habit.completedDates?.includes(today) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={habit.completedDates?.includes(today) ? '#10b981' : '#86efac'}
                />
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.addButtonText}>+ Nuevo hábito</Text>
          </TouchableOpacity>
        </View>

        {/* Card 4: Motivación — sin cambios */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={30} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Motivación</Text>
          <Text style={styles.recommendationText}>
            {progress === 100
              ? '¡Gran día! Estás cultivando consistencia 🌿'
              : 'La consistencia vence a la perfección. ¡Sigue adelante!'}
          </Text>
        </View>

      </View>

      {/* ── Mini vista últimos 5 días ── */}
      {habits.length > 0 && <WeekMini habits={habits} />}

      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => navigation.navigate('Stats')}
      >
        <Text style={styles.statsButtonText}>Ver Estadísticas Detalladas →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Estilos originales (sin tocar) ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4', padding: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#166534', textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12,
    alignItems: 'center', shadowColor: '#166534', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 8, borderWidth: 1, borderColor: '#86efac',
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#ecfdf5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#166534', marginBottom: 8 },
  bigNumber: { fontSize: 34, fontWeight: 'bold', color: '#166534' },
  small: { fontSize: 17, color: '#4ade80' },
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#d1fae5', borderRadius: 999, marginVertical: 8, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 999 },
  cardSubtitle: { fontSize: 14, color: '#4ade80', fontWeight: '600' },
  habitsCard: { minHeight: 220 },
  noHabitsText: { textAlign: 'center', color: '#86efac', marginVertical: 20 },
  miniHabitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 10 },
  miniCategory: { fontSize: 22, width: 32 },
  miniHabitName: { flex: 1, fontSize: 15, color: '#166534', marginHorizontal: 8 },
  completedText: { textDecorationLine: 'line-through', color: '#86efac' },
  addButton: { marginTop: 12, backgroundColor: '#10b981', padding: 12, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  recommendationText: { fontSize: 15, lineHeight: 23, textAlign: 'center', color: '#166534', marginTop: 8 },
  statsButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 4, marginBottom: 20 },
  statsButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});

// ── Estilos nuevos: anillo ────────────────────────────────────────────────────
const progressRing = StyleSheet.create({
  wrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
});

// ── Estilos nuevos: mini semana ───────────────────────────────────────────────
const week = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86efac',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#86efac',
    fontWeight: '600',
    marginBottom: 4,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFull: { backgroundColor: '#10b981' },
  dotPartial: { backgroundColor: '#86efac' },
  dotNone: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#d1fae5' },
  dotToday: { borderWidth: 2, borderColor: '#10b981' },
  dotText: { fontSize: 13, color: '#166534', fontWeight: '600' },
  todayLabel: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
});