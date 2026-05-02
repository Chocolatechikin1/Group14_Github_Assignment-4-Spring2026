import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, useWindowDimensions, Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '../../App';
import { COURSES, ExtraBlock, TASKS, TASK_DATES, formatHour } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import Header from '../components/Header';
import AddStudyModal from '../components/modals/AddStudyModal';

// Calendar events are normalized into this display shape before rendering month/week views.
interface Props {
  theme: AppTheme;
  netId: string;
  notifications: AppNotification[];
  onOpenSettings: () => void;
  extraBlocks?: ExtraBlock[];
  addBlock: (block: ExtraBlock) => void;
  updateBlock: (block: ExtraBlock) => void;
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
  typeLabel?: string;
  durationSeconds?: number;
  itemType?: 'study' | 'task';
  blockId?: string;
};
type CalendarView = 'month' | 'week';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

type DropZone = {
  key: string;
  dateISO: string;
  startHour?: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragState = {
  block: ExtraBlock;
  item: MonthItem;
  sourceStartHour: number;
};

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

function dateToISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function weekDates(anchor: Date) {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function longDate(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Seeded tasks and custom blocks become one event list for selection/details.
function taskKind(type: string): MonthItem['kind'] {
  if (type.toLowerCase().includes('exam') || type.toLowerCase().includes('quiz')) return 'exam';
  if (type.toLowerCase().includes('study')) return 'study';
  return 'assignment';
}

function durationText(seconds?: number, startHour?: number, endHour?: number) {
  const totalSeconds = seconds ?? (startHour !== undefined && endHour !== undefined ? Math.max(0, Math.round((endHour - startHour) * 3600)) : 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hr${hours === 1 ? '' : 's'}`);
  if (minutes) parts.push(`${minutes} min`);
  if (remainingSeconds) parts.push(`${remainingSeconds} sec`);
  return parts.length ? parts.join(' ') : '0 min';
}

function hourLabel(hour: number) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function eventsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export default function CalendarScreen({ theme, netId, notifications, onOpenSettings, extraBlocks = [], addBlock, updateBlock }: Props) {
  const shared = useMemo(() => getSharedStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MonthItem | null>(null);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [hoverZone, setHoverZone] = useState<DropZone | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const dragPosition = useRef(new Animated.ValueXY()).current;
  const zoneRefs = useRef<Record<string, any>>({});
  const measuredZones = useRef<DropZone[]>([]);
  const draggingRef = useRef<DragState | null>(null);

  const monthEvents = useMemo<MonthItem[]>(() => {
    const taskEvents = TASKS.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      course: task.course,
      dateISO: TASK_DATES[task.id],
      detail: task.detail,
      kind: taskKind(task.type),
      typeLabel: task.type,
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
        detail: block.notes || (block.itemType === 'task' ? 'Personal task.' : 'Personal study block.'),
        kind: block.itemType === 'task' ? 'assignment' as const : 'personal' as const,
        typeLabel: block.itemType === 'task' ? 'Personal Task' : 'Study Block',
        durationSeconds: block.durationSeconds,
        itemType: block.itemType,
        blockId: block.id,
      }));
    return [...taskEvents, ...blockEvents];
  }, [extraBlocks]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = useMemo(() => monthCells(monthDate), [monthDate]);
  const todayISO = new Date().toISOString().slice(0, 10);
  const selectedEvents = selectedDate ? monthEvents.filter(item => item.dateISO === selectedDate) : [];
  const week = weekDates(monthDate);
  const calendarTitle = viewMode === 'month'
    ? monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : `${week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const selectEvent = (item: MonthItem) => {
    setSelectedDate(item.dateISO);
    setSelectedEvent(item);
  };

  const measureDropZones = () => {
    const entries = Object.entries(zoneRefs.current);
    const nextZones: DropZone[] = [];
    measuredZones.current = [];
    entries.forEach(([key, ref]) => {
      if (!ref?.measureInWindow) return;
      ref.measureInWindow((x: number, y: number, widthValue: number, heightValue: number) => {
        if (!widthValue || !heightValue) return;
        const [dateISO, hourText] = key.split('|');
        nextZones.push({
          key,
          dateISO,
          startHour: hourText === undefined ? undefined : Number(hourText),
          x,
          y,
          width: widthValue,
          height: heightValue,
        });
        measuredZones.current = nextZones;
      });
    });
  };

  const findDropZone = (x: number, y: number) =>
    measuredZones.current.find(zone =>
      x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height
    ) ?? null;

  const hasConflict = (block: ExtraBlock, dateISO: string, startHour: number) => {
    const duration = block.durationSeconds !== undefined
      ? block.durationSeconds / 3600
      : Math.max(block.endHour - block.startHour, 0.25);
    const endHour = Math.min(startHour + duration, 24);
    return extraBlocks.some(other =>
      other.id !== block.id &&
      other.itemType !== 'task' &&
      other.dateISO === dateISO &&
      eventsOverlap(startHour, endHour, other.startHour, other.endHour)
    );
  };

  const finishDrag = (gestureX: number, gestureY: number) => {
    const activeDrag = draggingRef.current;
    if (!activeDrag) return;
    const zone = findDropZone(gestureX, gestureY);
    if (!zone) {
      setWarning('Drop the study block inside the calendar to reschedule it.');
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    const startHour = zone.startHour ?? activeDrag.sourceStartHour;
    if (hasConflict(activeDrag.block, zone.dateISO, startHour)) {
      setWarning('That time overlaps with another study block. Pick an open time slot.');
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    const duration = activeDrag.block.durationSeconds !== undefined
      ? activeDrag.block.durationSeconds / 3600
      : Math.max(activeDrag.block.endHour - activeDrag.block.startHour, 0.25);
    const updatedDate = new Date(`${zone.dateISO}T12:00:00`);
    const updatedBlock: ExtraBlock = {
      ...activeDrag.block,
      dateISO: zone.dateISO,
      dueDateISO: zone.dateISO,
      day: updatedDate.getDay() === 0 ? 7 : updatedDate.getDay(),
      startHour,
      endHour: Math.min(startHour + duration, 24),
    };
    updateBlock(updatedBlock);
    setSelectedDate(zone.dateISO);
    setSelectedEvent({ ...activeDrag.item, dateISO: zone.dateISO, startHour: updatedBlock.startHour, endHour: updatedBlock.endHour });
    setWarning(null);
    draggingRef.current = null;
    setDragging(null);
    setHoverZone(null);
  };

  const makeDragHandlers = (item: MonthItem) => {
    const block = item.blockId ? extraBlocks.find(entry => entry.id === item.blockId) : undefined;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => Boolean(block && block.itemType !== 'task'),
      onMoveShouldSetPanResponder: (_, gesture) => Boolean(block && block.itemType !== 'task' && (Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3)),
      onPanResponderGrant: event => {
        if (!block || block.itemType === 'task') return;
        measureDropZones();
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        const nextDrag = {
          block,
          item,
          sourceStartHour: block.startHour,
        };
        draggingRef.current = nextDrag;
        setDragging(nextDrag);
        setWarning(null);
      },
      onPanResponderMove: event => {
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        setHoverZone(findDropZone(event.nativeEvent.pageX, event.nativeEvent.pageY));
      },
      onPanResponderRelease: event => finishDrag(event.nativeEvent.pageX, event.nativeEvent.pageY),
      onPanResponderTerminate: () => {
        draggingRef.current = null;
        setDragging(null);
        setHoverZone(null);
      },
    }).panHandlers;
  };

  const goToday = () => {
    const today = new Date();
    setMonthDate(today);
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  const moveBackward = () => {
    setMonthDate(current => {
      const next = new Date(current);
      if (viewMode === 'week') {
        next.setDate(current.getDate() - 7);
        return next;
      }
      return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    });
  };

  const moveForward = () => {
    setMonthDate(current => {
      const next = new Date(current);
      if (viewMode === 'week') {
        next.setDate(current.getDate() + 7);
        return next;
      }
      return new Date(current.getFullYear(), current.getMonth() + 1, 1);
    });
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
                  {calendarTitle}
                </Text>
                <View style={s.monthControls}>
                  <TouchableOpacity onPress={moveBackward}>
                    <Ionicons name="chevron-back" size={16} color={theme.colors.textSoft} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={goToday}>
                    <Text style={[s.todayLabel, { color: theme.colors.textMuted }]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={moveForward}>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSoft} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[s.viewSwitch, { backgroundColor: theme.colors.surfaceMuted }]}>
                {(['month', 'week'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[s.viewSwitchBtn, viewMode === mode && { backgroundColor: theme.colors.accent }]}
                    onPress={() => setViewMode(mode)}
                  >
                    <Text style={[s.viewSwitchText, { color: viewMode === mode ? '#111827' : theme.colors.textMuted }]}>
                      {mode === 'month' ? 'Monthly' : 'Weekly'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {warning ? (
                <View style={[s.warningBanner, { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning }]}>
                  <Ionicons name="alert-circle-outline" size={16} color={theme.colors.warning} />
                  <Text style={[s.warningText, { color: theme.colors.warning }]}>{warning}</Text>
                </View>
              ) : null}

              {viewMode === 'month' ? (
                <>
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
                      const isDropHover = Boolean(hoverZone && hoverZone.key === dateISO);
                      return (
                        <TouchableOpacity
                          key={`${date ?? 'empty'}-${index}`}
                          ref={ref => {
                            if (date) zoneRefs.current[dateISO] = ref;
                          }}
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
                            isDropHover && s.dropHover,
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
                                  {...makeDragHandlers(item)}
                                  style={[
                                    s.eventPill,
                                    { backgroundColor: `${eventColor(item)}28` },
                                    dragging?.item.id === item.id && s.dragSource,
                                  ]}
                                  onPress={() => selectEvent(item)}
                                >
                                  <Text numberOfLines={1} style={[s.eventPillText, { color: eventColor(item) }]}>{item.title}</Text>
                                </TouchableOpacity>
                              ))}
                              {isDropHover && dragging ? (
                                <View style={[s.ghostPill, { borderColor: eventColor(dragging.item) }]}>
                                  <Text numberOfLines={1} style={[s.eventPillText, { color: eventColor(dragging.item) }]}>{dragging.item.title}</Text>
                                </View>
                              ) : null}
                            </>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : (
                <View style={[s.weekView, { borderColor: theme.colors.border }]}>
                  <View style={[s.weekHeaderRow, { borderColor: theme.colors.border }]}>
                    <View style={s.timeGutter} />
                    {week.map(date => {
                      const dateISO = dateToISO(date);
                      return (
                        <View key={dateISO} style={[s.weekHeaderCell, { borderColor: theme.colors.border }]}>
                          <Text style={[s.weekDayName, { color: theme.colors.textMuted }]}>{date.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
                          <Text style={[s.weekDayNum, { color: dateISO === todayISO ? '#EF4444' : theme.colors.text }]}>{date.getDate()}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={[s.allDayRow, { borderColor: theme.colors.border }]}>
                    <Text style={[s.timeLabel, { color: theme.colors.textMuted }]}>All day</Text>
                    {week.map(date => {
                      const dateISO = dateToISO(date);
                      const allDayItems = monthEvents.filter(item => item.dateISO === dateISO && (item.itemType === 'task' || item.startHour === undefined));
                      return (
                        <View key={`all-${dateISO}`} style={[s.allDayCell, { borderColor: theme.colors.border }]}>
                          {allDayItems.slice(0, 2).map(item => (
                            <TouchableOpacity key={item.id} style={[s.weekEventBlock, { backgroundColor: `${eventColor(item)}28` }]} onPress={() => selectEvent(item)}>
                              <Text numberOfLines={1} style={[s.weekEventTitle, { color: eventColor(item) }]}>{item.title}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    })}
                  </View>

                  {DAY_HOURS.map(hour => (
                    <View key={hour} style={[s.hourRow, { borderColor: theme.colors.border }]}>
                      <Text style={[s.timeLabel, { color: theme.colors.textMuted }]}>{hourLabel(hour)}</Text>
                      {week.map(date => {
                        const dateISO = dateToISO(date);
                        const zoneKey = `${dateISO}|${hour}`;
                        const slotItems = monthEvents.filter(item =>
                          item.dateISO === dateISO &&
                          item.itemType !== 'task' &&
                          item.startHour !== undefined &&
                          Math.floor(item.startHour) === hour
                        );
                        const isDropHover = Boolean(hoverZone && hoverZone.key === zoneKey);
                        return (
                          <View
                            key={zoneKey}
                            ref={ref => {
                              zoneRefs.current[zoneKey] = ref;
                            }}
                            style={[
                              s.hourSlot,
                              { borderColor: theme.colors.border },
                              isDropHover && s.dropHover,
                            ]}
                          >
                            {slotItems.map(item => (
                              <TouchableOpacity
                                key={item.id}
                                {...makeDragHandlers(item)}
                                style={[
                                  s.weekEventBlock,
                                  { backgroundColor: `${eventColor(item)}28` },
                                  dragging?.item.id === item.id && s.dragSource,
                                ]}
                                onPress={() => selectEvent(item)}
                              >
                                <Text numberOfLines={1} style={[s.weekEventTitle, { color: eventColor(item) }]}>{item.title}</Text>
                                <Text style={[s.weekEventMeta, { color: theme.colors.textMuted }]}>
                                  {formatHour(item.startHour ?? hour)} - {formatHour(item.endHour ?? item.startHour ?? hour)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                            {isDropHover && dragging ? (
                              <View style={[s.ghostBlock, { borderColor: eventColor(dragging.item) }]}>
                                <Text numberOfLines={1} style={[s.weekEventTitle, { color: eventColor(dragging.item) }]}>{dragging.item.title}</Text>
                                <Text style={[s.weekEventMeta, { color: theme.colors.textMuted }]}>{hourLabel(hour)}</Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}

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
                  <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Type: {selectedEvent.typeLabel ?? selectedEvent.kind}</Text>
                  <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Course: {COURSES[selectedEvent.course]?.label}</Text>
                  <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Due Date: {longDate(selectedEvent.dateISO)}</Text>
                  {selectedEvent.itemType !== 'task' && selectedEvent.startHour !== undefined && selectedEvent.endHour !== undefined ? (
                    <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Study Time: {formatHour(selectedEvent.startHour)} - {formatHour(selectedEvent.endHour)}</Text>
                  ) : null}
                  {selectedEvent.itemType !== 'task' && selectedEvent.startHour !== undefined && selectedEvent.endHour !== undefined ? (
                    <Text style={[s.selectedLine, { color: theme.colors.textMuted }]}>Duration: {durationText(selectedEvent.durationSeconds, selectedEvent.startHour, selectedEvent.endHour)}</Text>
                  ) : null}
                  <Text style={[s.descriptionLabel, { color: theme.colors.text }]}>Description</Text>
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
                <Text style={s.primaryText}>+ Create Study Block or Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {dragging ? (
        <Animated.View pointerEvents="none" style={[s.dragGhost, { transform: dragPosition.getTranslateTransform(), borderColor: eventColor(dragging.item), backgroundColor: theme.colors.surface }]}>
          <Text numberOfLines={1} style={[s.dragGhostTitle, { color: eventColor(dragging.item) }]}>{dragging.item.title}</Text>
          <Text style={[s.dragGhostMeta, { color: theme.colors.textMuted }]}>
            {hoverZone ? `${longDate(hoverZone.dateISO)}${hoverZone.startHour !== undefined ? ` at ${hourLabel(hoverZone.startHour)}` : ''}` : 'Drop inside the calendar'}
          </Text>
        </Animated.View>
      ) : null}

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
  viewSwitch: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: 8, padding: 4, marginBottom: 14 },
  viewSwitchBtn: { borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  viewSwitchText: { fontSize: 12, fontWeight: '900' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12 },
  warningText: { flex: 1, fontSize: 12, fontWeight: '800' },
  weekRow: { flexDirection: 'row', borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6, overflow: 'hidden' },
  weekText: { flex: 1, textAlign: 'center', paddingVertical: 10, fontSize: 11, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderLeftWidth: 1, borderTopWidth: 1 },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1.18, borderRightWidth: 1, borderBottomWidth: 1, padding: 8, gap: 6 },
  dateBadge: { alignSelf: 'flex-start', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: 12, fontWeight: '800' },
  eventPill: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  eventPillText: { fontSize: 10, fontWeight: '800' },
  ghostPill: { borderRadius: 4, borderWidth: 1.5, borderStyle: 'dashed', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(168,85,247,0.08)' },
  weekView: { borderTopWidth: 1, borderLeftWidth: 1, minHeight: 720 },
  weekHeaderRow: { flexDirection: 'row', borderBottomWidth: 1 },
  weekHeaderCell: { flex: 1, borderRightWidth: 1, paddingVertical: 8, alignItems: 'center' },
  allDayRow: { flexDirection: 'row', minHeight: 54, borderBottomWidth: 1 },
  allDayCell: { flex: 1, borderRightWidth: 1, padding: 5, gap: 4 },
  hourRow: { flexDirection: 'row', minHeight: 58, borderBottomWidth: 1 },
  timeGutter: { width: 58 },
  timeLabel: { width: 58, paddingTop: 8, paddingRight: 8, textAlign: 'right', fontSize: 10, fontWeight: '800' },
  hourSlot: { flex: 1, borderRightWidth: 1, padding: 4, gap: 4 },
  dropHover: { backgroundColor: 'rgba(212,166,58,0.18)', borderColor: '#D4A63A' },
  dragSource: { opacity: 0.38 },
  weekDayName: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  weekDayNum: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  weekEventBlock: { borderRadius: 6, padding: 6 },
  weekEventTitle: { fontSize: 11, fontWeight: '900' },
  weekEventMeta: { fontSize: 9, fontWeight: '700', marginTop: 3 },
  ghostBlock: { borderRadius: 6, borderWidth: 1.5, borderStyle: 'dashed', padding: 6, backgroundColor: 'rgba(168,85,247,0.08)' },
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
  descriptionLabel: { fontSize: 12, fontWeight: '900', marginTop: 10, marginBottom: 4 },
  selectedDetail: { fontSize: 12, lineHeight: 19, marginTop: 2 },
  primaryBtn: { width: '100%', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryText: { color: 'white', fontSize: 12, fontWeight: '900' },
  dragGhost: { position: 'absolute', left: 0, top: 0, width: 180, borderWidth: 2, borderRadius: 8, padding: 10, opacity: 0.92, zIndex: 50 },
  dragGhostTitle: { fontSize: 12, fontWeight: '900' },
  dragGhostMeta: { fontSize: 10, fontWeight: '700', marginTop: 3 },
});
