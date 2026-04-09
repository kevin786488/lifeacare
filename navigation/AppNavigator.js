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
        headerStyle: { backgroundColor: '#f0fdf4' },
        headerTintColor: '#166534',
        headerTitleStyle: { fontWeight: 'bold', color: '#166534' },
        headerShadowVisible: false, // sin línea separadora, se ve más limpio
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // HomeScreen ya tiene su propio título "LifeCare"
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