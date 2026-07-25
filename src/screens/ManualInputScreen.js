import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import HelpPanel from '../components/HelpPanel';

export default function ManualInputScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { odOrId, odConstant, manualDiameter, setManualDiameter, manualPitch, setManualPitch } = useApp();
  const [help, setHelp] = React.useState(null);

  const d = parseFloat(manualDiameter);
  const p = parseFloat(manualPitch);
  const constant = odOrId === 'ID' ? 0.5413 : odConstant;
  const isValid = !isNaN(d) && !isNaN(p) && d > 0 && p > 0;
  const threadHeight = isValid ? p * constant : 0;
  const minorDiameter = isValid && odOrId === 'OD' ? d - 2 * threadHeight : d;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.homeBtnText}>← Ke Launcher</Text>
      </TouchableOpacity>

      <Text style={s.pageTitle}>Input Manual</Text>
      <Text style={s.pageSub}>Masukkan data ulir custom / non-standar</Text>

      <HelpPanel activeHelp={help} onClear={() => setHelp(null)} />

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>Major Diameter (mm)</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'manual' ? null : 'manual')}>
            <Text style={s.helpIcon}>❓</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={s.input} placeholder="Contoh: 20.5" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={manualDiameter} onChangeText={setManualDiameter} />
      </View>

      <View style={s.card}>
        <View style={s.labelRow}>
          <Text style={s.label}>Pitch (mm)</Text>
          <TouchableOpacity onPress={() => setHelp(help === 'manual' ? null : 'manual')}>
            <Text style={s.helpIcon}>❓</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={s.input} placeholder="Contoh: 1.5" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" value={manualPitch} onChangeText={setManualPitch} />
      </View>

      {isValid && (
        <View style={[s.card, { backgroundColor: theme.inputBg, borderColor: theme.accent }]}>
          <Text style={s.previewTitle}>Hasil Kalkulasi</Text>
          <View style={s.previewRow}><Text style={s.previewLabel}>Designasi</Text><Text style={s.previewVal}>Ø{d} × {p}</Text></View>
          <View style={s.previewRow}><Text style={s.previewLabel}>Konstanta</Text><Text style={s.previewVal}>{constant}</Text></View>
          <View style={s.previewRow}><Text style={s.previewLabel}>Thread Height</Text><Text style={s.previewVal}>{threadHeight.toFixed(4)} mm</Text></View>
          <View style={s.previewRow}><Text style={s.previewLabel}>Minor Ø</Text><Text style={s.previewVal}>{minorDiameter.toFixed(4)} mm</Text></View>
        </View>
      )}

      <TouchableOpacity style={s.okBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.okBtnText}>SIMPAN & KEMBALI</Text>
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
  pageSub: { fontSize: 13, color: t.textSecondary, marginBottom: 16, marginTop: 4 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, color: t.textSecondary, fontWeight: '600' },
  helpIcon: { fontSize: 16 },
  input: { backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 14, fontSize: 16, color: t.text },
  previewTitle: { fontSize: 14, fontWeight: '700', color: t.accent, marginBottom: 10 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  previewLabel: { fontSize: 13, color: t.textSecondary },
  previewVal: { fontSize: 13, fontWeight: '600', color: t.text },
  okBtn: { backgroundColor: t.green, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  okBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});
