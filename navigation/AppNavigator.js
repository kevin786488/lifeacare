// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Mis Hábitos' }}
      />
      <Stack.Screen 
        name="AddHabit" 
        component={AddHabitScreen}
        options={{ title: 'Nuevo Hábito' }}
      />
      <Stack.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ title: 'Estadísticas' }}
      />
    </Stack.Navigator>
  );
}