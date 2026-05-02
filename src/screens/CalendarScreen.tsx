import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '../../App';
import { CAL_EVENTS, CalEvent, COURSES, ExtraBlock, extraBlockToCalEvent, formatHour } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';
import EventDetailModal from '../components/modals/EventDetailModal';

interface Props {
  theme: AppTheme;
  netId: string;
  notifications: AppNotification[];
  onOpenSettings: () => void;
  extraBlocks?: ExtraBlock[];
}

interface MonthItem extends CalEvent {
  date: number;
  kind: 'assignment' | 'study' | 'exam' | 'personal';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_IN_MARCH = 31;
const FIRST_DAY_OFFSET = 0;

const BASE_MONTH_EVENTS: MonthItem[] = [
  { id: 'm1', title: 'Quiz', course: 'CS', date: 9, startHour: 11, endHour: 11.5, detail: 'CS quiz due in eLearning.', kind: 'exam', day: 1 },
  { id: 'm2', title: 'Study Session', course: 'SELF', date: 10, startHour: 15, endHour: 16, detail: 'Review physics chapters 3-5.', kind: 'study', day: 2 },
  { id: 'm3', title: 'Study Group', course: 'SELF', date: 11, startHour: 17, endHour: 18, detail: 'Group review for CS project planning.', kind: 'personal', day: 3 },
  { id: 'm4', title: 'Essay Due', course: 'MATH', date: 12, startHour: 10, endHour: 11.5, detail: 'Calculus exam review block.', kind: 'assignment', day: 4 },
  { id: 'm5', title: 'Lab Report', course: 'PHY', date: 13, startHour: 14, endHour: 14.5, detail: 'Submit the physics lab report.', kind: 'assignment', day: 5 },
  { id: 'm6', title: 'Review Session', course: 'SELF', date: 14, startHour: 10, endHour: 12, detail: 'Weekend study review.', kind: 'study', day: 6 },
  { id: 'm7', title: 'Midterm Exam', course: 'CS', date: 15, startHour: 9, endHour: 11, detail: 'CS 3354 midterm exam.', kind: 'exam', day: 7 },
  { id: 'm8', title: 'Project Presentation', course: 'PHY', date: 16, startHour: 13, endHour: 14, detail: 'Project presentation prep.', kind: 'assignment', day: 1 },
];

function eventColor(item: MonthItem) {
  if (item.kind === 'exam') return '#EF4444';
  if (item.kind === 'study') return '#22C55E';
  if (item.kind === 'personal') return '#A855F7';
  return COURSES[item.course]?.color ?? '#3B82F6';
}

function buildCells() {
  const cells: (number | null)[] = Array.from({ length: FIRST_DAY_OFFSET }, () => null);
  for (let day = 1; day <= DAYS_IN_MARCH; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarScreen({ theme, netId, notifications, onOpenSettings, extraBlocks = [] }: Props) {
  const shared = useMemo(() => getSharedStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  const monthEvents = useMemo<MonthItem[]>(() => {
    const converted = extraBlocks.map(block => ({
      ...extraBlockToCalEvent(block),
      date: 8 + block.day,
      kind: 'personal' as const,
    }));
    return [...BASE_MONTH_EVENTS, ...converted];
  }, [extraBlocks]);

  const cells = useMemo(buildCells, []);
  const selectedEvents = selectedDate ? monthEvents.filter(item => item.date === selectedDate) : [];

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={netId} theme={theme} notifications={notifications} onProfilePress={onOpenSettings} />

      <View style={[shared.body, { backgroundColor: theme.colors.body }]}>
        <ScrollView contentContainerStyle={[s.pagePad, isWide && s.pagePadWide]} showsVerticalScrollIndicator={false}>
          <View style={[s.shell, isWide && s.shellWide]}>
            <View style={[s.calendarCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={s.monthHeader}>
                <Text style={[s.monthTitle, { color: theme.colors.text }]}>March 2026</Text>
                <View style={s.monthControls}>
                  <Ionicons name="chevron-back" size={16} color={theme.colors.textSoft} />
                  <Text style={[s.todayLabel, { color: theme.colors.textMuted }]}>Today</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textSoft} />
                </View>
              </View>

              <View style={[s.weekRow, { borderColor: theme.colors.border }]}>
                {WEEKDAYS.map(day => (
                  <Text key={day} style={[s.weekText, { color: theme.colors.textMuted }]}>{day}</Text>
                ))}
              </View>

              <View style={[s.grid, { borderColor: theme.colors.border }]}>
                {cells.map((date, index) => {
                  const items = date ? monthEvents.filter(item => item.date === date) : [];
                  const isSelected = date === selectedDate;
                  const isToday = date === 7;
                  return (
                    <TouchableOpacity
                      key={`${date ?? 'empty'}-${index}`}
                      activeOpacity={date ? 0.78 : 1}
                      disabled={!date}
                      onPress={() => setSelectedDate(date)}
                      style={[
                        s.dayCell,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                        !date && { backgroundColor: theme.colors.surfaceMuted },
                        isSelected && { borderColor: theme.colors.accent, borderWidth: 2 },
                      ]}
                    >
                      {date ? (
                        <>
                          <View style={[s.dateBadge, isToday && { backgroundColor: '#EF4444' }]}>
                            <Text style={[s.dateText, { color: isToday ? 'white' : theme.colors.textMuted }]}>{date}</Text>
                          </View>
                          {items.slice(0, 3).map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={[s.eventPill, { backgroundColor: `${eventColor(item)}28` }]}
                              onPress={() => setSelectedEvent(item)}
                            >
                              <Text numberOfLines={1} style={[s.eventPillText, { color: eventColor(item) }]}>{item.title}</Text>
                            </TouchableOpacity>
                          ))}
                        </>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={s.legendRow}>
                <Legend color="#3B82F6" label="Assignments" theme={theme} />
                <Legend color="#22C55E" label="AI Study Sessions" theme={theme} />
                <Legend color="#EF4444" label="Exams" theme={theme} />
                <Legend color="#A855F7" label="Personal Tasks" theme={theme} />
              </View>
            </View>

            <View style={[s.sidePanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[s.sideIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.textSoft} />
              </View>
              <Text style={[s.sideTitle, { color: theme.colors.text }]}>
                {selectedDate ? `March ${selectedDate}` : 'No Event Selected'}
              </Text>
              <Text style={[s.sideSub, { color: theme.colors.textMuted }]}>
                {selectedDate ? `${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'} scheduled` : 'Click on an event in the calendar to view details'}
              </Text>

              {selectedEvents.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.detailRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}
                  onPress={() => setSelectedEvent(item)}
                >
                  <View style={[s.detailDot, { backgroundColor: eventColor(item) }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.detailTitle, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[s.detailTime, { color: theme.colors.textMuted }]}>{formatHour(item.startHour)} - {formatHour(item.endHour)}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#EF0000' }]}>
                <Text style={s.primaryText}>+ Add Personal Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.secondaryBtn, { borderColor: '#EF0000' }]}>
                <Text style={s.secondaryText}>Import AI Study Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </SafeAreaView>
  );
}

function Legend({ color, label, theme }: { color: string; label: string; theme: AppTheme }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={[s.legendText, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pagePad: { padding: 14, paddingBottom: 28 },
  pagePadWide: { padding: 24 },
  shell: { gap: 16 },
  shellWide: { flexDirection: 'row', alignItems: 'stretch', maxWidth: 1320, width: '100%', alignSelf: 'center' },
  calendarCard: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 16 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthTitle: { fontSize: 24, fontWeight: '900' },
  monthControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  todayLabel: { fontSize: 12, fontWeight: '800' },
  weekRow: { flexDirection: 'row', borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6, overflow: 'hidden' },
  weekText: { flex: 1, textAlign: 'center', paddingVertical: 10, fontSize: 11, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderLeftWidth: 1, borderTopWidth: 1 },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1.18, borderRightWidth: 1, borderBottomWidth: 1, padding: 8, gap: 6 },
  dateBadge: { alignSelf: 'flex-start', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: 12, fontWeight: '800' },
  eventPill: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  eventPillText: { fontSize: 10, fontWeight: '800' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, fontWeight: '700' },
  sidePanel: { width: 320, borderRadius: 8, borderWidth: 1, padding: 22, alignItems: 'center', justifyContent: 'center' },
  sideIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sideTitle: { fontSize: 15, fontWeight: '900', textAlign: 'center' },
  sideSub: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  detailRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  detailDot: { width: 9, height: 9, borderRadius: 5 },
  detailTitle: { fontSize: 12, fontWeight: '800' },
  detailTime: { fontSize: 10, marginTop: 2 },
  primaryBtn: { width: '100%', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryText: { color: 'white', fontSize: 12, fontWeight: '900' },
  secondaryBtn: { width: '100%', borderRadius: 8, paddingVertical: 11, alignItems: 'center', marginTop: 10, borderWidth: 1.5 },
  secondaryText: { color: '#EF0000', fontSize: 12, fontWeight: '900' },
});
