import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const HELP_TEXTS = {
  machine: 'Pilih mode kalkulasi Q. ABSOLUT: nilai Q desimal (0.1, 0.2, 0.3...). INTEGER: nilai Q dikali 1000 (Q100, Q200, Q300...) sesuai parameter Fanuc asli.',
  type: 'OD (Luar): ulir pada permukaan luar benda kerja, mayor diameter lebih besar dari minor. ID (Dalam): ulir pada lubang dalam, minor diameter = mayor diameter.',
  source: 'PILIH DARI KATALOG: pilih ulir standar dari 11 kategori internasional. INPUT MANUAL: masukkan diameter dan pitch untuk ulir custom / non-standar.',
  constant: 'Konstanta menentukan tinggi ulir (Thread Height = Pitch × Konstanta). 0.6134 = standar ISO, 0.62 = kombinasi, 0.64 = ulir longgar. Untuk ID tetap 0.5413.',
  parameter: 'Z = panjang ulir dalam mm (nilai positif, sistem akan membuat Z-). DOC = kedalaman potong pertama (First Pass Depth) dalam mm. Maks aman 0.8mm.',
  catalog: 'Pilih dari 11 kategori ulir standar: Metrik kasar/halus, UNC, UNF, NPT, BSPT, BSPP, Trapesium, Segiempat, BSW, BSF.',
  manual: 'Masukkan Major Diameter (Ø luar ulir dalam mm) dan Pitch (jarak antar puncak ulir dalam mm). Sistem akan menghitung Thread Height dan Minor Diameter otomatis.',
  calc: 'Klik untuk menghitung G-Code G76. Sistem akan menghasilkan 2 baris G76 + full program G-code siap pakai.',
  export: 'Simpan G-code ke file dengan ekstensi .NC, .CNC, atau .TXT. File bisa langsung digunakan di mesin CNC.',
};

export default function HelpPanel({ activeHelp, onClear }) {
  const { theme } = useTheme();
  if (!activeHelp) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.accent }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>💡</Text>
        <Text style={[styles.text, { color: theme.text }]}>{HELP_TEXTS[activeHelp] || ''}</Text>
      </View>
      <TouchableOpacity onPress={onClear} style={styles.closeBtn}>
        <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export function helpKeys() {
  return Object.keys(HELP_TEXTS);
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start' },
  content: { flex: 1, flexDirection: 'row', gap: 8 },
  icon: { fontSize: 16, marginTop: 1 },
  text: { flex: 1, fontSize: 12, lineHeight: 18 },
  closeBtn: { padding: 4, marginLeft: 8 },
  closeText: { fontSize: 16, fontWeight: '700' },
});
