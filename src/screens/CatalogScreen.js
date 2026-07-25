import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { THREAD_CATEGORIES, getThreadsByCategory } from '../data/index';
import HelpPanel from '../components/HelpPanel';

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { setSelectedThread } = useApp();
  const [category, setCategory] = useState(null);
  const [help, setHelp] = useState(null);

  if (category) {
    const threads = getThreadsByCategory(category);
    const cat = THREAD_CATEGORIES.find(c => c.key === category);
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.homeBtnText}>← Ke Launcher</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCategory(null)}>
          <Text style={s.backText}>← Kembali ke kategori</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle}>{cat?.label}</Text>
        <Text style={s.countText}>{threads.length} ukuran tersedia</Text>
        <FlatList
          data={threads}
          keyExtractor={(item) => item.designation}
          renderItem={({ item }) => {
            const major = item.majorDiameterMM || item.majorDiameter;
            const pitch = item.pitchMM || item.pitch;
            const minor = item.minorDiameterMM || item.minorDiameter;
            return (
              <TouchableOpacity
                style={s.threadItem}
                onPress={() => {
                  setSelectedThread(item);
                  navigation.navigate('Home');
                }}
              >
                <View style={s.threadLeft}>
                  <Text style={s.threadDesignation}>{item.designation}</Text>
                  <View style={s.threadDetails}>
                    <Text style={s.threadDetail}>Ø {major} mm</Text>
                    <Text style={s.threadDetail}>P {pitch} mm</Text>
                    <Text style={s.threadDetail}>Minor Ø {minor} mm</Text>
                  </View>
                </View>
                <Text style={s.threadArrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Ke Launcher</Text>
      </TouchableOpacity>
      <Text style={s.pageTitle}>Pilih Kategori Ulir</Text>
      <Text style={s.countText}>Tekan lama kartu untuk bantuan</Text>

      <HelpPanel activeHelp={help} onClear={() => setHelp(null)} />

      <FlatList
        data={THREAD_CATEGORIES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.catItem}
            onPress={() => setCategory(item.key)}
            onLongPress={() => setHelp(help === 'catalog' ? null : 'catalog')}
          >
            <View style={s.catLeft}>
              <Text style={s.catLabel}>{item.label}</Text>
              <Text style={s.catCount}>{item.data.length} ukuran</Text>
            </View>
            <Text style={s.catArrow}>›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 16 },
  homeBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  homeBtnText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  backText: { color: t.textSecondary, fontSize: 13, paddingVertical: 4 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: t.text, marginTop: 4 },
  countText: { fontSize: 12, color: t.textSecondary, marginBottom: 12, marginTop: 2 },
  catItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: t.border },
  catLeft: { flex: 1 },
  catLabel: { fontSize: 16, fontWeight: '700', color: t.text },
  catCount: { fontSize: 12, color: t.textSecondary, marginTop: 2 },
  catArrow: { fontSize: 22, color: t.border },
  threadItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, padding: 14, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: t.border },
  threadLeft: { flex: 1 },
  threadDesignation: { fontSize: 16, fontWeight: '700', color: t.accent },
  threadDetails: { flexDirection: 'row', gap: 12, marginTop: 4 },
  threadDetail: { fontSize: 12, color: t.textSecondary },
  threadArrow: { fontSize: 22, color: t.border },
});
