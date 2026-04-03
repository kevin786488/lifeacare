// screens/StatsScreen.js
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { HabitContext } from '../context/HabitContext';

export default function StatsScreen() {
  const { habits } = useContext(HabitContext);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => 
    h.completedDates && h.completedDates.includes(today)
  ).length;

  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;

  // Calcular racha actual (streak) simple - solo hoy
  const currentStreak = completedToday === totalHabits && totalHabits > 0 ? "¡Perfecto hoy!" : "Sigue así";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Estadísticas</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progreso de Hoy</Text>
        <Text style={styles.bigNumber}>
          {completedToday} <Text style={styles.smallText}>de {totalHabits}</Text>
        </Text>
        <Text style={styles.percentage}>{completionRate}% completado</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total de Hábitos</Text>
        <Text style={styles.bigNumber}>{totalHabits}</Text>
      </View>

      {totalHabits > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado Actual</Text>
          <Text style={styles.streakText}>{currentStreak}</Text>
          <Text style={styles.motivation}>
            {completionRate >= 80 
              ? "¡Excelente trabajo! Mantén el ritmo 🔥" 
              : completionRate >= 50 
                ? "Vas bien, un poco más y lo logras 💪" 
                : "Cada día cuenta. ¡Tú puedes! 🌱"}
          </Text>
        </View>
      )}

      {totalHabits === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aún no tienes hábitos</Text>
          <Text style={styles.emptySubtext}>
            Añade hábitos en la pantalla principal para ver estadísticas
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e2937',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e2937',
  },
  smallText: {
    fontSize: 20,
    color: '#64748b',
  },
  percentage: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 4,
  },
  streakText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  motivation: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});