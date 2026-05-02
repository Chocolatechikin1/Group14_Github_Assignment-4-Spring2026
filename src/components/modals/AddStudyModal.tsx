import React, { useMemo, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { shared } from '../../styles/shared';
import { ExtraBlock, formatHour } from '../../data';

const DURATIONS: { label: string; hours: number }[] = [
  { label: '30 min', hours: 0.5 },
  { label: '1 hour', hours: 1 },
  { label: '1.5 hours', hours: 1.5 },
  { label: '2 hours', hours: 2 },
  { label: '3 hours', hours: 3 },
];

const COURSES_LIST = [
  { key: 'PHY', label: 'Physics 2325', color: '#3B82F6' },
  { key: 'MATH', label: 'Math 2417', color: '#22C55E' },
  { key: 'CS', label: 'CS 3354', color: '#DC2626' },
  { key: 'HIST', label: 'History 1301', color: '#F97316' },
  { key: 'SELF', label: 'Self-Scheduled', color: '#A855F7' },
];

const START_HOURS: number[] = [];
for (let h = 7; h <= 22; h += 0.5) START_HOURS.push(h);

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (block: ExtraBlock) => void;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== trimmed) return null;
  return date;
}

export default function AddStudyModal({ visible, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState(todayISO());
  const [duration, setDuration] = useState(1);
  const [course, setCourse] = useState('SELF');
  const [startHour, setStartHour] = useState(15);
  const [notes, setNotes] = useState('');

  const parsedDate = useMemo(() => parseDateInput(dateInput), [dateInput]);
  const isValid = Boolean(title.trim() && parsedDate);

  const reset = () => {
    setTitle('');
    setDateInput(todayISO());
    setDuration(1);
    setCourse('SELF');
    setStartHour(15);
    setNotes('');
  };

  const handleAdd = () => {
    if (!isValid || !parsedDate) return;
    const endHour = Math.min(startHour + duration, 24);
    const day = parsedDate.getDay() === 0 ? 7 : parsedDate.getDay();
    onAdd({
      id: `eb-${Date.now()}`,
      title: title.trim(),
      course: course as ExtraBlock['course'],
      day,
      startHour,
      endHour,
      dateISO: parsedDate.toISOString().slice(0, 10),
      notes: notes.trim(),
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={shared.overlay}>
          <View style={shared.sheet}>
            <View style={shared.sheetHandle} />
            <Text style={[shared.modalTitle, { marginBottom: 20 }]}>Add Study Block</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 560 }}>
              <Text style={s.label}>Title *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Study: Physics Ch. 5"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={s.label}>Date *</Text>
              <TextInput
                style={[s.input, !parsedDate && s.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={dateInput}
                onChangeText={setDateInput}
                autoCapitalize="none"
              />
              {!parsedDate ? <Text style={s.errorText}>Use a valid date in YYYY-MM-DD format.</Text> : null}

              <Text style={s.label}>Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {COURSES_LIST.map(c => (
                  <TouchableOpacity
                    key={c.key}
                    style={[s.courseChip, course === c.key && { backgroundColor: c.color, borderColor: c.color }]}
                    onPress={() => setCourse(c.key)}
                  >
                    <Text style={[s.courseChipTxt, course === c.key && { color: 'white' }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[s.label, { marginTop: 14 }]}>Start Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }}>
                {START_HOURS.map(h => (
                  <TouchableOpacity key={h} style={[s.timeChip, startHour === h && s.timeChipActive]} onPress={() => setStartHour(h)}>
                    <Text style={[s.timeChipTxt, startHour === h && s.timeChipTxtActive]}>{formatHour(h)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[s.label, { marginTop: 14 }]}>Duration</Text>
              <View style={s.durationRow}>
                {DURATIONS.map(d => (
                  <TouchableOpacity key={d.label} style={[s.durBtn, duration === d.hours && s.durBtnActive]} onPress={() => setDuration(d.hours)}>
                    <Text style={[s.durTxt, duration === d.hours && s.durTxtActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.label, { marginTop: 14 }]}>Description</Text>
              <TextInput
                style={[s.input, s.notesInput]}
                placeholder="What will you work on?"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <View style={s.preview}>
                <Text style={s.previewLabel}>Scheduled For</Text>
                <Text style={s.previewVal}>
                  {parsedDate ? parsedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Invalid date'} | {formatHour(startHour)} - {formatHour(Math.min(startHour + duration, 24))}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={[shared.ctaBtn, { backgroundColor: '#7C3AED', marginTop: 20, opacity: isValid ? 1 : 0.5 }]} onPress={handleAdd} disabled={!isValid}>
              <Text style={shared.ctaTxt}>Add to Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={shared.dismissBtn} onPress={handleClose}>
              <Text style={shared.dismissTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 14, color: '#111827', marginBottom: 16, backgroundColor: 'white' },
  inputError: { borderColor: '#EF4444', marginBottom: 4 },
  errorText: { color: '#B91C1C', fontSize: 12, fontWeight: '700', marginBottom: 14 },
  notesInput: { minHeight: 76, textAlignVertical: 'top' },
  courseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  courseChipTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  timeChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  timeChipTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  timeChipTxtActive: { color: 'white' },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  durBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  durTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },
  durTxtActive: { color: 'white' },
  preview: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE' },
  previewLabel: { fontSize: 10, fontWeight: '700', color: '#5B21B6', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  previewVal: { fontSize: 13, fontWeight: '700', color: '#5B21B6' },
});
