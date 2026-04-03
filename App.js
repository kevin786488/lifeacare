import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { HabitProvider } from "./context/HabitContext";   // ← debe ser con llaves { } porque es named export
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <HabitProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </HabitProvider>
  );
}