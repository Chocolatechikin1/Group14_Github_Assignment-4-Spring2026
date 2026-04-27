import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Task, COURSES, daysColor } from '../data';
import { AppTheme } from '../styles/shared';

interface Props {
  task: Task;
  checked: boolean;
  onCheck: (id: string) => void;
  onViewDetails: (task: Task) => void;
  theme: AppTheme;
}

export default function TaskCard({ task, checked, onCheck, onViewDetails, theme }: Props) {
  const course = COURSES[task.course];

  return (
    <View
      style={[
        s.card,
        {
          borderLeftColor: course.color,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        checked && s.cardDone,
      ]}
    >
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => onCheck(task.id)}
          style={[
            s.checkbox,
            { borderColor: theme.colors.textSoft, backgroundColor: theme.colors.surfaceMuted },
            checked && { backgroundColor: course.color, borderColor: course.color },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {checked ? <Text style={s.checkMark}>OK</Text> : null}
        </TouchableOpacity>

        <View style={[s.dot, { backgroundColor: course.color }]} />
        <View style={{ flex: 1 }} />

        {task.status === 'overdue' ? (
          <View style={s.overdueBadge}>
            <Text style={s.overdueTxt}>OVERDUE</Text>
          </View>
        ) : task.isPersonal ? (
          <View style={[s.daysBadge, { backgroundColor: theme.mode === 'dark' ? '#43351A' : '#F3E8FF' }]}>
            <Text style={[s.daysTxt, { color: theme.colors.accent }]}>PERSONAL</Text>
          </View>
        ) : (
          <View style={[s.daysBadge, daysColor(task.daysLabel) as any]}>
            <Text style={s.daysTxt}>{task.daysLabel}</Text>
          </View>
        )}
      </View>

      <Text style={[s.title, { color: theme.colors.text }, checked && { color: theme.colors.textSoft, textDecorationLine: 'line-through' }]}>
        {task.title}
      </Text>

      <Text style={[s.meta, { color: theme.colors.textMuted }]}>
        <Text style={s.metaKey}>Course: </Text>
        <Text style={{ color: course.color, fontWeight: '700' }}>{course.label}</Text>
      </Text>
      <Text style={[s.meta, { color: theme.colors.textMuted }]}><Text style={s.metaKey}>Due: </Text>{task.due}</Text>
      <Text style={[s.meta, { color: theme.colors.textMuted }]}><Text style={s.metaKey}>Type: </Text>{task.type}</Text>

      <TouchableOpacity style={[s.viewBtn, { backgroundColor: course.color }]} onPress={() => onViewDetails(task)}>
        <Text style={[s.viewBtnTxt, { color: '#FFFFFF' }]}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardDone: { opacity: 0.7 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#111827', fontSize: 8, fontWeight: '800' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  overdueBadge: { backgroundColor: '#7F1D1D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  overdueTxt: { color: '#FDECEC', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  daysBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  daysTxt: { color: '#1D4ED8', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  meta: { fontSize: 12, marginBottom: 2 },
  metaKey: { fontWeight: '600' },
  viewBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  viewBtnTxt: { fontWeight: '800', fontSize: 13 },
});
