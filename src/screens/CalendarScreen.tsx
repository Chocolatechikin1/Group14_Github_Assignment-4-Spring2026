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
const HOUR_HEIGHT = 58;
const TIME_GUTTER = 58;
const MIN_DURATION_HOURS = 0.25;

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
  mode: 'move' | 'resize' | 'task-date';
};

type WeekLayout = { x: number; y: number; width: number; height: number };

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundToQuarterHour(value: number) {
  return Math.round(value * 4) / 4;
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
  const weekGridRef = useRef<any>(null);
  const allDayRef = useRef<any>(null);
  const weekLayout = useRef<WeekLayout | null>(null);
  const allDayLayout = useRef<WeekLayout | null>(null);
  const dragOffsetHours = useRef(0);

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
  const weekDateISOs = week.map(dateToISO);
  const weekTimedBlocks = extraBlocks.filter(block =>
    block.itemType !== 'task' &&
    Boolean(block.dateISO) &&
    weekDateISOs.includes(block.dateISO as string)
  );
  const weekTaskBlocks = extraBlocks.filter(block =>
    block.itemType === 'task' &&
    Boolean(block.dateISO) &&
    weekDateISOs.includes(block.dateISO as string)
  );
  const weekAllDaySeededEvents = monthEvents.filter(item =>
    !item.blockId &&
    weekDateISOs.includes(item.dateISO)
  );
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

  const measureWeekGrid = () => {
    weekGridRef.current?.measureInWindow?.((x: number, y: number, widthValue: number, heightValue: number) => {
      weekLayout.current = { x, y, width: widthValue, height: heightValue };
    });
    allDayRef.current?.measureInWindow?.((x: number, y: number, widthValue: number, heightValue: number) => {
      allDayLayout.current = { x, y, width: widthValue, height: heightValue };
    });
  };

  const hasConflict = (block: ExtraBlock, dateISO: string, startHour: number, endHour: number) =>
    extraBlocks.some(other =>
      other.id !== block.id &&
      other.itemType !== 'task' &&
      other.dateISO === dateISO &&
      eventsOverlap(startHour, endHour, other.startHour, other.endHour)
    );

  const dropDateFromLayout = (layout: WeekLayout | null, pageX: number) => {
    if (!layout || pageX < layout.x + TIME_GUTTER || pageX > layout.x + layout.width) return null;
    const dayWidth = (layout.width - TIME_GUTTER) / 7;
    const dayIndex = Math.floor((pageX - layout.x - TIME_GUTTER) / dayWidth);
    if (dayIndex < 0 || dayIndex > 6) return null;
    return dateToISO(week[dayIndex]);
  };

  const dropTimeFromLayout = (layout: WeekLayout | null, pageY: number, offsetHours = 0) => {
    if (!layout || pageY < layout.y || pageY > layout.y + layout.height) return null;
    return clamp(roundToQuarterHour((pageY - layout.y) / HOUR_HEIGHT - offsetHours), 0, 23.75);
  };

  const customBlockEvent = (block: ExtraBlock): MonthItem => ({
    id: `block-${block.id}`,
    title: block.title,
    course: block.course,
    dateISO: block.dateISO ?? block.dueDateISO ?? todayISO,
    startHour: block.startHour,
    endHour: block.endHour,
    detail: block.notes || (block.itemType === 'task' ? 'Personal task.' : 'Personal study block.'),
    kind: block.itemType === 'task' ? 'assignment' : 'personal',
    typeLabel: block.itemType === 'task' ? 'Personal Task' : 'Study Block',
    durationSeconds: block.durationSeconds,
    itemType: block.itemType,
    blockId: block.id,
  });

  const updateScheduledBlock = (block: ExtraBlock, dateISO: string, startHour: number, endHour: number, item: MonthItem) => {
    if (hasConflict(block, dateISO, startHour, endHour)) {
      setWarning('That time overlaps with another study block. Pick an open time slot.');
      return false;
    }
    const updatedDate = new Date(`${dateISO}T12:00:00`);
    const updatedBlock: ExtraBlock = {
      ...block,
      dateISO,
      dueDateISO: dateISO,
      day: updatedDate.getDay() === 0 ? 7 : updatedDate.getDay(),
      startHour,
      endHour,
      durationSeconds: Math.max(MIN_DURATION_HOURS, endHour - startHour) * 3600,
    };
    updateBlock(updatedBlock);
    setSelectedDate(dateISO);
    setSelectedEvent({ ...item, dateISO, startHour, endHour, durationSeconds: updatedBlock.durationSeconds });
    setWarning(null);
    return true;
  };

  const updateTaskDate = (block: ExtraBlock, dateISO: string, item: MonthItem) => {
    const updatedDate = new Date(`${dateISO}T12:00:00`);
    const updatedBlock: ExtraBlock = {
      ...block,
      dateISO,
      dueDateISO: dateISO,
      day: updatedDate.getDay() === 0 ? 7 : updatedDate.getDay(),
    };
    updateBlock(updatedBlock);
    setSelectedDate(dateISO);
    setSelectedEvent({ ...item, dateISO });
    setWarning(null);
    return true;
  };

  const hasMonthConflict = (block: ExtraBlock, dateISO: string, startHour: number) => {
    const duration = block.durationSeconds !== undefined
      ? block.durationSeconds / 3600
      : Math.max(block.endHour - block.startHour, MIN_DURATION_HOURS);
    const endHour = Math.min(startHour + duration, 24);
    return extraBlocks.some(other =>
      other.id !== block.id &&
      other.itemType !== 'task' &&
      other.dateISO === dateISO &&
      eventsOverlap(startHour, endHour, other.startHour, other.endHour)
    );
  };

  const finishMonthDrag = (gestureX: number, gestureY: number) => {
    const activeDrag = draggingRef.current;
    if (!activeDrag) return;
    const zone = findDropZone(gestureX, gestureY);
    if (!zone) {
      setWarning('Drop the custom item inside the calendar to reschedule it.');
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    if (activeDrag.block.itemType === 'task') {
      updateTaskDate(activeDrag.block, zone.dateISO, activeDrag.item);
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    const startHour = zone.startHour ?? activeDrag.sourceStartHour;
    if (hasMonthConflict(activeDrag.block, zone.dateISO, startHour)) {
      setWarning('That time overlaps with another study block. Pick an open time slot.');
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    const duration = activeDrag.block.durationSeconds !== undefined
      ? activeDrag.block.durationSeconds / 3600
      : Math.max(activeDrag.block.endHour - activeDrag.block.startHour, MIN_DURATION_HOURS);
    updateScheduledBlock(activeDrag.block, zone.dateISO, startHour, Math.min(startHour + duration, 24), activeDrag.item);
    draggingRef.current = null;
    setDragging(null);
    setHoverZone(null);
  };

  const makeMonthDragHandlers = (item: MonthItem) => {
    const block = item.blockId ? extraBlocks.find(entry => entry.id === item.blockId) : undefined;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => Boolean(block),
      onMoveShouldSetPanResponder: (_, gesture) => Boolean(block && (Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3)),
      onPanResponderGrant: event => {
        if (!block) return;
        measureDropZones();
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        const nextDrag = {
          block,
          item,
          sourceStartHour: block.startHour,
          mode: block.itemType === 'task' ? 'task-date' as const : 'move' as const,
        };
        draggingRef.current = nextDrag;
        setDragging(nextDrag);
        setWarning(null);
      },
      onPanResponderMove: event => {
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        setHoverZone(findDropZone(event.nativeEvent.pageX, event.nativeEvent.pageY));
      },
      onPanResponderRelease: event => finishMonthDrag(event.nativeEvent.pageX, event.nativeEvent.pageY),
      onPanResponderTerminate: () => {
        draggingRef.current = null;
        setDragging(null);
        setHoverZone(null);
      },
    }).panHandlers;
  };

  const finishWeekMove = (gestureX: number, gestureY: number) => {
    const activeDrag = draggingRef.current;
    if (!activeDrag) return;
    const dateISO = activeDrag.mode === 'task-date'
      ? dropDateFromLayout(allDayLayout.current, gestureX)
      : dropDateFromLayout(weekLayout.current, gestureX);

    if (!dateISO) {
      setWarning('Drop the custom item inside the week calendar to reschedule it.');
      draggingRef.current = null;
      setDragging(null);
      setHoverZone(null);
      return;
    }

    if (activeDrag.mode === 'task-date') {
      updateTaskDate(activeDrag.block, dateISO, activeDrag.item);
    } else {
      const startHour = dropTimeFromLayout(weekLayout.current, gestureY, dragOffsetHours.current);
      if (startHour === null) {
        setWarning('Drop the study block on a valid time slot.');
      } else {
        const duration = activeDrag.block.durationSeconds !== undefined
          ? activeDrag.block.durationSeconds / 3600
          : Math.max(activeDrag.block.endHour - activeDrag.block.startHour, MIN_DURATION_HOURS);
        updateScheduledBlock(activeDrag.block, dateISO, startHour, Math.min(startHour + duration, 24), activeDrag.item);
      }
    }
    draggingRef.current = null;
    setDragging(null);
    setHoverZone(null);
  };

  const finishWeekResize = (gestureY: number) => {
    const activeDrag = draggingRef.current;
    if (!activeDrag) return;
    const layout = weekLayout.current;
    if (!layout) {
      setWarning('Resize inside the week calendar grid.');
    } else {
      const rawEndHour = roundToQuarterHour((gestureY - layout.y) / HOUR_HEIGHT);
      const endHour = clamp(rawEndHour, activeDrag.block.startHour + MIN_DURATION_HOURS, 24);
      updateScheduledBlock(activeDrag.block, activeDrag.block.dateISO ?? activeDrag.item.dateISO, activeDrag.block.startHour, endHour, activeDrag.item);
    }
    draggingRef.current = null;
    setDragging(null);
    setHoverZone(null);
  };

  const makeWeekMoveHandlers = (block: ExtraBlock, item: MonthItem, mode: DragState['mode']) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        measureWeekGrid();
        const nextDrag = { block, item, sourceStartHour: block.startHour, mode };
        selectEvent(item);
        draggingRef.current = nextDrag;
        setDragging(nextDrag);
        setWarning(null);
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        if (mode === 'move') {
          dragOffsetHours.current = Math.max(0, (event.nativeEvent.pageY - (weekLayout.current?.y ?? event.nativeEvent.pageY)) / HOUR_HEIGHT - block.startHour);
        }
      },
      onPanResponderMove: event => {
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
        const layout = mode === 'task-date' ? allDayLayout.current : weekLayout.current;
        const dateISO = dropDateFromLayout(layout, event.nativeEvent.pageX);
        const startHour = mode === 'task-date' ? undefined : dropTimeFromLayout(weekLayout.current, event.nativeEvent.pageY, dragOffsetHours.current) ?? undefined;
        setHoverZone(dateISO ? { key: startHour === undefined ? dateISO : `${dateISO}|${Math.floor(startHour)}`, dateISO, startHour, x: 0, y: 0, width: 0, height: 0 } : null);
      },
      onPanResponderRelease: event => finishWeekMove(event.nativeEvent.pageX, event.nativeEvent.pageY),
      onPanResponderTerminate: () => {
        draggingRef.current = null;
        setDragging(null);
        setHoverZone(null);
      },
    }).panHandlers;

  const makeResizeHandlers = (block: ExtraBlock, item: MonthItem) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        measureWeekGrid();
        const nextDrag = { block, item, sourceStartHour: block.startHour, mode: 'resize' as const };
        selectEvent(item);
        draggingRef.current = nextDrag;
        setDragging(nextDrag);
        setWarning(null);
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
      },
      onPanResponderMove: event => {
        dragPosition.setValue({ x: event.nativeEvent.pageX - 90, y: event.nativeEvent.pageY - 24 });
      },
      onPanResponderRelease: event => finishWeekResize(event.nativeEvent.pageY),
      onPanResponderTerminate: () => {
        draggingRef.current = null;
        setDragging(null);
        setHoverZone(null);
      },
    }).panHandlers;

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
                                  {...makeMonthDragHandlers(item)}
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

                  <View ref={allDayRef} style={[s.allDayRow, { borderColor: theme.colors.border }]}>
                    <Text style={[s.timeLabel, { color: theme.colors.textMuted }]}>All day</Text>
                    {week.map(date => {
                      const dateISO = dateToISO(date);
                      const seededItems = weekAllDaySeededEvents.filter(item => item.dateISO === dateISO);
                      const taskItems = weekTaskBlocks.filter(block => block.dateISO === dateISO);
                      return (
                        <View
                          key={`all-${dateISO}`}
                          style={[
                            s.allDayCell,
                            { borderColor: theme.colors.border },
                            hoverZone?.dateISO === dateISO && hoverZone.startHour === undefined && s.dropHover,
                          ]}
                        >
                          {seededItems.map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={[s.weekTaskChip, { backgroundColor: `${eventColor(item)}28` }]}
                              onPress={() => selectEvent(item)}
                            >
                              <Text numberOfLines={1} style={[s.weekEventTitle, { color: eventColor(item) }]}>{item.title}</Text>
                              <Text numberOfLines={1} style={[s.weekEventMeta, { color: theme.colors.textMuted }]}>{item.typeLabel}</Text>
                            </TouchableOpacity>
                          ))}
                          {taskItems.map(item => (
                            <View
                              key={item.id}
                              {...makeWeekMoveHandlers(item, customBlockEvent(item), 'task-date')}
                              style={[s.weekTaskChip, { backgroundColor: `${COURSES[item.course]?.color ?? COURSES.SELF.color}28` }, dragging?.block.id === item.id && s.dragSource]}
                            >
                              <Text numberOfLines={1} style={[s.weekEventTitle, { color: COURSES[item.course]?.color ?? COURSES.SELF.color }]}>{item.title}</Text>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>

                  <View ref={weekGridRef} style={s.weekGridBody}>
                    <View style={s.timeColumn}>
                      {DAY_HOURS.map(hour => (
                        <View key={hour} style={[s.timeCell, { borderColor: theme.colors.border }]}>
                          <Text style={[s.timeLabel, { color: theme.colors.textMuted }]}>{hourLabel(hour)}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={s.weekColumns}>
                      {week.map(date => {
                        const dateISO = dateToISO(date);
                        return (
                          <View key={dateISO} style={[s.weekColumn, { borderColor: theme.colors.border }]}>
                            {DAY_HOURS.map(hour => (
                              <View
                                key={`${dateISO}-${hour}`}
                                style={[
                                  s.hourLine,
                                  { borderColor: theme.colors.border },
                                  hoverZone?.dateISO === dateISO && Math.floor(hoverZone.startHour ?? -1) === hour && s.dropHover,
                                ]}
                              />
                            ))}
                          </View>
                        );
                      })}

                      {hoverZone?.startHour !== undefined && dragging?.mode === 'move' ? (
                        <View
                          pointerEvents="none"
                          style={[
                            s.weekEventAbsolute,
                            s.weekEventPreview,
                            {
                              left: `${(weekDateISOs.indexOf(hoverZone.dateISO) * 100) / 7}%`,
                              top: hoverZone.startHour * HOUR_HEIGHT,
                              width: `${100 / 7}%`,
                              height: Math.max((dragging.block.endHour - dragging.block.startHour) * HOUR_HEIGHT, 34),
                              borderColor: eventColor(dragging.item),
                            },
                          ]}
                        />
                      ) : null}

                      {weekTimedBlocks.map(block => {
                        const item = customBlockEvent(block);
                        const dayIndex = weekDateISOs.indexOf(block.dateISO as string);
                        if (dayIndex < 0) return null;
                        const color = COURSES[block.course]?.color ?? COURSES.SELF.color;
                        const top = clamp(block.startHour, 0, 24) * HOUR_HEIGHT;
                        const height = Math.max((block.endHour - block.startHour) * HOUR_HEIGHT, 34);
                        return (
                          <View
                            key={block.id}
                            {...makeWeekMoveHandlers(block, item, 'move')}
                            style={[
                              s.weekEventAbsolute,
                              {
                                left: `${(dayIndex * 100) / 7}%`,
                                top,
                                width: `${100 / 7}%`,
                                height,
                                backgroundColor: `${color}28`,
                                borderColor: color,
                              },
                              dragging?.block.id === block.id && s.dragSource,
                            ]}
                          >
                            <Text numberOfLines={1} style={[s.weekEventTitle, { color }]}>{block.title}</Text>
                            <Text style={[s.weekEventMeta, { color: theme.colors.textMuted }]}>{formatHour(block.startHour)} - {formatHour(block.endHour)}</Text>
                            <View {...makeResizeHandlers(block, item)} style={[s.resizeHandle, { backgroundColor: color }]}>
                              <Ionicons name="resize-outline" size={12} color="white" />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
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
  timeGutter: { width: TIME_GUTTER },
  timeLabel: { width: TIME_GUTTER, paddingRight: 8, textAlign: 'right', fontSize: 10, fontWeight: '800' },
  weekGridBody: { flexDirection: 'row', height: HOUR_HEIGHT * 24, position: 'relative' },
  timeColumn: { width: TIME_GUTTER },
  timeCell: { height: HOUR_HEIGHT, borderRightWidth: 1, borderBottomWidth: 1, justifyContent: 'flex-start', paddingTop: 6 },
  weekColumns: { flex: 1, flexDirection: 'row', position: 'relative' },
  weekColumn: { flex: 1, borderRightWidth: 1 },
  hourLine: { height: HOUR_HEIGHT, borderBottomWidth: 1 },
  dropHover: { backgroundColor: 'rgba(212,166,58,0.18)', borderColor: '#D4A63A' },
  dragSource: { opacity: 0.38 },
  weekDayName: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  weekDayNum: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  weekEventBlock: { borderRadius: 6, padding: 6 },
  weekEventTitle: { fontSize: 11, fontWeight: '900' },
  weekEventMeta: { fontSize: 9, fontWeight: '700', marginTop: 3 },
  weekTaskChip: { borderRadius: 6, padding: 6 },
  weekEventAbsolute: { position: 'absolute', borderLeftWidth: 3, borderRadius: 7, padding: 7, overflow: 'hidden', minHeight: 34 },
  weekEventPreview: { borderWidth: 1.5, borderStyle: 'dashed', backgroundColor: 'rgba(168,85,247,0.08)' },
  resizeHandle: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
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
