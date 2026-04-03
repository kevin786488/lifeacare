// screens/HomeScreen.js
import React, { useContext, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';   // ← Iconos listos

export default function HomeScreen({ navigation }) {
  const { habits, toggleHabitToday } = useContext(HabitContext);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const progress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

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

        {/* Card 1: Progreso */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={42} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Progreso Hoy</Text>
          <Text style={styles.bigNumber}>
            {completedToday} <Text style={styles.small}>/ {habits.length}</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.cardSubtitle}>{progress}% completado</Text>
        </View>

        {/* Card 2: Racha */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={42} color="#f59e0b" />
          </View>
          <Text style={styles.cardTitle}>Racha Actual</Text>
          <Text style={styles.bigNumber}>{currentStreak}</Text>
          <Text style={styles.cardSubtitle}>días consecutivos</Text>
        </View>

        {/* Card 3: Mis Hábitos */}
        <View style={[styles.card, styles.habitsCard]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkbox-outline" size={42} color="#10b981" />
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
                <Text style={[styles.miniHabitName, habit.completedDates?.includes(today) && styles.completedText]}>
                  {habit.name}
                </Text>
                <Ionicons 
                  name={habit.completedDates?.includes(today) ? "checkmark-circle" : "ellipse-outline"} 
                  size={26} 
                  color={habit.completedDates?.includes(today) ? "#10b981" : "#86efac"} 
                />
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddHabit')}>
            <Text style={styles.addButtonText}>+ Nuevo hábito</Text>
          </TouchableOpacity>
        </View>

        {/* Card 4: Motivación */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={42} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Motivación</Text>
          <Text style={styles.recommendationText}>
            {progress === 100 
              ? "¡Gran día! Estás cultivando consistencia 🌿" 
              : "La consistencia vence a la perfección. ¡Sigue adelante!"}
          </Text>
        </View>

      </View>

      <TouchableOpacity style={styles.statsButton} onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.statsButtonText}>Ver Estadísticas Detalladas →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4', padding: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#166534', textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    alignItems: 'center', shadowColor: '#166534', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 8, borderWidth: 1, borderColor: '#86efac'
  },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#ecfdf5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#166534', marginBottom: 10 },
  bigNumber: { fontSize: 42, fontWeight: 'bold', color: '#166534' },
  small: { fontSize: 20, color: '#4ade80' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: '#d1fae5', borderRadius: 999, marginVertical: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 999 },
  cardSubtitle: { fontSize: 14, color: '#4ade80', fontWeight: '600' },

  habitsCard: { minHeight: 280 },
  noHabitsText: { textAlign: 'center', color: '#86efac', marginVertical: 20 },
  miniHabitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 10 },
  miniCategory: { fontSize: 22, width: 32 },
  miniHabitName: { flex: 1, fontSize: 15, color: '#166534', marginHorizontal: 8 },
  completedText: { textDecorationLine: 'line-through', color: '#86efac' },

  addButton: { marginTop: 12, backgroundColor: '#10b981', padding: 12, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  recommendationText: { fontSize: 15, lineHeight: 23, textAlign: 'center', color: '#166534', marginTop: 8 },

  statsButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  statsButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});