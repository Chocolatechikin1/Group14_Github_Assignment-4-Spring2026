import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Task, COURSES, daysColor } from '../data';

interface Props {
  task: Task;
  checked: boolean;
  onCheck: (id: string) => void;
  onViewDetails: (task: Task) => void;
}

export default function TaskCard({ task, checked, onCheck, onViewDetails }: Props) {
  const course = COURSES[task.course];

  return (
    <View style={[s.card, { borderLeftColor: course.color }, checked && s.cardDone]}>
      {/* Header row */}
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => onCheck(task.id)}
          style={[s.checkbox, checked && { backgroundColor: course.color, borderColor: course.color }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {checked && <Text style={s.checkMark}>✓</Text>}
        </TouchableOpacity>

        <View style={[s.dot, { backgroundColor: course.color }]} />
        <View style={{ flex: 1 }} />

        {task.status === 'overdue' ? (
          <View style={s.overdueBadge}>
            <Text style={s.overdueTxt}>OVERDUE</Text>
          </View>
        ) : task.isPersonal ? (
          <View style={[s.daysBadge, { backgroundColor: '#F3E8FF' }]}>
            <Text style={[s.daysTxt, { color: '#7C3AED' }]}>PERSONAL</Text>
          </View>
        ) : (
          <View style={[s.daysBadge, daysColor(task.daysLabel) as any]}>
            <Text style={s.daysTxt}>{task.daysLabel}</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={[s.title, checked && s.titleDone]}>{task.title}</Text>

      {/* Meta */}
      <Text style={s.meta}>
        <Text style={s.metaKey}>Course: </Text>
        <Text style={{ color: course.color, fontWeight: '700' }}>{course.label}</Text>
      </Text>
      <Text style={s.meta}><Text style={s.metaKey}>Due: </Text>{task.due}</Text>
      <Text style={s.meta}><Text style={s.metaKey}>Type: </Text>{task.type}</Text>

      {/* CTA */}
      <TouchableOpacity
        style={[s.viewBtn, { backgroundColor: course.color }]}
        onPress={() => onViewDetails(task)}
      >
        <Text style={s.viewBtnTxt}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardDone:    { opacity: 0.6 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  checkbox:    { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkMark:   { color: 'white', fontSize: 11, fontWeight: '700' },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  overdueBadge:{ backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  overdueTxt:  { color: 'white', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  daysBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  daysTxt:     { color: '#1D4ED8', fontSize: 10, fontWeight: '700' },
  title:       { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  titleDone:   { textDecorationLine: 'line-through', color: '#9CA3AF' },
  meta:        { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  metaKey:     { fontWeight: '600' },
  viewBtn:     { marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  viewBtnTxt:  { color: 'white', fontWeight: '700', fontSize: 13 },
});
