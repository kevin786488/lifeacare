// context/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

// Dos claves separadas:
// 'registered_user' → datos del usuario (persiste siempre)
// 'active_session'  → si hay sesión abierta (se borra al hacer logout)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al arrancar: restaurar sesión si estaba activa
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AsyncStorage.getItem('active_session');
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.log('Error loading session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // ── Registro ──────────────────────────────────────────────────────────────
  const register = async (email, name, password) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: name?.trim() || email.split('@')[0] || 'Usuario',
        password,
        createdAt: new Date().toISOString(),
      };

      // Guardar usuario registrado (persistente)
      await AsyncStorage.setItem('registered_user', JSON.stringify(newUser));
      // Abrir sesión
      await AsyncStorage.setItem('active_session', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.log('Register error:', error);
      return { success: false, message: 'Error al crear cuenta' };
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password, rememberMe = true) => {
    try {
      const data = await AsyncStorage.getItem('registered_user');
      if (!data) {
        return { success: false, message: 'No hay cuenta registrada. Crea una primero.' };
      }

      const savedUser = JSON.parse(data);

      if (savedUser.email !== email.toLowerCase().trim()) {
        return { success: false, message: 'Correo incorrecto' };
      }
      if (savedUser.password !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Abrir sesión (si rememberMe=true se restaura al reabrir la app)
      if (rememberMe) {
        await AsyncStorage.setItem('active_session', JSON.stringify(savedUser));
      }

      setUser(savedUser);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  // Solo borra la sesión activa, NO el usuario registrado
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('active_session');
      setUser(null);
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  // ── Obtener email guardado (para pre-rellenar el input) ───────────────────
  const getSavedEmail = async () => {
    try {
      const data = await AsyncStorage.getItem('registered_user');
      if (data) return JSON.parse(data).email;
      return null;
    } catch {
      return null;
    }
  };

  // ── Borrar cuenta completamente ───────────────────────────────────────────
  const deleteAccount = async () => {
    try {
      await AsyncStorage.multiRemove(['registered_user', 'active_session']);
      setUser(null);
    } catch (e) {
      console.log('Delete account error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, getSavedEmail, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);