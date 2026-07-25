import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { THREAD_CATEGORIES } from '../data/index';
import { calculateG76 } from '../utils/g76Calculator';

export default function HomeScreen({ navigation, route }) {
  const [machineMode, setMachineMode] = useState('ABSOLUT');
  const [selectedThread, setSelectedThread] = useState(null);
  const [zLength, setZLength] = useState('');
  const [docFirstPass, setDocFirstPass] = useState('');
  const [odOrId, setOdOrId] = useState('OD');

  useEffect(() => {
    if (route.params?.selectedThread) {
      setSelectedThread(route.params.selectedThread);
      navigation.setParams({ selectedThread: undefined });
    }
  }, [route.params?.selectedThread]);

  const handleCalculate = () => {
    if (!selectedThread) {
      Alert.alert('Peringatan', 'Pilih jenis ulir dari katalog terlebih dahulu');
      return;
    }
    const z = parseFloat(zLength);
    const doc = parseFloat(docFirstPass);
    if (isNaN(z) || z <= 0) {
      Alert.alert('Input Error', 'Masukkan Z (panjang ulir) yang valid');
      return;
    }
    if (isNaN(doc) || doc <= 0) {
      Alert.alert('Input Error', 'Masukkan DOC yang valid');
      return;
    }
    if (doc > 0.8) {
      Alert.alert(
        'BAHAYA',
        'DOC > 0.8mm berisiko merusak mata insert! Lanjutkan?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            onPress: () => navigateToResult(z, doc),
          },
        ]
      );
      return;
    }
    navigateToResult(z, doc);
  };

  const navigateToResult = (z, doc) => {
    const result = calculateG76({
      thread: selectedThread,
      machineMode,
      zLength: z,
      docFirstPass: doc,
      odOrId,
    });
    navigation.navigate('Result', { result, selectedThread, machineMode, odOrId });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Tipe Mesin</Text>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, machineMode === 'ABSOLUT' && styles.activeLabel]}>
          ABSOLUT
        </Text>
        <Switch
          value={machineMode === 'INTEGER'}
          onValueChange={(v) => setMachineMode(v ? 'INTEGER' : 'ABSOLUT')}
          trackColor={{ false: '#4CAF50', true: '#2196F3' }}
        />
        <Text style={[styles.toggleLabel, machineMode === 'INTEGER' && styles.activeLabel]}>
          INTEGER
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Tipe Ulir</Text>
      <View style={styles.odIdRow}>
        <TouchableOpacity
          style={[styles.odIdBtn, odOrId === 'OD' && styles.odIdBtnActive]}
          onPress={() => setOdOrId('OD')}
        >
          <Text style={[styles.odIdText, odOrId === 'OD' && styles.odIdTextActive]}>OD (Luar)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.odIdBtn, odOrId === 'ID' && styles.odIdBtnActive]}
          onPress={() => setOdOrId('ID')}
        >
          <Text style={[styles.odIdText, odOrId === 'ID' && styles.odIdTextActive]}>ID (Dalam)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Katalog Ulir</Text>
      <View style={styles.catalogGrid}>
        {THREAD_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={styles.catalogBtn}
            onPress={() => navigation.navigate('Catalog', { categoryKey: cat.key })}
          >
            <Text style={styles.catalogBtnText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedThread && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>Ulir dipilih:</Text>
          <Text style={styles.selectedValue}>{selectedThread.designation}</Text>
          <Text style={styles.selectedDetail}>
            Ø{selectedThread.majorDiameterMM || selectedThread.majorDiameter}mm
            {' | '}Pitch {(selectedThread.pitchMM || selectedThread.pitch)}mm
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Parameter</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Z (Panjang Ulir) mm</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 25"
          keyboardType="numeric"
          value={zLength}
          onChangeText={setZLength}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>DOC (First Pass Depth) mm</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 0.15"
          keyboardType="numeric"
          value={docFirstPass}
          onChangeText={setDocFirstPass}
        />
      </View>

      <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
        <Text style={styles.calcBtnText}>HITUNG G-CODE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#333' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, color: '#999', fontWeight: '600' },
  activeLabel: { color: '#333' },
  odIdRow: { flexDirection: 'row', gap: 12 },
  odIdBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  odIdBtnActive: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  odIdText: { fontSize: 14, color: '#666' },
  odIdTextActive: { color: '#2196F3', fontWeight: 'bold' },
  catalogGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catalogBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  catalogBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },
  selectedInfo: { marginTop: 12, padding: 12, backgroundColor: '#E8F5E9', borderRadius: 8 },
  selectedLabel: { fontSize: 12, color: '#666' },
  selectedValue: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  selectedDetail: { fontSize: 14, color: '#555', marginTop: 4 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 14, marginBottom: 4, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  calcBtn: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
