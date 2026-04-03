// context/HabitContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);

  // Cargar hábitos
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const savedHabits = await AsyncStorage.getItem('habits');
        if (savedHabits) setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.log('Error cargando hábitos', e);
      }
    };
    loadHabits();
  }, []);

  // Guardar hábitos
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem('habits', JSON.stringify(habits));
      } catch (e) {
        console.log('Error guardando hábitos', e);
      }
    };
    saveHabits();
  }, [habits]);

  const addHabit = (newHabit) => {
    const habitWithCategory = {
      ...newHabit,
      id: Date.now().toString(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, habitWithCategory]);
  };

  const toggleHabitToday = (id) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const alreadyCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: alreadyCompleted 
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <HabitContext.Provider value={{
      habits,
      addHabit,
      toggleHabitToday,
      deleteHabit
    }}>
      {children}
    </HabitContext.Provider>
  );
};