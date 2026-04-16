import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { shared, RED } from '../../styles/shared';

const CONFLICTS = [
  { label: 'Physics Quiz 2',  time: '2:00 PM', color: '#3B82F6' },
  { label: 'CS Proj Meeting', time: '3:00 PM', color: '#DC2626' },
  { label: 'Study: Math',     time: '5:00 PM', color: '#A855F7' },
  { label: 'Physics Lab',     time: '7:00 PM', color: '#22C55E' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ConflictModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={shared.overlay}>
        <View style={[shared.sheet, s.sheet]}>
          <View style={shared.sheetHandle} />

          {/* Header */}
          <View style={s.head}>
            <View style={s.bang}>
              <Text style={s.bangTxt}>!</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>CONFLICT DETECTED</Text>
              <Text style={s.sub}>
                You have <Text style={{ fontWeight: '800', color: '#DC2626' }}>4 tasks</Text> on
                Wednesday, Mar 11. This may exceed your available time.
              </Text>
            </View>
          </View>

          {/* Warning pill */}
          <View style={s.warnPill}>
            <Text style={s.warnTxt}>⚠️  Consider rescheduling some tasks to balance your workload.</Text>
          </View>

          {/* Event list */}
          <View style={s.list}>
            <Text style={s.listHead}>SCHEDULED ON WEDNESDAY:</Text>
            {CONFLICTS.map((c, i) => (
              <View key={i} style={s.row}>
                <View style={[shared.dot, { backgroundColor: c.color }]} />
                <Text style={s.rowLabel}>{c.label}</Text>
                <Text style={s.rowTime}>{c.time}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[shared.ctaBtn, { backgroundColor: RED }]} onPress={onClose}>
            <Text style={shared.ctaTxt}>RESCHEDULE TASKS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={shared.dismissBtn} onPress={onClose}>
            <Text style={shared.dismissTxt}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet:    { borderWidth: 2, borderColor: '#FCA5A5' },
  head:     { flexDirection: 'row', gap: 14, marginBottom: 12, alignItems: 'flex-start' },
  bang:     { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  bangTxt:  { color: 'white', fontSize: 24, fontWeight: '900' },
  title:    { fontSize: 18, fontWeight: '900', color: '#7F1D1D', marginBottom: 4 },
  sub:      { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  warnPill: { backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 16 },
  warnTxt:  { fontSize: 12, color: '#92400E', fontWeight: '500' },
  list:     { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 16 },
  listHead: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 10, letterSpacing: 0.5 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  rowTime:  { fontSize: 13, color: '#9CA3AF' },
});
