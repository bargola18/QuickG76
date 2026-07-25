import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ResultScreen({ route }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { result, machineMode, odOrId } = route.params || {};
  const [hideFull, setHideFull] = useState(false);

  if (!result) {
    return (
      <View style={s.container}>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Tidak ada hasil</Text>
      </View>
    );
  }

  const fullGCode = [
    `O0001`,
    `(PROGRAM NAME - ${result.parameters.designation})`,
    `G28 U0.`,
    `G0 T0101`,
    `G97 S500 M03`,
    `G99`,
    `G0 Z15.`,
    `G0 X${result.xStart}.`,
    `G0 Z2.`,
    `M8`,
    result.gcodeLine1,
    result.gcodeLine2,
    `G0 Z15. M9`,
    `Z25. M5`,
    `G28 U0. W0.`,
    `M30`,
    `%`,
  ].join('\n');

  const handleExport = async (ext) => {
    try {
      const fileName = `QuickG76_${result.parameters.designation.replace(/[/\s]/g, '_')}.${ext}`;
      if (Platform.OS === 'web') {
        const blob = new Blob([fullGCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const { FileSystem } = await import('expo-file-system');
      const { Sharing } = await import('expo-sharing');
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, fullGCode);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(filePath);
    } catch (err) {}
  };

  const handleCopy = () => {
    if (Platform.OS === 'web') navigator.clipboard.writeText(fullGCode);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.sectionTitle}>INFORMASI ULIR</Text>
        <View style={{ gap: 4 }}>
          {[
            ['Designasi', result.parameters.designation],
            ['Major Ø', `${result.parameters.majorDiameter} mm`],
            ['Minor Ø', `${result.parameters.minorDiameter} mm`],
            ['Thread Height', `${result.parameters.threadHeight} mm`],
            ['Pitch', `${result.parameters.pitch} mm`],
            ['Z Length', `${result.parameters.zLength} mm`],
            ['X Start', `${result.xStart} mm`],
            ['Mode', machineMode],
            ['Tipe', odOrId === 'OD' ? 'OD (Luar)' : 'ID (Dalam)'],
          ].map(([l, v]) => (
            <View key={l} style={s.infoRow}>
              <Text style={s.infoLabel}>{l}</Text>
              <Text style={s.infoValue}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>G-CODE OUTPUT</Text>
        <Text style={s.subtitle}>Baris G76</Text>
        <View style={s.codeBox}>
          <Text style={s.codeLine}>{result.gcodeLine1}</Text>
          <Text style={s.codeLine}>{result.gcodeLine2}</Text>
        </View>
      </View>

      <View style={s.card}>
        <TouchableOpacity style={s.toggleBtn} onPress={() => setHideFull(!hideFull)}>
          <Text style={s.toggleBtnText}>{hideFull ? 'TAMPILKAN' : 'SEMBUNYIKAN'} FULL PROGRAM</Text>
        </TouchableOpacity>
        {!hideFull && (
          <>
            <Text style={[s.subtitle, { marginTop: 0 }]}>Full Program (Template PRD)</Text>
            <View style={s.fullCodeBox}>
              <Text style={s.fullCodeText}>{fullGCode}</Text>
            </View>
            <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
              <Text style={s.copyBtnText}>COPY G-CODE</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>EXPORT G-CODE</Text>
        <View style={s.exportRow}>
          {[
            { label: '.NC', color: theme.green },
            { label: '.CNC', color: theme.accent },
            { label: '.TXT', color: '#9E6A03' },
          ].map(({ label, color }) => (
            <TouchableOpacity key={label} style={[s.exportBtn, { backgroundColor: color }]} onPress={() => handleExport(label)}>
              <Text style={s.exportBtnText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: t.textSecondary, letterSpacing: 1, marginBottom: 12 },
  subtitle: { fontSize: 12, color: t.textSecondary, marginBottom: 8, marginTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: t.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: t.text },
  codeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14 },
  codeLine: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 14, lineHeight: 24 },
  toggleBtn: { padding: 10, alignItems: 'center', backgroundColor: t.bg, borderRadius: 8, marginBottom: 12 },
  toggleBtnText: { color: t.accent, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  fullCodeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14, marginBottom: 10 },
  fullCodeText: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 11, lineHeight: 18 },
  copyBtn: { backgroundColor: t.bg, padding: 10, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: t.border },
  copyBtnText: { color: t.accent, fontWeight: '700', fontSize: 12 },
  exportRow: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
