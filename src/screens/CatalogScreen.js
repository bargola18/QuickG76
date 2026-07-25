import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import { getThreadsByCategory, THREAD_CATEGORIES } from '../data/index';

export default function CatalogScreen({ route, navigation }) {
  const { categoryKey } = route.params || {};
  const category = THREAD_CATEGORIES.find(c => c.key === categoryKey);
  const threads = category ? getThreadsByCategory(categoryKey) : [];

  const handleSelect = (thread) => {
    navigation.navigate('Home', { selectedThread: thread });
  };

  const renderItem = ({ item }) => {
    const major = item.majorDiameterMM || item.majorDiameter;
    const pitch = item.pitchMM || item.pitch;
    const minor = item.minorDiameterMM || item.minorDiameter;
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
        <Text style={styles.designation}>{item.designation}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detail}>Ø {major} mm</Text>
          <Text style={styles.detail}>Pitch {pitch} mm</Text>
        </View>
        <Text style={styles.detail}>Minor Ø {minor} mm</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category?.label || 'Katalog'}</Text>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.designation}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 16, color: '#333' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  item: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  designation: { fontSize: 16, fontWeight: 'bold', color: '#2196F3' },
  detailRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  detail: { fontSize: 13, color: '#666' },
});
