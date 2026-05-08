// context/HabitContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

// ── Generador de ID único ─────────────────────────────────────────────────────
// Date.now() puede repetirse cuando se agregan varios hábitos del mismo pack
// en el mismo milisegundo. Combinamos timestamp + contador incremental para
// garantizar unicidad absoluta dentro de la sesión.
let _idCounter = 0;
function generateId() {
  _idCounter += 1;
  return `${Date.now()}_${_idCounter}`;
}

export const HabitProvider = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const loadHabits = async () => {
      try {
        const key = `habits_${user.id}`;
        const storedHabits = await AsyncStorage.getItem(key);
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
      } catch (error) {
        console.log('Error cargando hábitos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user]);

  useEffect(() => {
    if (!user || habits.length === 0) return;
    const saveHabits = async () => {
      try {
        const key = `habits_${user.id}`;
        await AsyncStorage.setItem(key, JSON.stringify(habits));
      } catch (error) {
        console.log('Error guardando hábitos:', error);
      }
    };
    saveHabits();
  }, [habits, user]);

  // ── addHabit ──────────────────────────────────────────────────────────────
  // FIX: usa generateId() en lugar de Date.now().toString() para evitar IDs
  // duplicados cuando se agregan múltiples hábitos de un pack en el mismo ms.
  const addHabit = (newHabit) => {
    const habitWithId = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      sessionsPerDay: newHabit.sessionsPerDay ?? 1,
      dailySessions: {},
      startDate: newHabit.startDate ?? null,
      endDate: newHabit.endDate ?? null,
      ...newHabit,
    };
    setHabits(prev => [habitWithId, ...prev]);
  };

  // ── addHabits (batch) ─────────────────────────────────────────────────────
  // Versión batch para packs: agrega todos los hábitos en un solo setState,
  // evitando renders intermedios y garantizando IDs únicos.
  const addHabits = (habitsList) => {
    const newHabits = habitsList.map(newHabit => ({
      id: generateId(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      sessionsPerDay: newHabit.sessionsPerDay ?? 1,
      dailySessions: {},
      startDate: newHabit.startDate ?? null,
      endDate: newHabit.endDate ?? null,
      ...newHabit,
    }));
    setHabits(prev => [...newHabits, ...prev]);
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // ── Session-based completion ──────────────────────────────────────────────
  // direction: 'add' | 'remove'
  // Solo modifica el hábito con el id exacto — nunca afecta otros hábitos.
  const updateSession = (habitId, date, direction = 'add') => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) return habit; // ← otros hábitos intactos

        const dailySessions = { ...(habit.dailySessions ?? {}) };
        const current = dailySessions[date] ?? 0;
        const target = habit.sessionsPerDay ?? 1;

        let next;
        if (direction === 'add') {
          next = Math.min(current + 1, target);
        } else {
          next = Math.max(current - 1, 0);
        }

        dailySessions[date] = next;

        // Sincronizar completedDates con la meta de sesiones de ESTE hábito
        const completedDates = habit.completedDates ?? [];
        const isNowComplete = next >= target;
        const wasComplete = completedDates.includes(date);

        let newCompletedDates = completedDates;
        if (isNowComplete && !wasComplete) {
          newCompletedDates = [...completedDates, date];
        } else if (!isNowComplete && wasComplete) {
          newCompletedDates = completedDates.filter(d => d !== date);
        }

        return { ...habit, dailySessions, completedDates: newCompletedDates };
      })
    );
  };

  // Legacy single-toggle
  const toggleHabitCompletion = (habitId, date) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) return habit;
        const completedDates = habit.completedDates ?? [];
        const isCompleted = completedDates.includes(date);
        const target = habit.sessionsPerDay ?? 1;
        const dailySessions = { ...(habit.dailySessions ?? {}) };
        dailySessions[date] = isCompleted ? 0 : target;
        return {
          ...habit,
          completedDates: isCompleted
            ? completedDates.filter(d => d !== date)
            : [...completedDates, date],
          dailySessions,
        };
      })
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSessionsForDate = (habit, date) => {
    return habit.dailySessions?.[date] ?? 0;
  };

  const isHabitActiveOnDate = (habit, date) => {
    if (habit.startDate && date < habit.startDate) return false;
    if (habit.endDate && date > habit.endDate) return false;
    return true;
  };

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      addHabit,
      addHabits,       // ← nuevo: para packs
      deleteHabit,
      toggleHabitCompletion,
      updateSession,
      getSessionsForDate,
      isHabitActiveOnDate,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);