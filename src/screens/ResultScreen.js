import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatGCodeNumber } from '../utils/formatNumber';

export default function ResultScreen({ navigation, route }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { result, machineMode, odOrId, spindleRPM } = route.params || {};

  if (!result) {
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.homeBtnText}>← Home</Text>
        </TouchableOpacity>
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>Belum ada hasil.</Text>
        </View>
      </View>
    );
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} detik`;
    if (s === 0) return `${m} menit`;
    return `${m} menit ${s} detik`;
  };

  const fullGCode = [
    `O0001`,
    `(NAMA PROGRAM - ${result.parameters.designation} ${odOrId})`,
    `(ESTIMASI WAKTU - ${formatTime(result.cycleTimeSec)})`,
    `G28 U0. W0.`,
    `G0 T0101`,
    `G97 S${spindleRPM || 500} M03`,
    `G21 G40 G80 G99 G18`,
    `G54`,
    `G0 Z15.`,
    `G0 X${formatGCodeNumber(result.xStart)}`,
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
      const fileName = `${result.parameters.designation.replace(/[/\s]/g, '_')}.${ext}`;
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

  const handleShare = async (app) => {
    const text = fullGCode;
    if (Platform.OS === 'web' && navigator.share) {
      await navigator.share({ title: `QuickG76 - ${result.parameters.designation}`, text });
    }
  };

  const handlePDF = () => {
    if (Platform.OS === 'web') window.print();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Home</Text>
      </TouchableOpacity>

      <Text style={s.pageTitle}>Hasil G-Code</Text>
      <Text style={s.pageSub}>{result.parameters.designation}</Text>

      <View style={s.card}>
        <Text style={s.label}>INFORMASI ULIR</Text>
        {[
          ['Designasi', result.parameters.designation],
          ['Major Ø', `${result.parameters.majorDiameter} mm`],
          ['Minor Ø', `${result.parameters.minorDiameter} mm`],
          ['Thread Height', `${result.parameters.threadHeight} mm`],
          ['Pitch', `${result.parameters.pitch} mm`],
          ['Z Length', `${result.parameters.zLength} mm`],
          ['X Start', `${result.xStart} mm`],
          ['RPM', `${spindleRPM || 500} Putaran per menit`],
          ['Estimasi Waktu', `${formatTime(result.cycleTimeSec)} (${result.numPasses} pass)`],
          ['Mode', machineMode],
          ['Tipe', odOrId === 'OD' ? 'OD (Luar)' : 'ID (Dalam)'],
        ].map(([l, v]) => (
          <View key={l} style={s.infoRow}>
            <Text style={s.infoLabel}>{l}</Text>
            <Text style={s.infoValue}>{v}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.label}>G-CODE OUTPUT</Text>
        <View style={s.gcodeBox}>
          <Text style={s.gcodeLine}>{result.gcodeLine1}</Text>
          <Text style={s.gcodeLine}>{result.gcodeLine2}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.label}>FULL PROGRAM</Text>
        <View style={s.fullCodeBox}>
          <Text style={s.fullCodeText}>{fullGCode}</Text>
        </View>
        <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
          <Text style={s.copyBtnText}>📋 COPY</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        <Text style={s.label}>EXPORT</Text>
        <View style={s.exportRow}>
          {['NC', 'CNC', 'TXT'].map(ext => (
            <TouchableOpacity key={ext} style={[s.exportBtn, { backgroundColor: theme.green }]} onPress={() => handleExport(ext)}>
              <Text style={s.exportBtnText}>.{ext}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[s.exportBtn, { backgroundColor: theme.red }]} onPress={handlePDF}>
            <Text style={s.exportBtnText}>.PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.label}>SHARE</Text>
        <View style={s.exportRow}>
          {['WhatsApp', 'Telegram', 'Drive'].map(app => (
            <TouchableOpacity key={app} style={[s.exportBtn, { backgroundColor: theme.accent }]} onPress={() => handleShare(app)}>
              <Text style={s.exportBtnText}>{app}</Text>
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
  homeBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  homeBtnText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: t.text, marginTop: 4 },
  pageSub: { fontSize: 14, color: t.accent, marginBottom: 16, marginTop: 2 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: t.textSecondary },
  card: { backgroundColor: t.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  label: { fontSize: 11, fontWeight: '700', color: t.textSecondary, letterSpacing: 1, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  infoLabel: { fontSize: 13, color: t.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: t.text },
  gcodeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14 },
  gcodeLine: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 14, lineHeight: 24 },
  fullCodeBox: { backgroundColor: t.bg, borderRadius: 8, padding: 14, marginBottom: 10 },
  fullCodeText: { color: t.greenText, fontFamily: Platform.OS === 'web' ? 'Consolas, monospace' : 'monospace', fontSize: 11, lineHeight: 18 },
  copyBtn: { backgroundColor: t.bg, padding: 12, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: t.border },
  copyBtnText: { color: t.accent, fontWeight: '700', fontSize: 13 },
  exportRow: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
