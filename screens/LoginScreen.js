// screens/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true); // true = Iniciar Sesión, false = Crear Cuenta
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!password) {
      alert("Por favor ingresa tu contraseña");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    let result;

    if (isLoginMode) {
      // Iniciar sesión
      result = await login(email, password);
    } else {
      // Crear cuenta
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      result = await register(email, name, password);
    }

    if (result.success) {
      navigation.replace('Home');
    } else {
      alert(result.message || "Ocurrió un error");
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="leaf" size={82} color="#10b981" />
          <Text style={styles.headerTitle}>LifeCare</Text>
          <Text style={styles.headerSubtitle}>
            {isLoginMode ? "Bienvenido de nuevo" : "Crea tu cuenta y empieza hoy"}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!isLoginMode && (
            <>
              <Text style={styles.label}>Nombre (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="¿Cómo te llamas?"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={22} 
                color="#166534" 
              />
            </TouchableOpacity>
          </View>

          {!isLoginMode && (
            <>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons 
                  name={isLoginMode ? "log-in-outline" : "person-add-outline"} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>
                  {isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchContainer} onPress={toggleMode}>
            <Text style={styles.switchText}>
              {isLoginMode 
                ? "¿No tienes cuenta? Crear una ahora" 
                : "¿Ya tienes cuenta? Iniciar sesión"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 50,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4ade80',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  form: {
    padding: 24,
    paddingTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#166534',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#166534',
  },
  eyeIcon: {
    justifyContent: 'center',
    paddingRight: 16,
  },
  button: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#86efac',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  switchText: {
    color: '#10b981',
    fontSize: 15.5,
    fontWeight: '600',
  },
});