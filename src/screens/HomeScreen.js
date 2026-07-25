import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import HelpPanel from '../components/HelpPanel';

const LAUNCHER_ITEMS = [
  {
    key: 'catalog',
    icon: '📐',
    title: 'Katalog Ulir',
    desc: 'Pilih dari 11 standar',
    screen: 'Catalog',
    help: 'catalog',
  },
  {
    key: 'manual',
    icon: '✏️',
    title: 'Input Manual',
    desc: 'Ulir custom / non-standar',
    screen: 'ManualInput',
    help: 'manual',
  },
  {
    key: 'parameter',
    icon: '⚙️',
    title: 'Parameter',
    desc: 'Mode, konstanta, Z, DOC',
    screen: 'Parameter',
    help: 'parameter',
  },
  {
    key: 'result',
    icon: '💻',
    title: 'Hasil G-Code',
    desc: 'Output & export',
    screen: 'Result',
    help: 'export',
  },
];

export default function HomeScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const s = makeStyles(theme);
  const { selectedThread, lastResult, manualDiameter, manualPitch } = useApp();
  const [help, setHelp] = useState(null);

  const hasThread = selectedThread || (manualDiameter && manualPitch);
  const hasResult = lastResult !== null;

  const handlePress = (item) => {
    if (item.key === 'result' && !hasResult) return;
    navigation.navigate(item.screen);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.appName}>QuickG76</Text>
          <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
            <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.tagline}>Kalkulator Ulir G-Code G76</Text>
      </View>

      <HelpPanel activeHelp={help} onClear={() => setHelp(null)} />

      <View style={s.launcherGrid}>
        {LAUNCHER_ITEMS.map((item) => {
          const isDisabled = item.key === 'result' && !hasResult;
          return (
            <TouchableOpacity
              key={item.key}
              style={[s.launcherCard, isDisabled && s.launcherDisabled]}
              onPress={() => handlePress(item)}
              onLongPress={() => setHelp(help === item.help ? null : item.help)}
            >
              <Text style={s.cardIcon}>{item.icon}</Text>
              <Text style={[s.cardTitle, isDisabled && s.cardDisabled]}>{item.title}</Text>
              <Text style={s.cardDesc}>{item.desc}</Text>
              {item.key === 'result' && !hasResult && (
                <Text style={s.cardBadge}>—</Text>
              )}
              {item.key === 'result' && hasResult && (
                <Text style={s.cardBadgeActive}>{lastResult?.parameters.designation}</Text>
              )}
              {item.key === 'catalog' && selectedThread && (
                <Text style={s.cardBadgeActive}>{selectedThread.designation}</Text>
              )}
              {item.key === 'manual' && manualDiameter && manualPitch && (
                <Text style={s.cardBadgeActive}>Ø{manualDiameter}×{manualPitch}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.infoCard}>
        <Text style={s.infoTitle}>💡 Tips</Text>
        <Text style={s.infoText}>
          Tekan lama (long press) pada setiap kartu untuk melihat bantuan.
        </Text>
        <Text style={s.infoText}>
          Urutan: Pilih ulir → Atur parameter → Hitung → Lihat hasil.
        </Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: { padding: 4 },
  appName: { fontSize: 28, fontWeight: '900', color: t.text, letterSpacing: 1 },
  tagline: { fontSize: 13, color: t.textSecondary, marginTop: 4 },
  launcherGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  launcherCard: { width: '47%', backgroundColor: t.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: t.border, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
  launcherDisabled: { opacity: 0.4 },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: t.text, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: t.textSecondary, textAlign: 'center', marginTop: 2 },
  cardDisabled: { color: t.textSecondary },
  cardBadge: { fontSize: 11, color: t.border, marginTop: 6 },
  cardBadgeActive: { fontSize: 10, color: t.accent, marginTop: 6, fontWeight: '600' },
  infoCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: t.border },
  infoTitle: { fontSize: 14, fontWeight: '700', color: t.text, marginBottom: 8 },
  infoText: { fontSize: 12, color: t.textSecondary, lineHeight: 18, marginBottom: 4 },
});
