// screens/AddHabitScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import { HabitContext } from '../context/HabitContext';

const categories = [
  { id: '1', name: 'Salud Física', emoji: '💪', color: '#ef4444' },
  { id: '2', name: 'Salud Mental', emoji: '🧠', color: '#8b5cf6' },
  { id: '3', name: 'Productividad', emoji: '📈', color: '#eab308' },
  { id: '4', name: 'Bienestar', emoji: '🌱', color: '#10b981' },
  { id: '5', name: 'Hábitos Diarios', emoji: '🌅', color: '#3b82f6' },
];

const forbiddenWords = ['fumar', 'cigarrillo', 'alcohol', 'droga', 'jugar', 'apostar', 'porno', 'masturbar', 'vicio', 'maldad'];

export default function AddHabitScreen({ navigation }) {
  const { addHabit } = useContext(HabitContext);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isValidHabit = (habitName) => {
    const lowerName = habitName.toLowerCase().trim();
    return !forbiddenWords.some(word => lowerName.includes(word));
  };

  const handleAddHabit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del hábito es obligatorio');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }

    if (!isValidHabit(name)) {
      Alert.alert(
        'Hábito no permitido', 
        'Esta app solo permite hábitos positivos y saludables.\n\nPor favor elige un hábito constructivo.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    addHabit({
      name: name.trim(),
      description: description.trim(),
      category: selectedCategory.name,
      categoryEmoji: selectedCategory.emoji,
      categoryColor: selectedCategory.color,
    });

    Alert.alert('¡Hábito creado!', `${name} ha sido añadido correctamente`, [
      { 
        text: 'OK', 
        onPress: () => navigation.goBack() 
      }
    ]);

    // Limpiar formulario
    setName('');
    setDescription('');
    setSelectedCategory(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Nuevo Hábito Positivo</Text>

        {/* Selector de Categoría */}
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
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nombre del hábito</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Beber 2 litros de agua"
          value={name}
          onChangeText={setName}
          maxLength={60}
        />

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Para mejorar mi energía y concentración"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity 
          style={[styles.addButton, !selectedCategory && styles.addButtonDisabled]} 
          onPress={handleAddHabit}
          disabled={!selectedCategory}
        >
          <Text style={styles.addButtonText}>Crear Hábito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  categoryButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#f0f0ff',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});