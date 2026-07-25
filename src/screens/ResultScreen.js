import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import HelpPanel from '../components/HelpPanel';

export default function ResultScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { machineMode, odOrId, lastResult } = useApp();
  const [help, setHelp] = useState(null);

  if (!lastResult) {
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.homeBtnText}>← Ke Launcher</Text>
        </TouchableOpacity>
        <View style={s.emptyBox}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>💻</Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>Belum ada hasil. Hitung G-Code dulu dari halaman Parameter.</Text>
        </View>
      </View>
    );
  }

  const fullGCode = [
    `O0001`,
    `(PROGRAM NAME - ${lastResult.parameters.designation})`,
    `G28 U0.`,
    `G0 T0101`,
    `G97 S500 M03`,
    `G99`,
    `G0 Z15.`,
    `G0 X${lastResult.xStart}.`,
    `G0 Z2.`,
    `M8`,
    lastResult.gcodeLine1,
    lastResult.gcodeLine2,
    `G0 Z15. M9`,
    `Z25. M5`,
    `G28 U0. W0.`,
    `M30`,
    `%`,
  ].join('\n');

  const handleExport = async (ext) => {
    try {
      const fileName = `QuickG76_${lastResult.parameters.designation.replace(/[/\s]/g, '_')}.${ext}`;
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
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Ke Launcher</Text>
      </TouchableOpacity>

      <Text style={s.pageTitle}>Hasil G-Code</Text>
      <Text style={s.pageSub}>{lastResult.parameters.designation}</Text>

      <HelpPanel activeHelp={help} onClear={() => setHelp(null)} />

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>INFORMASI ULIR</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'export' ? null : 'export')}><Text style={{ fontSize: 16 }}>❓</Text></TouchableOpacity>
        </View>
        <View style={{ gap: 4 }}>
          {[
            ['Designasi', lastResult.parameters.designation],
            ['Major Ø', `${lastResult.parameters.majorDiameter} mm`],
            ['Minor Ø', `${lastResult.parameters.minorDiameter} mm`],
            ['Thread Height', `${lastResult.parameters.threadHeight} mm`],
            ['Pitch', `${lastResult.parameters.pitch} mm`],
            ['Z Length', `${lastResult.parameters.zLength} mm`],
            ['X Start', `${lastResult.xStart} mm`],
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
        <Text style={s.label}>G-CODE OUTPUT</Text>
        <View style={s.gcodeBox}>
          <Text style={s.gcodeLine1}>{lastResult.gcodeLine1}</Text>
          <Text style={s.gcodeLine1}>{lastResult.gcodeLine2}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.label}>FULL PROGRAM (TEMPLATE PRD)</Text>
        <View style={s.fullCodeBox}>
          <Text style={s.fullCodeText}>{fullGCode}</Text>
        </View>
        <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
          <Text style={s.copyBtnText}>📋 COPY G-CODE</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        <Text style={s.label}>EXPORT</Text>
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

      <TouchableOpacity style={s.homeBigBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBigBtnText}>🏠 KEMBALI KE LAUNCHER</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 40 },
  homeBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  homeBtnText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: t.text, marginTop: 4 },
  pageSub: { fontSize: 14, color: t.accent, marginBottom: 16, marginTop: 2 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '700', color: t.textSecondary, letterSpacing: 1, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  infoLabel: { fontSize: 13, color: t.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: t.text },
  gcodeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14 },
  gcodeLine1: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 14, lineHeight: 24 },
  fullCodeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14, marginBottom: 10 },
  fullCodeText: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 11, lineHeight: 18 },
  copyBtn: { backgroundColor: t.bg, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: t.border },
  copyBtnText: { color: t.accent, fontWeight: '700', fontSize: 13 },
  exportRow: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  homeBigBtn: { backgroundColor: t.card, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: t.accent, marginTop: 8 },
  homeBigBtnText: { color: t.accent, fontWeight: '700', fontSize: 15 },
});
