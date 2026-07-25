import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THREAD_CATEGORIES, getThreadsByCategory } from '../data/index';

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    const threads = getThreadsByCategory(selectedCategory);
    const cat = THREAD_CATEGORIES.find(c => c.key === selectedCategory);
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelectedCategory(null)}>
          <Text style={s.backText}>← Kembali ke kategori</Text>
        </TouchableOpacity>
        <Text style={s.header}>{cat?.label}</Text>
        <FlatList
          data={threads}
          keyExtractor={(item) => item.designation}
          renderItem={({ item }) => {
            const major = item.majorDiameterMM || item.majorDiameter;
            const pitch = item.pitchMM || item.pitch;
            const minor = item.minorDiameterMM || item.minorDiameter;
            return (
              <TouchableOpacity style={s.threadItem} onPress={() => navigation.navigate('Home', { selectedThread: item })}>
                <Text style={s.threadDesignation}>{item.designation}</Text>
                <View style={s.threadDetails}>
                  <Text style={s.threadDetail}>Ø {major} mm</Text>
                  <Text style={s.threadDetail}>P {pitch} mm</Text>
                  <Text style={s.threadDetail}>Minor Ø {minor} mm</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={s.list}
        />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.header}>Pilih Kategori Ulir</Text>
      <FlatList
        data={THREAD_CATEGORIES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.catItem} onPress={() => setSelectedCategory(item.key)}>
            <Text style={s.catLabel}>{item.label}</Text>
            <Text style={s.catCount}>{item.data.length} ukuran</Text>
            <Text style={s.catArrow}>›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={s.list}
      />
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  header: { fontSize: 18, fontWeight: '700', color: t.text, padding: 16, paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  backBtn: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  backText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  catItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, padding: 16, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: t.border },
  catLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: t.text },
  catCount: { fontSize: 12, color: t.textSecondary, marginRight: 8 },
  catArrow: { fontSize: 22, color: t.border },
  threadItem: { backgroundColor: t.card, padding: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: t.border },
  threadDesignation: { fontSize: 16, fontWeight: '700', color: t.accent },
  threadDetails: { flexDirection: 'row', gap: 12, marginTop: 4 },
  threadDetail: { fontSize: 12, color: t.textSecondary },
});
