import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function ResultScreen({ route }) {
  const { result, selectedThread, machineMode, odOrId } = route.params || {};

  if (!result) {
    return (
      <View style={styles.container}>
        <Text>Tidak ada hasil</Text>
      </View>
    );
  }

  const fullGCode = `O0001\n(PROGRAM NAME - ${result.parameters.designation})\nG28 U0.\nG0 T0101\nG97 S500 M03\nG99\nG0 Z15.\nG0 X${result.xStart}.\nG0 Z2.\nM8\n${result.gcodeLine1}\n${result.gcodeLine2}\nG0 Z15. M9\nZ25. M5\nG28 U0. W0.\nM30\n%`;

  const handleExport = async (ext) => {
    try {
      const fileName = `G76_${result.parameters.designation.replace(/[/\s]/g, '_')}.${ext}`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, fullGCode);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Export', `File saved: ${fileName}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal export file');
    }
  };

  const handleShare = async (app) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fullGCode, { mimeType: 'text/plain' });
      } else {
        Alert.alert('Share', 'Sharing tidak tersedia di device ini');
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal share');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Informasi Ulir</Text>
      <View style={styles.infoBox}>
        <InfoRow label="Designasi" value={result.parameters.designation} />
        <InfoRow label="Major Diameter" value={`${result.parameters.majorDiameter} mm`} />
        <InfoRow label="Minor Diameter" value={`${result.parameters.minorDiameter} mm`} />
        <InfoRow label="Thread Height" value={`${result.parameters.threadHeight} mm`} />
        <InfoRow label="Pitch" value={`${result.parameters.pitch} mm`} />
        <InfoRow label="Panjang Ulir (Z)" value={`${result.parameters.zLength} mm`} />
        <InfoRow label="Mode" value={machineMode} />
        <InfoRow label="Tipe" value={odOrId === 'OD' ? 'OD (Luar)' : 'ID (Dalam)'} />
      </View>

      <Text style={styles.sectionTitle}>G-Code Output</Text>
      <View style={styles.gcodeBox}>
        <Text style={styles.gcodeLine}>{result.gcodeLine1}</Text>
        <Text style={styles.gcodeLine}>{result.gcodeLine2}</Text>
      </View>

      <Text style={styles.sectionTitle}>Full Program</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{fullGCode}</Text>
      </View>

      <Text style={styles.sectionTitle}>Export</Text>
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('NC')}>
          <Text style={styles.exportBtnText}>.NC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('CNC')}>
          <Text style={styles.exportBtnText}>.CNC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('TXT')}>
          <Text style={styles.exportBtnText}>.TXT</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Share</Text>
      <View style={styles.shareRow}>
        <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('whatsapp')}>
          <Text style={styles.shareBtnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('telegram')}>
          <Text style={styles.shareBtnText}>Telegram</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare('drive')}>
          <Text style={styles.shareBtnText}>Google Drive</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#333' },
  infoBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#eee' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  gcodeBox: { backgroundColor: '#263238', borderRadius: 8, padding: 16 },
  gcodeLine: { color: '#8BC34A', fontFamily: 'monospace', fontSize: 14, lineHeight: 22 },
  codeBox: { backgroundColor: '#263238', borderRadius: 8, padding: 16 },
  codeText: { color: '#8BC34A', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  exportRow: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  shareRow: { flexDirection: 'row', gap: 12 },
  shareBtn: { flex: 1, backgroundColor: '#9C27B0', padding: 14, borderRadius: 8, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
