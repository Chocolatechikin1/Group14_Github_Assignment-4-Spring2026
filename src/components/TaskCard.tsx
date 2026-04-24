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
            <Text style={[s.daysTxt, { color: '#BC0001' }]}>PERSONAL</Text>
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
      <View style={s.meta}>
        <Text style={s.metaText}>
          <Text style={s.metaKey}>Course: </Text>
          <Text style={{ color: course.color, fontWeight: '600' }}>{course.label}</Text>
        </Text>
      </View>
      <View style={s.meta}>
        <Text style={s.metaText}><Text style={s.metaKey}>Due: </Text>{task.due}</Text>
      </View>
      <View style={s.meta}>
        <Text style={s.metaText}><Text style={s.metaKey}>Type: </Text>{task.type}</Text>
      </View>

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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  cardDone:    { opacity: 0.5 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  checkbox:    { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkMark:   { color: 'white', fontSize: 11, fontWeight: '700' },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  overdueBadge:{ backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  overdueTxt:  { color: 'white', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  daysBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  daysTxt:     { color: '#1D4ED8', fontSize: 10, fontWeight: '700' },
  title:       { fontSize: 16, fontWeight: '600', color: '#BC0001', marginBottom: 8 },
  titleDone:   { textDecorationLine: 'line-through', color: '#94a3b8' },
  meta:        { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText:    { fontSize: 13, color: '#64748b' },
  metaKey:     { fontWeight: '500' },
  viewBtn:     { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  viewBtnTxt:  { color: 'white', fontWeight: '600', fontSize: 14 },
});
