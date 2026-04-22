// screens/AddHabitScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useHabits } from '../context/HabitContext'; // ← Cambiado

const categories = [
  { id: '1', name: 'Salud Física',    icon: 'fitness',          color: '#10b981' },
  { id: '2', name: 'Salud Mental',    icon: 'brain',            color: '#6366f1' },
  { id: '3', name: 'Productividad',   icon: 'trending-up',      color: '#eab308' },
  { id: '4', name: 'Bienestar',       icon: 'heart',            color: '#14b8a6' },
  { id: '5', name: 'Hábitos Diarios', icon: 'sunny',            color: '#3b82f6' },
];

const forbiddenWords = ['fumar', 'cigarrillo', 'alcohol', 'droga', 'marihuana', 'jugar', 'apostar', 'porno', 'masturbar', 'vicio', 'maldad', 'malo'];

export default function AddHabitScreen({ navigation }) {
  const { addHabit } = useHabits();   // ← Cambiado aquí

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]); // Nuevo: selección de días

  const daysOfWeek = [
    { id: 'monday',    name: 'Lunes',     short: 'L' },
    { id: 'tuesday',   name: 'Martes',    short: 'M' },
    { id: 'wednesday', name: 'Miércoles', short: 'X' },
    { id: 'thursday',  name: 'Jueves',    short: 'J' },
    { id: 'friday',    name: 'Viernes',   short: 'V' },
    { id: 'saturday',  name: 'Sábado',    short: 'S' },
    { id: 'sunday',    name: 'Domingo',   short: 'D' },
  ];

  const isValidHabit = (habitName) => {
    const lowerName = habitName.toLowerCase().trim();
    return !forbiddenWords.some(word => lowerName.includes(word));
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleAddHabit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del hábito es obligatorio');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un día de la semana');
      return;
    }

    if (!isValidHabit(name)) {
      Alert.alert(
        'Hábito no permitido',
        'Esta aplicación solo permite hábitos positivos y constructivos.\n\nPor favor elige un hábito saludable.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    addHabit({
      name: name.trim(),
      description: description.trim(),
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      days: selectedDays,                    // ← Guardamos los días
    });

    Alert.alert('¡Éxito!', `"${name}" ha sido creado correctamente`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);

    // Reset
    setName('');
    setDescription('');
    setSelectedCategory(null);
    setSelectedDays([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="add-circle-outline" size={60} color="#10b981" />
        <Text style={styles.headerTitle}>Nuevo Hábito</Text>
        <Text style={styles.headerSubtitle}>Elige una categoría positiva</Text>
      </View>

      <View style={styles.form}>
        {/* Categorías */}
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory?.id === cat.id && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons 
                name={cat.icon} 
                size={32} 
                color={selectedCategory?.id === cat.id ? "#fff" : cat.color} 
              />
              <Text style={[
                styles.categoryName,
                selectedCategory?.id === cat.id && styles.categoryNameSelected
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selección de días */}
        <Text style={styles.label}>¿Qué días quieres cumplir este hábito?</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDays.includes(day.id);
            return (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                  {day.short}
                </Text>
                <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                  {day.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nombre */}
        <Text style={styles.label}>Nombre del hábito</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Beber 2 litros de agua al día"
          value={name}
          onChangeText={setName}
          maxLength={65}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Para mejorar mi energía y concentración"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Botón Crear */}
        <TouchableOpacity 
          style={[
            styles.createButton, 
            (!selectedCategory || !name.trim() || selectedDays.length === 0) && styles.createButtonDisabled
          ]} 
          onPress={handleAddHabit}
          disabled={!selectedCategory || !name.trim() || selectedDays.length === 0}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Crear Hábito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4ade80',
    marginTop: 6,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 10,
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  categoryButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginTop: 10,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#ffffff',
  },

  // Estilos para los días
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  dayButton: {
    width: '31%',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1fae5',
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dayShort: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534',
  },
  dayShortSelected: {
    color: '#ffffff',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginTop: 4,
  },
  dayNameSelected: {
    color: '#ffffff',
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#166534',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 40,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#86efac',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});