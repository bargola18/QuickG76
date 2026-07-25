import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THREAD_CATEGORIES, getThreadsByCategory } from '../data/index';

const m = (v) => v != null ? `${v} mm` : '-';

const ThreadCard = ({ item, catLabel, onPress }) => {
  const { theme } = useTheme();
  const major = item.majorDiameterMM ?? item.majorDiameter;
  const pitch = item.pitchMM ?? item.pitch;
  const minor = item.minorDiameterMM ?? item.minorDiameter;
  const height = item.threadHeightMM ?? item.threadHeight;
  const tapDrill = item.tapDrillMM ?? item.tapDrill;

  return (
    <TouchableOpacity style={[styles.threadItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
      <View style={styles.thrTop}>
        <Text style={[styles.thrDesig, { color: theme.accent }]}>{item.designation}</Text>
        <View style={[styles.thrBadge, { backgroundColor: theme.inputBg, borderColor: theme.border }]}><Text style={[styles.thrBadgeText, { color: theme.textSecondary }]}>{catLabel}</Text></View>
      </View>
      <View style={styles.thrGrid}>
        <View style={styles.thrCol}>
          <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Major Ø</Text>
          <Text style={[styles.thrVal, { color: theme.text }]}>{m(major)}</Text>
        </View>
        <View style={styles.thrCol}>
          <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>{item.tpi ? 'TPI' : 'Pitch'}</Text>
          <Text style={[styles.thrVal, { color: theme.text }]}>{item.tpi ? `${item.tpi} TPI` : m(pitch)}</Text>
        </View>
      </View>
      <View style={styles.thrGrid}>
        <View style={styles.thrCol}>
          <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Minor Ø</Text>
          <Text style={[styles.thrVal, { color: theme.text }]}>{m(minor)}</Text>
        </View>
        <View style={styles.thrCol}>
          <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Tinggi</Text>
          <Text style={[styles.thrVal, { color: theme.text }]}>{m(height)}</Text>
        </View>
      </View>
      {tapDrill != null && (
        <View style={styles.thrGrid}>
          <View style={styles.thrCol}>
            <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Mata Bor</Text>
            <Text style={[styles.thrVal, { color: '#e67e22' }]}>{m(tapDrill)}</Text>
          </View>
          <View style={styles.thrCol} />
        </View>
      )}
      {item.nominalSize && (
        <View style={styles.thrGrid}>
          <View style={styles.thrCol}>
            <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Nominal</Text>
            <Text style={[styles.thrVal, { color: theme.text }]}>{item.nominalSize}</Text>
          </View>
          <View style={styles.thrCol}>
            <Text style={[styles.thrLbl, { color: theme.textSecondary }]}>Tirus</Text>
            <Text style={[styles.thrVal, { color: theme.text }]}>{item.taper ? 'Ya' : 'Tidak'}</Text>
          </View>
        </View>
      )}
      <Text style={[styles.thrArrow, { color: theme.border }]}>›</Text>
    </TouchableOpacity>
  );
};

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');

  if (category) {
    const threads = getThreadsByCategory(category);
    const cat = THREAD_CATEGORIES.find(c => c.key === category);
    const filtered = search.trim() === '' ? threads : threads.filter(t =>
      t.designation.toLowerCase().includes(search.toLowerCase()) ||
      (t.majorDiameterMM ?? t.majorDiameter)?.toString().includes(search)
    );
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.homeBtnText}>← Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setCategory(null); setSearch(''); }}>
          <Text style={s.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle}>{cat?.label}</Text>
        <TextInput style={s.search} placeholder="Cari ulir..." placeholderTextColor={theme.textSecondary} value={search} onChangeText={setSearch} />
        <Text style={s.countText}>{filtered.length} dari {threads.length} ukuran</Text>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.designation}
          renderItem={({ item }) => (
            <ThreadCard
              item={item}
              catLabel={cat?.label}
              onPress={() => navigation.navigate('Home', { selected: item })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Home</Text>
      </TouchableOpacity>
      <Text style={s.pageTitle}>Kategori Ulir</Text>
      <FlatList
        data={THREAD_CATEGORIES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.catItem}
            onPress={() => setCategory(item.key)}
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

const styles = StyleSheet.create({
  threadItem: { padding: 14, borderRadius: 20, marginBottom: 6, borderWidth: 1 },
  thrTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  thrDesig: { fontSize: 16, fontWeight: '800', flex: 1 },
  thrBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  thrBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  thrGrid: { flexDirection: 'row', marginTop: 2 },
  thrCol: { flex: 1 },
  thrLbl: { fontSize: 9, letterSpacing: 0.5 },
  thrVal: { fontSize: 13, fontWeight: '600', marginTop: 1 },
  thrArrow: { position: 'absolute', right: 14, top: '50%', fontSize: 22, marginTop: -11 },
});

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 16 },
  homeBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  homeBtnText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  backText: { color: t.textSecondary, fontSize: 13, paddingVertical: 4 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: t.text, marginTop: 4 },
  countText: { fontSize: 12, color: t.textSecondary, marginBottom: 12, marginTop: 2 },
  catItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, padding: 16, borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: t.border },
  catLeft: { flex: 1 },
  catLabel: { fontSize: 16, fontWeight: '700', color: t.text },
  catCount: { fontSize: 12, color: t.textSecondary, marginTop: 2 },
  catArrow: { fontSize: 22, color: t.border },
  search: { backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.border, borderRadius: 20, padding: 10, fontSize: 14, color: t.text, marginBottom: 8 },
});
