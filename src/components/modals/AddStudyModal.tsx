import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { shared } from '../../styles/shared';
import { ExtraBlock, formatHour } from '../../data';

// The modal handles both create and edit flows for custom study blocks/tasks.
const COURSES_LIST = [
  { key: 'PHY', label: 'Physics 2325', color: '#3B82F6' },
  { key: 'MATH', label: 'Math 2417', color: '#22C55E' },
  { key: 'CS', label: 'CS 3354', color: '#DC2626' },
  { key: 'HIST', label: 'History 1301', color: '#F97316' },
  { key: 'SELF', label: 'Self-Scheduled', color: '#A855F7' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (block: ExtraBlock) => void;
  initialBlock?: ExtraBlock | null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  // Only accept ISO dates so calendar math can stay predictable across browsers.
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== trimmed) return null;
  return date;
}

function parseClockTime(value: string, period: 'AM' | 'PM') {
  // Convert user-entered 12-hour time into the 24-hour decimal format used by calendar blocks.
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return null;
  const rawHour = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  if (rawHour < 1 || rawHour > 12 || minutes < 0 || minutes > 59) return null;
  let hour = rawHour % 12;
  if (period === 'PM') hour += 12;
  return hour + minutes / 60;
}

// Duration fields stay separate so users can enter exact hours/minutes/seconds.
function cleanDurationPart(value: string) {
  const numeric = Number(value || '0');
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function clockPartsFromHour(hourValue: number) {
  const hour = Math.floor(hourValue);
  const minutes = Math.round((hourValue - hour) * 60);
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return {
    time: `${displayHour}:${String(minutes).padStart(2, '0')}`,
    period,
  };
}

export default function AddStudyModal({ visible, onClose, onAdd, initialBlock = null }: Props) {
  const [itemType, setItemType] = useState<'study' | 'task'>('study');
  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState(todayISO());
  const [timeInput, setTimeInput] = useState('3:00');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('PM');
  const [durationHours, setDurationHours] = useState('1');
  const [durationMinutes, setDurationMinutes] = useState('0');
  const [durationSeconds, setDurationSeconds] = useState('0');
  const [course, setCourse] = useState('SELF');
  const [notes, setNotes] = useState('');

  const parsedDate = useMemo(() => parseDateInput(dateInput), [dateInput]);
  const parsedStartHour = useMemo(() => parseClockTime(timeInput, timePeriod), [timeInput, timePeriod]);
  const durationTotalSeconds = useMemo(() => {
    // Validate duration parts together because minutes/seconds must remain under 60.
    const h = cleanDurationPart(durationHours);
    const m = cleanDurationPart(durationMinutes);
    const s = cleanDurationPart(durationSeconds);
    if (h === null || m === null || s === null || m > 59 || s > 59) return null;
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : null;
  }, [durationHours, durationMinutes, durationSeconds]);
  const duration = durationTotalSeconds ? durationTotalSeconds / 3600 : 0;
  const isStudyValid = itemType === 'task' || (parsedStartHour !== null && durationTotalSeconds !== null);
  const isValid = Boolean(title.trim() && parsedDate && isStudyValid);
  const editing = Boolean(initialBlock);

  useEffect(() => {
    // Opening in edit mode preloads the existing item; opening fresh resets the form.
    if (!visible) return;
    if (!initialBlock) {
      reset();
      return;
    }

    setItemType(initialBlock.itemType ?? 'study');
    setTitle(initialBlock.title);
    setDateInput(initialBlock.dueDateISO || initialBlock.dateISO || todayISO());
    const parts = clockPartsFromHour(initialBlock.startHour);
    setTimeInput(parts.time);
    setTimePeriod(parts.period);
    const seconds = initialBlock.durationSeconds ?? Math.max(0, Math.round((initialBlock.endHour - initialBlock.startHour) * 3600));
    setDurationHours(String(Math.floor(seconds / 3600)));
    setDurationMinutes(String(Math.floor((seconds % 3600) / 60)));
    setDurationSeconds(String(seconds % 60));
    setCourse(initialBlock.course);
    setNotes(initialBlock.notes ?? '');
  }, [visible, initialBlock]);

  const reset = () => {
    setItemType('study');
    setTitle('');
    setDateInput(todayISO());
    setTimeInput('3:00');
    setTimePeriod('PM');
    setDurationHours('1');
    setDurationMinutes('0');
    setDurationSeconds('0');
    setCourse('SELF');
    setNotes('');
  };

  const handleAdd = () => {
    if (!isValid || !parsedDate) return;
    // Tasks are all-day due-date items; study blocks carry start/end times.
    const startHour = itemType === 'study' ? parsedStartHour ?? 0 : 23;
    const endHour = Math.min(startHour + duration, 24);
    const day = parsedDate.getDay() === 0 ? 7 : parsedDate.getDay();
    onAdd({
      id: initialBlock?.id ?? `eb-${Date.now()}`,
      title: title.trim(),
      course: course as ExtraBlock['course'],
      day,
      startHour,
      endHour,
      dateISO: parsedDate.toISOString().slice(0, 10),
      dueDateISO: parsedDate.toISOString().slice(0, 10),
      notes: notes.trim(),
      itemType,
      durationSeconds: durationTotalSeconds ?? undefined,
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
            <Text style={[shared.modalTitle, { marginBottom: 20 }]}>{editing ? 'Edit Study Block or Task' : 'Add Study Block or Task'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 560 }}>
              <Text style={s.label}>Type</Text>
              <View style={s.typeRow}>
                {(['study', 'task'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[s.typeBtn, itemType === type && s.typeBtnActive]}
                    onPress={() => setItemType(type)}
                  >
                  <Text style={[s.typeBtnText, itemType === type && s.typeBtnTextActive]}>
                      {type === 'study' ? 'Study Block' : 'Task'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Title *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Study: Physics Ch. 5"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={s.label}>{itemType === 'study' ? 'Study Date *' : 'Due Date *'}</Text>
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

              {itemType === 'study' ? (
                <>
                  <Text style={[s.label, { marginTop: 14 }]}>Start Time</Text>
                  <View style={s.timeInputRow}>
                    <TextInput
                      style={[s.input, s.timeInput, parsedStartHour === null && s.inputError]}
                      placeholder="12:00"
                      placeholderTextColor="#9CA3AF"
                      value={timeInput}
                      onChangeText={setTimeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                    {(['AM', 'PM'] as const).map(period => (
                      <TouchableOpacity
                        key={period}
                        style={[s.periodBtn, timePeriod === period && s.periodBtnActive]}
                        onPress={() => setTimePeriod(period)}
                      >
                        <Text style={[s.periodText, timePeriod === period && s.periodTextActive]}>{period}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {parsedStartHour === null ? <Text style={s.errorText}>Use a time like 12 or 12:30.</Text> : null}

                  <Text style={[s.label, { marginTop: 14 }]}>Duration</Text>
                  <View style={s.durationInputs}>
                    <DurationInput label="Hours" value={durationHours} onChangeText={setDurationHours} />
                    <DurationInput label="Minutes" value={durationMinutes} onChangeText={setDurationMinutes} />
                    <DurationInput label="Seconds" value={durationSeconds} onChangeText={setDurationSeconds} />
                  </View>
                  {durationTotalSeconds === null ? <Text style={s.errorText}>Duration must be greater than zero. Minutes and seconds must be 0-59.</Text> : null}
                </>
              ) : null}

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
                <Text style={s.previewLabel}>{itemType === 'study' ? 'Scheduled For' : 'Due'}</Text>
                <Text style={s.previewVal}>
                  {parsedDate ? parsedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Invalid date'}
                  {itemType === 'study' && parsedStartHour !== null && durationTotalSeconds !== null ? ` | ${formatHour(parsedStartHour)} - ${formatHour(Math.min(parsedStartHour + duration, 24))}` : ''}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={[shared.ctaBtn, { backgroundColor: '#7C3AED', marginTop: 20, opacity: isValid ? 1 : 0.5 }]} onPress={handleAdd} disabled={!isValid}>
              <Text style={shared.ctaTxt}>{editing ? 'Save Changes' : itemType === 'study' ? 'Add Study Block' : 'Add Task'}</Text>
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

function DurationInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={s.durationField}>
      <TextInput
        style={[s.input, s.durationInput]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#9CA3AF"
      />
      <Text style={s.durationLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 11, alignItems: 'center', backgroundColor: 'white' },
  typeBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  typeBtnText: { fontSize: 13, fontWeight: '800', color: '#374151' },
  typeBtnTextActive: { color: 'white' },
  input: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 14, color: '#111827', marginBottom: 16, backgroundColor: 'white' },
  inputError: { borderColor: '#EF4444', marginBottom: 4 },
  errorText: { color: '#B91C1C', fontSize: 12, fontWeight: '700', marginBottom: 14 },
  notesInput: { minHeight: 76, textAlignVertical: 'top' },
  courseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: 'white' },
  courseChipTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
  timeInputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  timeInput: { flex: 1 },
  periodBtn: { width: 58, height: 50, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  periodBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  periodText: { fontSize: 13, fontWeight: '900', color: '#374151' },
  periodTextActive: { color: 'white' },
  durationInputs: { flexDirection: 'row', gap: 10 },
  durationField: { flex: 1 },
  durationInput: { marginBottom: 6, textAlign: 'center' },
  durationLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', textAlign: 'center' },
  preview: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE' },
  previewLabel: { fontSize: 10, fontWeight: '700', color: '#5B21B6', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  previewVal: { fontSize: 13, fontWeight: '700', color: '#5B21B6' },
});
