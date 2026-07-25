import React, { useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, Modal, StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { calculateG76 } from '../utils/g76Calculator';
import ThreadDiagram from '../components/ThreadDiagram';

export default function HomeScreen({ navigation, route }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const s = makeStyles(theme);
  const {
    machineMode, setMachineMode,
    odOrId, setOdOrId,
    inputMode, setInputMode,
    selectedThread, setSelectedThread,
    manualD, setManualD,
    manualP, setManualP,
    konstanta, setKonstanta,
    zLength, setZLength,
    doc, setDoc,
    taperEnabled, setTaperEnabled,
    taperR, setTaperR,
    spindleRPM, setSpindleRPM,
  } = useApp();

  const [error, setError] = React.useState('');
  const [showWarning, setShowWarning] = React.useState(false);

  useEffect(() => {
    if (route.params?.selected) {
      setSelectedThread(route.params.selected);
      setInputMode('catalog');
      navigation.setParams({ selected: undefined });
    }
  }, [route.params?.selected]);

  const getKonstanta = () => odOrId === 'ID' ? 0.5413 : konstanta;

  const buildThread = () => {
    if (inputMode === 'catalog' && selectedThread) return { ...selectedThread, constant: getKonstanta() };
    const d = parseFloat(manualD);
    const p = parseFloat(manualP);
    if (!isNaN(d) && !isNaN(p)) {
      const h = p * getKonstanta();
      const taper = taperEnabled;
      const taperVal = taperEnabled ? parseFloat(taperR) || null : null;
      if (odOrId === 'OD') {
        return { designation: `Ø${d}×${p}`, majorDiameter: d, pitch: p, minorDiameter: d - 2 * h, threadHeight: h, constant: getKonstanta(), taper, taperR: taperVal };
      }
      return { designation: `Ø${d + 2 * h}×${p}`, majorDiameter: d + 2 * h, pitch: p, minorDiameter: d, threadHeight: h, constant: getKonstanta(), taper, taperR: taperVal };
    }
    return null;
  };

  const hitung = () => {
    setError('');
    if (inputMode === 'catalog' && !selectedThread) { setError('Pilih ulir dari katalog'); return; }
    if (inputMode === 'manual') {
      if (!manualD || !manualP || isNaN(manualD) || isNaN(manualP)) { setError(odOrId === 'OD' ? 'Isi Major Diameter dan Pitch' : 'Isi Diameter Lubang dan Pitch'); return; }
    }
    const z = parseFloat(zLength);
    const d = parseFloat(doc);
    if (!zLength || isNaN(z) || z <= 0) { setError('Masukkan Z yang valid'); return; }
    if (!doc || isNaN(d) || d <= 0) { setError('Masukkan DOC yang valid'); return; }
    const rpm = spindleRPM ? parseFloat(spindleRPM) : 500;
    if (isNaN(rpm) || rpm <= 0) { setError('Masukkan RPM spindle yang valid'); return; }
    if (d > 0.8) { setShowWarning(true); return; }
    eksekusi(z, d, rpm);
  };

  const eksekusi = (z, d, rpm) => {
    const thread = buildThread();
    const result = calculateG76({ thread, machineMode, zLength: z, docFirstPass: d, odOrId, spindleRPM: rpm });
    navigation.push('Result', { result, machineMode, odOrId, spindleRPM: rpm });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.topBar}>
        <Text style={s.logo}>QuickG76</Text>
        <TouchableOpacity onPress={toggleTheme}><Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text></TouchableOpacity>
      </View>

      <View style={s.card}>
        <ThreadDiagram
          odOrId={odOrId}
          majorD={(() => {
            if (inputMode === 'catalog' && selectedThread) return selectedThread.majorDiameterMM || selectedThread.majorDiameter;
            const d = parseFloat(manualD);
            const p = parseFloat(manualP);
            if (!isNaN(d) && !isNaN(p)) {
              const h = p * (odOrId === 'ID' ? 0.5413 : konstanta);
              return odOrId === 'OD' ? d : d + 2 * h;
            }
            return null;
          })()}
          minorD={(() => {
            if (inputMode === 'catalog' && selectedThread) return selectedThread.minorDiameterMM || selectedThread.minorDiameter;
            const d = parseFloat(manualD);
            const p = parseFloat(manualP);
            if (!isNaN(d) && !isNaN(p)) {
              const h = p * (odOrId === 'ID' ? 0.5413 : konstanta);
              return odOrId === 'OD' ? d - 2 * h : d;
            }
            return null;
          })()}
          pitch={inputMode === 'catalog' && selectedThread ? (selectedThread.pitchMM || selectedThread.pitch) : (parseFloat(manualP) || null)}
          threadHeight={(() => {
            if (inputMode === 'catalog' && selectedThread) return selectedThread.threadHeight;
            const p = parseFloat(manualP);
            if (!isNaN(p)) return p * (odOrId === 'ID' ? 0.5413 : konstanta);
            return null;
          })()}
        />
      </View>

      <Text style={s.label}>TIPE MESIN</Text>
      <View style={s.rowCenter}>
        <Text style={[s.togText, machineMode === 'ABSOLUT' && s.togActive]}>ABSOLUT</Text>
        <Switch value={machineMode === 'INTEGER'} onValueChange={(v) => setMachineMode(v ? 'INTEGER' : 'ABSOLUT')} />
        <Text style={[s.togText, machineMode === 'INTEGER' && s.togActive]}>INTEGER</Text>
      </View>

      <Text style={s.label}>TIPE ULIR</Text>
      <View style={s.row}>
        {['OD', 'ID'].map(t => (
          <TouchableOpacity key={t} style={[s.btnOpt, odOrId === t && s.btnOptOn]} onPress={() => setOdOrId(t)}>
            <Text style={[s.btnOptText, odOrId === t && s.btnOptTextOn]}>{t === 'OD' ? 'Luar (OD)' : 'Dalam (ID)'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>SUMBER ULIR</Text>
      <View style={s.row}>
        <TouchableOpacity style={[s.btnOpt, inputMode === 'catalog' && s.btnOptOn]} onPress={() => setInputMode('catalog')}>
          <Text style={[s.btnOptText, inputMode === 'catalog' && s.btnOptTextOn]}>📖 KATALOG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnOpt, inputMode === 'manual' && s.btnOptOn]} onPress={() => setInputMode('manual')}>
          <Text style={[s.btnOptText, inputMode === 'manual' && s.btnOptTextOn]}>MANUAL</Text>
        </TouchableOpacity>
      </View>
      {inputMode === 'catalog' && (
        selectedThread ? (
          <TouchableOpacity style={s.selectedBox} onPress={() => navigation.push('Catalog')}>
            <Text style={s.selectedTitle}>{selectedThread.designation}</Text>
            <Text style={s.selectedSub}>Tap untuk ganti</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.pilihBtn} onPress={() => navigation.push('Catalog')}>
            <Text style={s.pilihBtnText}>PILIH DARI KATALOG</Text>
          </TouchableOpacity>
        )
      )}
      {inputMode === 'manual' && (
        <>
          <View style={[s.row, { marginTop: 8 }]}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder={odOrId === 'OD' ? "Major Ø (mm)" : "Lubang Ø (mm)"} value={manualD} onChangeText={setManualD} keyboardType="decimal-pad" />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Pitch (mm)" value={manualP} onChangeText={setManualP} keyboardType="decimal-pad" />
          </View>
          <View style={[s.row, { marginTop: 8 }]}>
            <TouchableOpacity style={[s.btnOpt, !taperEnabled && s.btnOptOn]} onPress={() => setTaperEnabled(false)}>
              <Text style={[s.btnOptText, !taperEnabled && s.btnOptTextOn]}>LURUS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnOpt, taperEnabled && s.btnOptOn]} onPress={() => setTaperEnabled(true)}>
              <Text style={[s.btnOptText, taperEnabled && s.btnOptTextOn]}>TIRUS</Text>
            </TouchableOpacity>
            {taperEnabled && (
              <TextInput style={[s.input, { flex: 1 }]} placeholder="R (mm)" value={taperR} onChangeText={setTaperR} keyboardType="decimal-pad" />
            )}
          </View>
        </>
      )}
      <View style={[s.row, { marginTop: 10 }]}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="Z- (mm)" value={zLength} onChangeText={setZLength} keyboardType="decimal-pad" />
        <TextInput style={[s.input, { flex: 1 }]} placeholder="DOC (mm)" value={doc} onChangeText={setDoc} keyboardType="decimal-pad" />
      </View>

      <Text style={s.label}>SPINDLE</Text>
      <TextInput style={s.input} placeholder="RPM" value={spindleRPM} onChangeText={setSpindleRPM} keyboardType="decimal-pad" />

      {odOrId === 'OD' && (
        <>
          <Text style={s.label}>KONSTANTA</Text>
          <View style={s.row}>
            {[
              { v: 0.6134, label: '0.6134 (ISO)' },
              { v: 0.62, label: '0.62 (sedang)' },
              { v: 0.64, label: '0.64 (longgar)' },
            ].map(({ v, label }) => (
              <TouchableOpacity key={v} style={[s.btnOpt, konstanta === v && s.btnOptOn]} onPress={() => setKonstanta(v)}>
                <Text style={[s.btnOptText, konstanta === v && s.btnOptTextOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {error ? <View style={s.errBox}><Text style={s.errText}>{error}</Text></View> : null}

      <TouchableOpacity style={s.calcBtn} onPress={hitung}>
        <Text style={s.calcBtnText}>HITUNG G-CODE</Text>
      </TouchableOpacity>

      <Modal visible={showWarning} transparent>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⚠️ BAHAYA</Text>
            <Text style={s.modalMsg}>DOC {'>'} 0.8mm berisiko merusak mata insert! Lanjutkan?</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.btnBatal} onPress={() => setShowWarning(false)}><Text style={{ color: theme.text }}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={s.btnLanjut} onPress={() => { setShowWarning(false); const z = parseFloat(zLength); const d = parseFloat(doc); const rpm = spindleRPM ? parseFloat(spindleRPM) : 500; eksekusi(z, d, rpm); }}><Text style={{ color: '#fff' }}>Lanjutkan</Text></TouchableOpacity>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  logo: { fontSize: 22, fontWeight: '900', color: t.text },
  card: { backgroundColor: t.card, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: t.border },
  label: { fontSize: 10, fontWeight: '700', color: t.textSecondary, letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  togText: { fontSize: 13, fontWeight: '700', color: t.border },
  togActive: { color: t.accent },
  btnOpt: { flex: 1, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  btnOptOn: { borderColor: t.accent, backgroundColor: t.inputBg },
  btnOptText: { fontSize: 12, fontWeight: '700', color: t.textSecondary },
  btnOptTextOn: { color: t.accent },
  selectedBox: { marginTop: 8, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  selectedTitle: { fontSize: 14, fontWeight: '700', color: t.accent },
  selectedSub: { fontSize: 10, color: t.textSecondary, marginTop: 2 },
  pilihBtn: { marginTop: 8, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  pilihBtnText: { color: t.accent, fontWeight: '700', fontSize: 13 },
  input: { backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.border, borderRadius: 20, padding: 12, fontSize: 14, color: t.text },
  errBox: { backgroundColor: t.red + '22', borderWidth: 1, borderColor: t.red, borderRadius: 20, padding: 10, marginBottom: 10 },
  errText: { color: t.red, fontSize: 13, textAlign: 'center' },
  calcBtn: { backgroundColor: t.green, padding: 16, borderRadius: 24, alignItems: 'center', marginTop: 4 },
  calcBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 32 },
  modalBox: { backgroundColor: t.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: t.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: t.red, textAlign: 'center', marginBottom: 10 },
  modalMsg: { fontSize: 14, color: t.text, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  btnBatal: { flex: 1, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: t.border, alignItems: 'center' },
  btnLanjut: { flex: 1, padding: 12, borderRadius: 20, backgroundColor: t.red, alignItems: 'center' },
});
