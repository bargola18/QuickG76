import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, Modal, StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { calculateG76 } from '../utils/g76Calculator';

const CONSTANTS = {
  OD: [
    { value: 0.6134, label: '0.6134', desc: 'Standar ISO' },
    { value: 0.62,   label: '0.6200', desc: 'Kombinasi' },
    { value: 0.64,   label: '0.6400', desc: 'Ulir Longgar' },
  ],
  ID: { value: 0.5413, label: '0.5413', desc: 'Mutlak' },
};

export default function HomeScreen({ navigation, route }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [machineMode, setMachineMode] = useState('ABSOLUT');
  const [odOrId, setOdOrId] = useState('OD');
  const [inputMode, setInputMode] = useState('catalog');

  const [selectedThread, setSelectedThread] = useState(null);
  const [manualDiameter, setManualDiameter] = useState('');
  const [manualPitch, setManualPitch] = useState('');

  const [odConstant, setOdConstant] = useState(CONSTANTS.OD[0].value);
  const [zLength, setZLength] = useState('');
  const [docFirstPass, setDocFirstPass] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (route.params?.selectedThread) {
      setSelectedThread(route.params.selectedThread);
      setInputMode('catalog');
      navigation.setParams({ selectedThread: undefined });
    }
  }, [route.params?.selectedThread]);

  const getConstant = () => {
    if (odOrId === 'ID') return CONSTANTS.ID.value;
    if (selectedThread && /^(Tr|Sq)/i.test(selectedThread.designation)) return 0.5;
    return odConstant;
  };

  const buildThread = () => {
    if (inputMode === 'catalog' && selectedThread) {
      return { ...selectedThread, constant: getConstant() };
    }
    if (inputMode === 'manual') {
      const d = parseFloat(manualDiameter);
      const p = parseFloat(manualPitch);
      if (isNaN(d) || isNaN(p)) return null;
      const h = p * getConstant();
      return {
        designation: `Ø${d} x ${p}`,
        majorDiameter: d, pitch: p,
        minorDiameter: odOrId === 'OD' ? d - 2 * h : d,
        threadHeight: h, constant: getConstant(),
      };
    }
    return null;
  };

  const validate = () => {
    setErrorMsg('');
    if (inputMode === 'catalog' && !selectedThread) { setErrorMsg('Pilih ulir dari katalog'); return false; }
    if (inputMode === 'manual') {
      if (!manualDiameter || !manualPitch) { setErrorMsg('Isi Major Diameter dan Pitch'); return false; }
      if (isNaN(parseFloat(manualDiameter)) || isNaN(parseFloat(manualPitch))) { setErrorMsg('Diameter dan Pitch harus angka'); return false; }
    }
    const z = parseFloat(zLength);
    const doc = parseFloat(docFirstPass);
    if (!zLength || isNaN(z) || z <= 0) { setErrorMsg('Masukkan Z (panjang ulir) yang valid'); return false; }
    if (!docFirstPass || isNaN(doc) || doc <= 0) { setErrorMsg('Masukkan DOC yang valid'); return false; }
    if (doc > 0.8) { setShowWarning(true); return false; }
    return true;
  };

  const calculate = () => {
    if (!validate()) return;
    const thread = buildThread();
    if (!thread) { setErrorMsg('Gagal membuat data ulir'); return; }
    const result = calculateG76({ thread, machineMode, zLength: parseFloat(zLength), docFirstPass: parseFloat(docFirstPass), odOrId });
    navigation.push('Result', { result, machineMode, odOrId });
  };

  const proceedWarning = () => {
    setShowWarning(false);
    const thread = buildThread();
    const result = calculateG76({ thread, machineMode, zLength: parseFloat(zLength), docFirstPass: parseFloat(docFirstPass), odOrId });
    navigation.push('Result', { result, machineMode, odOrId });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.sectionTitle}>TIPE MESIN</Text>
        <View style={s.toggleRow}>
          <Text style={[s.toggleLabel, machineMode === 'ABSOLUT' && s.activeLabel]}>ABSOLUT</Text>
          <Switch value={machineMode === 'INTEGER'} onValueChange={(v) => setMachineMode(v ? 'INTEGER' : 'ABSOLUT')} trackColor={{ false: theme.green, true: theme.accent }} />
          <Text style={[s.toggleLabel, machineMode === 'INTEGER' && s.activeLabel]}>INTEGER</Text>
        </View>
        <Text style={s.hint}>{machineMode === 'ABSOLUT' ? 'Q = 0.1, 0.2, 0.3 ...' : 'Q = Q100, Q200, Q300 ...'}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>TIPE ULIR</Text>
        <View style={s.odIdRow}>
          {['OD', 'ID'].map((t) => (
            <TouchableOpacity key={t} style={[s.odIdBtn, odOrId === t && s.odIdBtnActive]} onPress={() => setOdOrId(t)}>
              <Text style={[s.odIdText, odOrId === t && s.odIdTextActive]}>{t === 'OD' ? 'OD (Luar)' : 'ID (Dalam)'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>SUMBER ULIR</Text>
        <View style={s.sourceRow}>
          {['catalog', 'manual'].map((m) => (
            <TouchableOpacity key={m} style={[s.sourceBtn, inputMode === m && s.sourceBtnActive]} onPress={() => setInputMode(m)}>
              <Text style={[s.sourceBtnText, inputMode === m && s.sourceBtnTextActive]}>{m === 'catalog' ? 'PILIH DARI KATALOG' : 'INPUT MANUAL'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {inputMode === 'catalog' && (
          <View style={{ marginTop: 12 }}>
            {selectedThread ? (
              <View style={s.selectedInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={s.selectedValue}>{selectedThread.designation}</Text>
                  <Text style={s.selectedDetail}>Ø{selectedThread.majorDiameterMM || selectedThread.majorDiameter} mm | Pitch {selectedThread.pitchMM || selectedThread.pitch} mm</Text>
                </View>
                <TouchableOpacity style={s.changeBtn} onPress={() => navigation.push('Catalog')}><Text style={s.changeBtnText}>GANTI</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.selectBtn} onPress={() => navigation.push('Catalog')}><Text style={s.selectBtnText}>PILIH ULIR</Text></TouchableOpacity>
            )}
          </View>
        )}
        {inputMode === 'manual' && (
          <View style={{ marginTop: 12, gap: 8 }}>
            <TextInput style={s.input} placeholder="Major Diameter (mm)" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={manualDiameter} onChangeText={setManualDiameter} />
            <TextInput style={s.input} placeholder="Pitch (mm)" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={manualPitch} onChangeText={setManualPitch} />
            {manualDiameter && manualPitch && !isNaN(manualDiameter) && !isNaN(manualPitch) && (
              <View style={s.previewBox}>
                <Text style={s.previewText}>Thread Height: {(parseFloat(manualPitch) * getConstant()).toFixed(4)} mm</Text>
                <Text style={s.previewText}>Minor Ø: {odOrId === 'OD' ? (parseFloat(manualDiameter) - 2 * parseFloat(manualPitch) * getConstant()).toFixed(3) : manualDiameter} mm</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>RUMUS KONSTANTA</Text>
        {odOrId === 'ID' ? (
          <View style={s.constInfo}><Text style={s.constInfoLabel}>ID (Dalam):</Text><Text style={s.constInfoValue}>{CONSTANTS.ID.label} — {CONSTANTS.ID.desc}</Text></View>
        ) : (
          <View style={s.constRow}>
            {CONSTANTS.OD.map((c) => (
              <TouchableOpacity key={c.value} style={[s.constBtn, odConstant === c.value && s.constBtnActive]} onPress={() => setOdConstant(c.value)}>
                <Text style={[s.constBtnLabel, odConstant === c.value && s.constBtnLabelActive]}>{c.label}</Text>
                <Text style={[s.constBtnDesc, odConstant === c.value && s.constBtnDescActive]}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>PARAMETER</Text>
        <Text style={s.inputLabel}>Z (Panjang Ulir) mm</Text>
        <TextInput style={s.input} placeholder="Contoh: 25" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={zLength} onChangeText={setZLength} />
        <Text style={[s.inputLabel, { marginTop: 12 }]}>DOC (First Pass Depth) mm</Text>
        <TextInput style={s.input} placeholder="Contoh: 0.15" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={docFirstPass} onChangeText={setDocFirstPass} />
      </View>

      {errorMsg ? <View style={s.errorBox}><Text style={s.errorText}>{errorMsg}</Text></View> : null}

      <TouchableOpacity style={s.calcBtn} onPress={calculate}><Text style={s.calcBtnText}>HITUNG G-CODE</Text></TouchableOpacity>

      <Modal visible={showWarning} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>⚠️</Text>
            <Text style={s.modalTitle}>BAHAYA!</Text>
            <Text style={s.modalMsg}>DOC {'>'} 0.8mm berisiko merusak mata insert! Lanjutkan?</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setShowWarning(false)}><Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={s.modalBtnOk} onPress={proceedWarning}><Text style={{ color: '#fff', fontWeight: '700' }}>Lanjutkan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: t.textSecondary, letterSpacing: 1, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  toggleLabel: { fontSize: 14, color: t.border, fontWeight: '700' },
  activeLabel: { color: t.accent },
  hint: { textAlign: 'center', fontSize: 12, color: t.border, marginTop: 8 },
  odIdRow: { flexDirection: 'row', gap: 12 },
  odIdBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  odIdBtnActive: { borderColor: t.accent, backgroundColor: t.inputBg },
  odIdText: { fontSize: 14, color: t.textSecondary, fontWeight: '600' },
  odIdTextActive: { color: t.accent },
  sourceRow: { flexDirection: 'row', gap: 8 },
  sourceBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  sourceBtnActive: { borderColor: t.accent, backgroundColor: t.inputBg },
  sourceBtnText: { fontSize: 11, fontWeight: '700', color: t.textSecondary, textAlign: 'center' },
  sourceBtnTextActive: { color: t.accent },
  selectedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.inputBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: t.accent },
  selectedValue: { fontSize: 16, fontWeight: '700', color: t.accent },
  selectedDetail: { fontSize: 12, color: t.textSecondary, marginTop: 2 },
  changeBtn: { backgroundColor: t.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginLeft: 8 },
  changeBtnText: { color: t.accent, fontWeight: '600', fontSize: 12 },
  selectBtn: { padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: t.accent, borderStyle: 'dashed' },
  selectBtnText: { color: t.accent, fontWeight: '700', fontSize: 14 },
  previewBox: { backgroundColor: t.inputBg, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: t.border },
  previewText: { color: t.textSecondary, fontSize: 13 },
  constRow: { flexDirection: 'row', gap: 8 },
  constBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  constBtnActive: { borderColor: t.accent, backgroundColor: t.inputBg },
  constBtnLabel: { fontSize: 14, fontWeight: '700', color: t.textSecondary },
  constBtnLabelActive: { color: t.accent },
  constBtnDesc: { fontSize: 10, color: t.border, marginTop: 2 },
  constBtnDescActive: { color: t.textSecondary },
  constInfo: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  constInfoLabel: { fontSize: 14, color: t.textSecondary },
  constInfoValue: { fontSize: 14, fontWeight: '700', color: t.accent },
  inputLabel: { fontSize: 13, color: t.textSecondary, marginBottom: 6 },
  input: { backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 14, fontSize: 16, color: t.text },
  errorBox: { backgroundColor: t.red + '22', borderWidth: 1, borderColor: t.red, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: t.red, fontSize: 13, textAlign: 'center' },
  calcBtn: { backgroundColor: t.green, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalBox: { backgroundColor: t.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: t.red, marginBottom: 8 },
  modalMsg: { fontSize: 14, color: t.text, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  modalBtnOk: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: t.red, alignItems: 'center' },
});
