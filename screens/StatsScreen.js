// screens/StatsScreen.js
import React, { useContext, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { HabitContext } from '../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const { habits } = useContext(HabitContext);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;

  const totalHabits = habits.length;
  const completionRateToday = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Estadísticas generales
  const totalCompletions = habits.reduce((sum, habit) => {
    return sum + (habit.completedDates ? habit.completedDates.length : 0);
  }, 0);

  const avgCompletionRate = totalHabits > 0 
    ? Math.round((totalCompletions / (totalHabits * 30)) * 100) // aproximado últimos 30 días
    : 0;

  // Mejor hábito (el más completado)
  const bestHabit = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((best, current) => {
      const currentCount = current.completedDates ? current.completedDates.length : 0;
      const bestCount = best.completedDates ? best.completedDates.length : 0;
      return currentCount > bestCount ? current : best;
    });
  }, [habits]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Estadísticas</Text>

      {/* Card Principal - Hoy */}
      <View style={styles.mainCard}>
        <View style={styles.mainIcon}>
          <Ionicons name="today" size={48} color="#10b981" />
        </View>
        <Text style={styles.mainTitle}>Hoy</Text>
        <Text style={styles.mainBigNumber}>
          {completedToday} <Text style={styles.mainSmall}>de {totalHabits}</Text>
        </Text>
        <Text style={styles.mainPercentage}>{completionRateToday}% completado</Text>
      </View>

      {/* Grid de estadísticas */}
      <View style={styles.statsGrid}>
        
        {/* Total de hábitos */}
        <View style={styles.statCard}>
          <Ionicons name="list" size={32} color="#10b981" />
          <Text style={styles.statNumber}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Total de hábitos</Text>
        </View>

        {/* Total completados */}
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={32} color="#10b981" />
          <Text style={styles.statNumber}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Completados en total</Text>
        </View>

        {/* Mejor hábito */}
        {bestHabit && (
          <View style={[styles.statCard, styles.bestCard]}>
            <Ionicons name="trophy" size={32} color="#eab308" />
            <Text style={styles.statNumber}>{bestHabit.name}</Text>
            <Text style={styles.statLabel}>Mejor hábito</Text>
          </View>
        )}

        {/* Promedio aproximado */}
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={32} color="#10b981" />
          <Text style={styles.statNumber}>{avgCompletionRate}%</Text>
          <Text style={styles.statLabel}>Promedio mensual</Text>
        </View>
      </View>

      {/* Sección de Motivación / Recomendación inteligente */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>🌱 Resumen Inteligente</Text>
        
        {totalHabits === 0 ? (
          <Text style={styles.emptyText}>Añade hábitos para ver tus estadísticas y progreso</Text>
        ) : completionRateToday >= 80 ? (
          <Text style={styles.motivationText}>
            ¡Excelente trabajo! Estás manteniendo una consistencia muy alta. 
            Sigue así y verás grandes resultados.
          </Text>
        ) : completionRateToday >= 50 ? (
          <Text style={styles.motivationText}>
            Vas por buen camino. Intenta enfocarte en completar al menos 2 hábitos más hoy.
          </Text>
        ) : (
          <Text style={styles.motivationText}>
            Cada día cuenta. Empieza por marcar uno solo. Pequeños pasos generan grandes cambios.
          </Text>
        )}
      </View>

      {habits.length > 0 && (
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Consejo</Text>
          <Text style={styles.tipText}>
            La consistencia es más importante que la perfección. 
            Intenta mantener tu racha aunque completes solo el 60% de tus hábitos.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

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
  mainIcon: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  mainBigNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#166534',
  },
  mainSmall: {
    fontSize: 26,
    color: '#4ade80',
  },
  mainPercentage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 8,
  },

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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#166534',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#4ade80',
    textAlign: 'center',
  },

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
    fontSize: 20,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#166534',
  },

  tipCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#166534',
    lineHeight: 22,
  },

  emptyText: {
    textAlign: 'center',
    color: '#86efac',
    fontSize: 16,
    marginVertical: 20,
  },
});