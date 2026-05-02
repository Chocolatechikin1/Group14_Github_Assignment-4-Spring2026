import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '../../App';
import { COURSES, ExtraBlock, TASKS, TASK_DATES, formatHour } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';
import AddStudyModal from '../components/modals/AddStudyModal';

interface Props {
  theme: AppTheme;
  netId: string;
  notifications: AppNotification[];
  onOpenSettings: () => void;
  extraBlocks?: ExtraBlock[];
  addBlock: (block: ExtraBlock) => void;
}

type MonthItem = {
  id: string;
  title: string;
  course: keyof typeof COURSES;
  dateISO: string;
  startHour?: number;
  endHour?: number;
  detail: string;
  kind: 'assignment' | 'study' | 'exam' | 'personal';
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function eventColor(item: MonthItem) {
  if (item.kind === 'exam') return '#EF4444';
  if (item.kind === 'study') return '#22C55E';
  if (item.kind === 'personal') return '#A855F7';
  return COURSES[item.course]?.color ?? '#3B82F6';
}

function monthCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function longDate(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function taskKind(type: string): MonthItem['kind'] {
  if (type.toLowerCase().includes('exam') || type.toLowerCase().includes('quiz')) return 'exam';
  if (type.toLowerCase().includes('study')) return 'study';
  return 'assignment';
}

export default function CalendarScreen({ theme, netId, notifications, onOpenSettings, extraBlocks = [], addBlock }: Props) {
  const shared = useMemo(() => getSharedStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MonthItem | null>(null);
  const [showAddStudy, setShowAddStudy] = useState(false);

  const monthEvents = useMemo<MonthItem[]>(() => {
    const taskEvents = TASKS.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      course: task.course,
      dateISO: TASK_DATES[task.id],
      detail: task.detail,
      kind: taskKind(task.type),
    }));
    const blockEvents = extraBlocks
      .filter(block => block.dateISO)
      .map(block => ({
        id: `block-${block.id}`,
        title: block.title,
        course: block.course,
        dateISO: block.dateISO as string,
        startHour: block.startHour,
        endHour: block.endHour,
        detail: block.notes || 'Personal study block.',
        kind: 'personal' as const,
      }));
    return [...taskEvents, ...blockEvents];
  }, [extraBlocks]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = useMemo(() => monthCells(monthDate), [monthDate]);
  const todayISO = new Date().toISOString().slice(0, 10);
  const selectedEvents = selectedDate ? monthEvents.filter(item => item.dateISO === selectedDate) : [];

  const selectEvent = (item: MonthItem) => {
    setSelectedDate(item.dateISO);
    setSelectedEvent(item);
  };

  const goToday = () => {
    const today = new Date();
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={netId} theme={theme} notifications={notifications} onProfilePress={onOpenSettings} />

      <View style={[shared.body, { backgroundColor: theme.colors.body }]}>
        <ScrollView contentContainerStyle={[s.pagePad, isWide && s.pagePadWide]} showsVerticalScrollIndicator={false}>
          <View style={[s.shell, isWide && s.shellWide]}>
            <View style={[s.calendarCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={s.monthHeader}>
                <Text style={[s.monthTitle, { color: theme.colors.text }]}>
                  {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </Text>
                <View style={s.monthControls}>
                  <TouchableOpacity onPress={() => setMonthDate(new Date(year, month - 1, 1))}>
                    <Ionicons name="chevron-back" size={16} color={theme.colors.textSoft} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={goToday}>
                    <Text style={[s.todayLabel, { color: theme.colors.textMuted }]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMonthDate(new Date(year, month + 1, 1))}>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSoft} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[s.weekRow, { borderColor: theme.colors.border }]}>
                {WEEKDAYS.map(day => (
                  <Text key={day} style={[s.weekText, { color: theme.colors.textMuted }]}>{day}</Text>
                ))}
              </View>

              <View style={[s.grid, { borderColor: theme.colors.border }]}>
                {cells.map((date, index) => {
                  const dateISO = date ? toISO(year, month, date) : '';
                  const items = date ? monthEvents.filter(item => item.dateISO === dateISO) : [];
                  const isSelected = dateISO === selectedDate;
                  const isToday = dateISO === todayISO;
                  return (
                    <TouchableOpacity
                      key={`${date ?? 'empty'}-${index}`}
                      activeOpacity={date ? 0.78 : 1}
                      disabled={!date}
                      onPress={() => {
                        setSelectedDate(dateISO);
                        setSelectedEvent(items[0] ?? null);
                      }}
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
                            <TouchableOpacity key={item.id} style={[s.eventPill, { backgroundColor: `${eventColor(item)}28` }]} onPress={() => selectEvent(item)}>
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
                <Legend color="#22C55E" label="Study Sessions" theme={theme} />
                <Legend color="#EF4444" label="Exams" theme={theme} />
                <Legend color="#A855F7" label="Personal Tasks" theme={theme} />
              </View>
            </View>

            <View style={[s.sidePanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[s.sideIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.textSoft} />
              </View>
              <Text style={[s.sideTitle, { color: theme.colors.text }]}>
                {selectedEvent ? selectedEvent.title : selectedDate ? longDate(selectedDate) : 'Event Details'}
              </Text>
              <Text style={[s.sideSub, { color: theme.colors.textMuted }]}>
                {selectedEvent ? longDate(selectedEvent.dateISO) : 'Click an event in the calendar to view details here.'}
              </Text>

              {selectedEvent ? (
                <View style={[s.selectedCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}>
                  <View style={[s.detailDot, { backgroundColor: eventColor(selectedEvent) }]} />
                  <Text style={[s.selectedTitle, { color: theme.colors.text }]}>{selectedEvent.title}</Text>
                  <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Course: {COURSES[selectedEvent.course]?.label}</Text>
                  <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Date: {longDate(selectedEvent.dateISO)}</Text>
                  {selectedEvent.startHour !== undefined && selectedEvent.endHour !== undefined ? (
                    <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Time: {formatHour(selectedEvent.startHour)} - {formatHour(selectedEvent.endHour)}</Text>
                  ) : null}
                  <Text style={[s.selectedDetail, { color: theme.colors.text }]}>{selectedEvent.detail}</Text>
                </View>
              ) : selectedEvents.length > 0 ? (
                selectedEvents.map(item => (
                  <TouchableOpacity key={item.id} style={[s.detailRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]} onPress={() => selectEvent(item)}>
                    <View style={[s.detailDot, { backgroundColor: eventColor(item) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.detailTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[s.detailTime, { color: theme.colors.textMuted }]}>{item.startHour !== undefined ? `${formatHour(item.startHour)} - ${formatHour(item.endHour ?? item.startHour)}` : item.kind}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : null}

              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#EF0000' }]} onPress={() => setShowAddStudy(true)}>
                <Text style={s.primaryText}>+ Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <AddStudyModal visible={showAddStudy} onClose={() => setShowAddStudy(false)} onAdd={addBlock} />
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
  detailDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 8 },
  detailTitle: { fontSize: 12, fontWeight: '800' },
  detailTime: { fontSize: 10, marginTop: 2 },
  selectedCard: { width: '100%', borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 14 },
  selectedTitle: { fontSize: 15, fontWeight: '900', marginBottom: 8 },
  selectedLine: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  selectedDetail: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  primaryBtn: { width: '100%', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryText: { color: 'white', fontSize: 12, fontWeight: '900' },
});
