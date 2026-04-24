import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { shared, ACCENT } from '../../styles/shared';
import { WEEK_DAYS, HOUR_LABELS, HOURS } from '../../data';

const DURATIONS = ['30 min', '1 hour', '1.5 hours', '2 hours', '3 hours'];
const COURSES_LIST = [
  { key: 'PHY',  label: 'Physics 2325',  color: '#3B82F6' },
  { key: 'MATH', label: 'Math 2417',     color: '#22C55E' },
  { key: 'CS',   label: 'CS 3354',       color: '#DC2626' },
  { key: 'HIST', label: 'History 1301',  color: '#F97316' },
  { key: 'SELF', label: 'Self-Scheduled', color: '#A855F7' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, course: string, duration: string, day: number, startTime: number) => void;
}

export default function AddStudyModal({ visible, onClose, onAdd }: Props) {
  const [title, setTitle]       = useState('');
  const [duration, setDuration] = useState('1 hour');
  const [course, setCourse]     = useState('SELF');
  const [selectedDay, setSelectedDay] = useState(1); // 1 = Monday
  const [selectedTime, setSelectedTime] = useState(16); // 16 = 4 PM

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), course, duration, selectedDay, selectedTime);
    setTitle('');
    setDuration('1 hour');
    setCourse('SELF');
    setSelectedDay(1);
    setSelectedTime(16);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={shared.overlay}>
          <View style={shared.sheet}>
            <View style={shared.sheetHandle} />
            <Text style={[shared.modalTitle, { marginBottom: 20 }]}>➕  Add Study Block</Text>

            {/* Title input */}
            <Text style={s.label}>Block Title *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Study: Physics Ch. 5"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            {/* Course selector */}
            <Text style={s.label}>Course</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {COURSES_LIST.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[s.courseChip, course === c.key && { backgroundColor: c.color }]}
                  onPress={() => setCourse(c.key)}
                >
                  <Text style={[s.courseChipTxt, course === c.key && { color: 'white' }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duration selector */}
            <Text style={[s.label, { marginTop: 14 }]}>Duration</Text>
            <View style={s.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[s.durBtn, duration === d && s.durBtnActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[s.durTxt, duration === d && s.durTxtActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Day selector */}
            <Text style={[s.label, { marginTop: 14 }]}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {WEEK_DAYS.map((day, idx) => (
                <TouchableOpacity
                  key={day}
                  style={[s.courseChip, selectedDay === idx + 1 && { backgroundColor: '#374151' }]}
                  onPress={() => setSelectedDay(idx + 1)}
                >
                  <Text style={[s.courseChipTxt, selectedDay === idx + 1 && { color: 'white' }]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time selector */}
            <Text style={[s.label, { marginTop: 14 }]}>Start Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {HOURS.map((hr, idx) => (
                <TouchableOpacity
                  key={hr}
                  style={[s.courseChip, selectedTime === hr && { backgroundColor: '#374151' }]}
                  onPress={() => setSelectedTime(hr)}
                >
                  <Text style={[s.courseChipTxt, selectedTime === hr && { color: 'white' }]}>{HOUR_LABELS[idx]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[shared.ctaBtn, { backgroundColor: ACCENT, marginTop: 20, opacity: title.trim() ? 1 : 0.5 }]}
              onPress={handleAdd}
              disabled={!title.trim()}
            >
              <Text style={shared.ctaTxt}>Add Study Block</Text>
            </TouchableOpacity>
            <TouchableOpacity style={shared.dismissBtn} onPress={onClose}>
              <Text style={shared.dismissTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  label:        { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 14, color: '#111827', marginBottom: 16 },
  courseChip:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  courseChipTxt:{ fontSize: 12, fontWeight: '600', color: '#374151' },
  durationRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  durBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  durTxt:       { fontSize: 13, fontWeight: '600', color: '#374151' },
  durTxtActive: { color: 'white' },
});
