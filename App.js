// App.js
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </HabitProvider>
    </AuthProvider>
  );
}