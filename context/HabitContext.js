// context/HabitContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

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

  const addHabit = (newHabit) => {
    const habitWithId = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      ...newHabit,
    };
    setHabits(prev => [habitWithId, ...prev]);
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabitCompletion = (habitId, date) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const completedDates = habit.completedDates || [];
          const isCompleted = completedDates.includes(date);
          return {
            ...habit,
            completedDates: isCompleted
              ? completedDates.filter(d => d !== date)
              : [...completedDates, date]
          };
        }
        return habit;
      })
    );
  };

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      addHabit,
      deleteHabit,
      toggleHabitCompletion,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);