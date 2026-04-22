// screens/StatsScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHabits } from '../context/HabitContext';

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAYS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function StatsScreen() {
  const { habits } = useHabits();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedHabit, setSelectedHabit] = useState('all');

  // ── Estadísticas generales ──────────────────────────────────────────────────
  const totalHabits = habits.length;

  const completedToday = habits.filter(
    h => h.completedDates?.includes(todayStr)
  ).length;

  const completionRateToday =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const totalCompletions = habits.reduce(
    (sum, h) => sum + (h.completedDates?.length ?? 0),
    0
  );

  const avgCompletionRate =
    totalHabits > 0
      ? Math.min(Math.round((totalCompletions / (totalHabits * 30)) * 100), 99)
      : 0;

  const bestHabit = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((best, current) => {
      const cur = current.completedDates?.length ?? 0;
      const b = best.completedDates?.length ?? 0;
      return cur > b ? current : best;
    });
  }, [habits]);

  // ── Racha ───────────────────────────────────────────────────────────────────
  const streak = useMemo(() => {
    let count = 0;
    const check = new Date(today);
    while (true) {
      const s = check.toISOString().split('T')[0];
      const anyDone = habits.some(h => h.completedDates?.includes(s));
      if (!anyDone) break;
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  }, [habits]);

  // ── Navegación de mes ───────────────────────────────────────────────────────
  function changeMonth(dir) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function goToToday() {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  }

  // ── Datos de un día ─────────────────────────────────────────────────────────
  function getDayData(dateStr) {
    if (selectedHabit === 'all') {
      const done = habits.filter(h => h.completedDates?.includes(dateStr)).length;
      return { done, total: habits.length };
    }
    const idx = parseInt(selectedHabit, 10);
    const done = habits[idx]?.completedDates?.includes(dateStr) ? 1 : 0;
    return { done, total: 1 };
  }

  // ── Construcción de celdas ──────────────────────────────────────────────────
  function buildCalendarDays() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const isFutureMonth =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ key: `empty-${i}`, empty: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${m}-${dd}`;
      const isToday = dateStr === todayStr;
      const isFuture =
        isFutureMonth ||
        (viewYear === today.getFullYear() &&
          viewMonth === today.getMonth() &&
          d > today.getDate());

      let type = 'future';
      let done = 0;
      let total = habits.length;
      let habitsDone = [];

      if (!isFuture && habits.length > 0) {
        const data = getDayData(dateStr);
        done = data.done;
        total = data.total;
        if (done === total && total > 0) type = 'full';
        else if (done > 0) type = 'partial';
        else type = 'none';

        if (selectedHabit === 'all') {
          habitsDone = habits.map(h => h.completedDates?.includes(dateStr) ?? false);
        }
      } else if (!isFuture && habits.length === 0) {
        type = 'none';
      }

      cells.push({ key: dateStr, day: d, type, isToday, done, total, isFuture, habitsDone });
    }

    return cells;
  }

  const calendarDays = buildCalendarDays();

  // ── Resumen mensual ─────────────────────────────────────────────────────────
  const monthSummary = useMemo(() => {
    if (habits.length === 0) return null;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const isFutureMonth =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    let completedDays = 0;
    let totalPastDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${m}-${dd}`;
      const isFuture =
        isFutureMonth ||
        (viewYear === today.getFullYear() &&
          viewMonth === today.getMonth() &&
          d > today.getDate());

      if (!isFuture) {
        totalPastDays++;
        const { done, total } = getDayData(dateStr);
        if (total > 0 && done > 0) completedDays++;
      }
    }

    if (totalPastDays === 0) return null;
    const pct = Math.round((completedDays / totalPastDays) * 100);
    return `${pct}% de días con progreso este mes`;
  }, [habits, viewYear, viewMonth, selectedHabit]);

  // ── Mensaje motivacional ────────────────────────────────────────────────────
  function motivationMessage() {
    if (totalHabits === 0)
      return 'Añade hábitos para ver tus estadísticas y progreso.';
    if (completionRateToday >= 80)
      return '¡Excelente trabajo! Estás manteniendo una consistencia muy alta. Sigue así y verás grandes resultados.';
    if (completionRateToday >= 50)
      return 'Vas por buen camino. Intenta enfocarte en completar al menos 2 hábitos más hoy.';
    return 'Cada día cuenta. Empieza por marcar uno solo. Pequeños pasos generan grandes cambios.';
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Estadísticas</Text>

      {/* ── Card principal: Hoy ── */}
      <View style={styles.mainCard}>
        <View style={styles.mainIconWrap}>
          <Ionicons name="today" size={28} color="#10b981" />
        </View>
        <Text style={styles.mainLabel}>Hoy</Text>
        <Text style={styles.mainBigNumber}>
          {completedToday}{' '}
          <Text style={styles.mainSmall}>de {totalHabits}</Text>
        </Text>
        <Text style={styles.mainPercentage}>{completionRateToday}% completado</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${completionRateToday}%` }]} />
        </View>

        {streak > 0 && (
          <View style={styles.streakRow}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 Racha: {streak} días</Text>
            </View>
            <Text style={styles.streakSub}>¡Sigue así!</Text>
          </View>
        )}
      </View>

      {/* ── Grid de estadísticas ── */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="list" size={28} color="#10b981" />
          <Text style={styles.statNumber}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Total de hábitos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={28} color="#10b981" />
          <Text style={styles.statNumber}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Completados en total</Text>
        </View>

        {bestHabit && (
          <View style={[styles.statCard, styles.bestCard]}>
            <Ionicons name="trophy" size={28} color="#eab308" />
            <Text style={[styles.statNumber, styles.statNumberName]}>
              {bestHabit.name}
            </Text>
            <Text style={styles.statLabel}>Mejor hábito</Text>
          </View>
        )}

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={28} color="#10b981" />
          <Text style={styles.statNumber}>{avgCompletionRate}%</Text>
          <Text style={styles.statLabel}>Promedio mensual</Text>
        </View>
      </View>

      {/* ── Calendario (siempre visible) ── */}
      <View style={styles.calendarCard}>

        {/* Header con mes, resumen y navegación */}
        <View style={styles.calHeader}>
          <View>
            <Text style={styles.calTitle}>
              {MONTHS_ES[viewMonth]} {viewYear}
            </Text>
            {monthSummary && (
              <Text style={styles.calMonthSummary}>{monthSummary}</Text>
            )}
          </View>
          <View style={styles.calNav}>
            <TouchableOpacity style={styles.calBtn} onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={16} color="#166534" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.calBtnToday} onPress={goToToday}>
              <Text style={styles.calBtnTodayText}>Hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calBtn} onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={16} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros por hábito (solo si hay hábitos) */}
        {habits.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {[
              { label: 'Todos', value: 'all' },
              ...habits.map((h, i) => ({ label: h.name, value: String(i) })),
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterChip,
                  selectedHabit === opt.value && styles.filterChipActive,
                ]}
                onPress={() => setSelectedHabit(opt.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedHabit === opt.value && styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Etiquetas días de la semana */}
        <View style={styles.calDayLabels}>
          {DAYS_ES.map(d => (
            <Text key={d} style={styles.calDayLabel}>{d}</Text>
          ))}
        </View>

        {/* Grid de días */}
        <View style={styles.calGrid}>
          {calendarDays.map(cell => {
            if (cell.empty) {
              return <View key={cell.key} style={styles.calCell} />;
            }

            const cellStyle = cell.isFuture
              ? styles.calCellFuture
              : cell.type === 'full'
              ? styles.calCellFull
              : cell.type === 'partial'
              ? styles.calCellPartial
              : styles.calCellNone;

            const textStyle = cell.isFuture
              ? styles.calTextFuture
              : cell.type === 'full'
              ? styles.calTextFull
              : styles.calText;

            const showDots =
              selectedHabit === 'all' &&
              !cell.isFuture &&
              cell.type === 'partial' &&
              cell.habitsDone.length > 0;

            return (
              <View
                key={cell.key}
                style={[
                  styles.calCell,
                  cellStyle,
                  cell.isToday && styles.calCellToday,
                ]}
              >
                <Text style={textStyle}>{cell.day}</Text>

                {showDots && (
                  <View style={styles.miniDotsRow}>
                    {cell.habitsDone.slice(0, 4).map((done, i) => (
                      <View
                        key={i}
                        style={[
                          styles.miniDot,
                          { backgroundColor: done ? '#10b981' : 'transparent' },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Leyenda */}
        <View style={styles.calLegend}>
          <View style={styles.legItem}>
            <View style={[styles.legDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legText}>Completo</Text>
          </View>
          <View style={styles.legItem}>
            <View style={[styles.legDot, { backgroundColor: '#86efac' }]} />
            <Text style={styles.legText}>Parcial</Text>
          </View>
          <View style={styles.legItem}>
            <View style={[styles.legDot, { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#d1fae5' }]} />
            <Text style={styles.legText}>Sin completar</Text>
          </View>
          <View style={styles.legItem}>
            <View style={[styles.legDot, { borderWidth: 2, borderColor: '#10b981', backgroundColor: '#fff' }]} />
            <Text style={styles.legText}>Hoy</Text>
          </View>
        </View>

        {/* Mensaje vacío si no hay hábitos */}
        {habits.length === 0 && (
          <View style={styles.calEmptyMsg}>
            <Ionicons name="leaf-outline" size={22} color="#86efac" />
            <Text style={styles.calEmptyText}>
              Añade hábitos para ver tu progreso en el calendario
            </Text>
          </View>
        )}
      </View>

      {/* ── Motivación ── */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>🌱 Resumen inteligente</Text>
        <Text style={styles.motivationText}>{motivationMessage()}</Text>
      </View>

      {/* ── Consejo ── */}
      {habits.length > 0 && (
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Consejo</Text>
          <Text style={styles.tipText}>
            La consistencia es más importante que la perfección. Intenta mantener
            tu racha aunque completes solo el 60% de tus hábitos.
          </Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 10,
  },

  // Card principal
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  mainIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: 6,
  },
  mainBigNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#166534',
  },
  mainSmall: {
    fontSize: 24,
    color: '#4ade80',
  },
  mainPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 99,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 99,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  streakBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  streakText: {
    fontSize: 13,
    color: '#854d0e',
    fontWeight: '600',
  },
  streakSub: {
    fontSize: 13,
    color: '#86efac',
  },

  // Grid stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  bestCard: {
    borderColor: '#fcd34d',
    borderWidth: 2,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#166534',
    marginVertical: 8,
  },
  statNumberName: {
    fontSize: 16,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#86efac',
    textAlign: 'center',
  },

  // Calendario
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 7,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#166534',
  },
  calMonthSummary: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  calNav: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  calBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBtnToday: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBtnTodayText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipText: {
    fontSize: 13,
    color: '#166534',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  calDayLabels: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#86efac',
    fontWeight: '600',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  calCellFull: {
    backgroundColor: '#10b981',
  },
  calCellPartial: {
    backgroundColor: '#86efac',
  },
  calCellNone: {
    backgroundColor: '#f0fdf4',
  },
  calCellFuture: {
    backgroundColor: 'transparent',
  },
  calCellToday: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  calText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  calTextFull: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  calTextFuture: {
    fontSize: 12,
    color: '#d1fae5',
  },
  miniDotsRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 3,
    alignSelf: 'center',
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
  },
  calLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  legItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legText: {
    fontSize: 11,
    color: '#888',
  },
  calEmptyMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
  },
  calEmptyText: {
    fontSize: 13,
    color: '#86efac',
    flex: 1,
    flexWrap: 'wrap',
  },

  // Motivación
  motivationCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#166534',
  },

  // Consejo
  tipCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
  },
});
