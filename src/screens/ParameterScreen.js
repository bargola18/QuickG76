import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { calculateG76 } from '../utils/g76Calculator';
import HelpPanel from '../components/HelpPanel';

const CONSTANTS = {
  OD: [
    { value: 0.6134, label: '0.6134', desc: 'Standar ISO' },
    { value: 0.62,   label: '0.6200', desc: 'Kombinasi' },
    { value: 0.64,   label: '0.6400', desc: 'Ulir Longgar' },
  ],
};

export default function ParameterScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const {
    machineMode, setMachineMode, odOrId, selectedThread,
    manualDiameter, manualPitch, odConstant, setOdConstant,
    zLength, setZLength, docFirstPass, setDocFirstPass, setLastResult,
  } = useApp();
  const [help, setHelp] = React.useState(null);
  const [showWarning, setShowWarning] = React.useState(false);
  const [error, setError] = React.useState('');

  const getConstant = () => odOrId === 'ID' ? 0.5413 : odConstant;

  const buildThread = () => {
    if (selectedThread) {
      return { ...selectedThread, constant: getConstant() };
    }
    const d = parseFloat(manualDiameter);
    const p = parseFloat(manualPitch);
    if (!isNaN(d) && !isNaN(p)) {
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

  const handleCalculate = () => {
    setError('');
    const thread = buildThread();
    if (!thread) { setError('Pilih ulir dari katalog atau input manual terlebih dahulu'); return; }
    const z = parseFloat(zLength);
    const doc = parseFloat(docFirstPass);
    if (!zLength || isNaN(z) || z <= 0) { setError('Masukkan Z (panjang ulir) yang valid'); return; }
    if (!docFirstPass || isNaN(doc) || doc <= 0) { setError('Masukkan DOC yang valid'); return; }
    if (doc > 0.8) { setShowWarning(true); return; }
    doCalculate(thread, z, doc);
  };

  const doCalculate = (thread, z, doc) => {
    const result = calculateG76({ thread, machineMode, zLength: z, docFirstPass: doc, odOrId });
    setLastResult(result);
    navigation.navigate('Result');
  };

  const proceedWarning = () => {
    setShowWarning(false);
    const thread = buildThread();
    doCalculate(thread, parseFloat(zLength), parseFloat(docFirstPass));
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Ke Launcher</Text>
      </TouchableOpacity>

      <Text style={s.pageTitle}>Parameter & Hitung</Text>
      <Text style={s.pageSub}>Atur parameter mesin dan hitung G-Code</Text>

      <HelpPanel activeHelp={help} onClear={() => setHelp(null)} />

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>TIPE MESIN</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'machine' ? null : 'machine')}><Text style={s.helpIcon}>❓</Text></TouchableOpacity>
        </View>
        <View style={s.toggleRow}>
          <Text style={[s.toggleLabel, machineMode === 'ABSOLUT' && s.activeLabel]}>ABSOLUT</Text>
          <Switch value={machineMode === 'INTEGER'} onValueChange={setMachineMode} trackColor={{ false: theme.green, true: theme.accent }} />
          <Text style={[s.toggleLabel, machineMode === 'INTEGER' && s.activeLabel]}>INTEGER</Text>
        </View>
      </View>

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>TIPE ULIR</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'type' ? null : 'type')}><Text style={s.helpIcon}>❓</Text></TouchableOpacity>
        </View>
        <Text style={s.valueDisplay}>{odOrId === 'OD' ? 'OD (Luar)' : 'ID (Dalam)'}</Text>
        {selectedThread && <Text style={s.valueSub}>{selectedThread.designation}</Text>}
      </View>

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>RUMUS KONSTANTA</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'constant' ? null : 'constant')}><Text style={s.helpIcon}>❓</Text></TouchableOpacity>
        </View>
        {odOrId === 'ID' ? (
          <Text style={s.valueDisplay}>0.5413 (Mutlak untuk ID)</Text>
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
        <View style={s.labelRow}>
          <Text style={s.label}>PARAMETER</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'parameter' ? null : 'parameter')}><Text style={s.helpIcon}>❓</Text></TouchableOpacity>
        </View>
        <Text style={s.fieldLabel}>Z (Panjang Ulir) mm</Text>
        <TextInput style={s.input} placeholder="Contoh: 25" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={zLength} onChangeText={setZLength} />
        <Text style={[s.fieldLabel, { marginTop: 12 }]}>DOC (First Pass Depth) mm</Text>
        <TextInput style={s.input} placeholder="Contoh: 0.15" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={docFirstPass} onChangeText={setDocFirstPass} />
      </View>

      {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

      <TouchableOpacity style={s.calcBtn} onPress={handleCalculate}>
        <Text style={s.calcBtnText}>HITUNG G-CODE</Text>
      </TouchableOpacity>

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
  homeBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  homeBtnText: { color: t.accent, fontSize: 14, fontWeight: '600' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: t.text, marginTop: 4 },
  pageSub: { fontSize: 13, color: t.textSecondary, marginBottom: 16, marginTop: 4 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '700', color: t.textSecondary, letterSpacing: 1 },
  helpIcon: { fontSize: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  toggleLabel: { fontSize: 14, color: t.border, fontWeight: '700' },
  activeLabel: { color: t.accent },
  valueDisplay: { fontSize: 16, fontWeight: '600', color: t.text },
  valueSub: { fontSize: 14, color: t.accent, marginTop: 2 },
  constRow: { flexDirection: 'row', gap: 8 },
  constBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  constBtnActive: { borderColor: t.accent, backgroundColor: t.inputBg },
  constBtnLabel: { fontSize: 14, fontWeight: '700', color: t.textSecondary },
  constBtnLabelActive: { color: t.accent },
  constBtnDesc: { fontSize: 10, color: t.border, marginTop: 2 },
  constBtnDescActive: { color: t.textSecondary },
  fieldLabel: { fontSize: 13, color: t.textSecondary, marginBottom: 6 },
  input: { backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 14, fontSize: 16, color: t.text },
  errorBox: { backgroundColor: t.red + '22', borderWidth: 1, borderColor: t.red, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: t.red, fontSize: 13, textAlign: 'center' },
  calcBtn: { backgroundColor: t.green, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalBox: { backgroundColor: t.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: t.red, marginBottom: 8 },
  modalMsg: { fontSize: 14, color: t.text, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  modalBtnOk: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: t.red, alignItems: 'center' },
});
