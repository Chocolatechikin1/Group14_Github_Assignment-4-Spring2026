import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, useWindowDimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification, TabName } from '../../App';
import { TASKS, COURSES, Task, ExtraBlock, TASK_DATES, formatHour } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import { StoredUser } from '../services/authStorage';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';

type CalendarItem = {
  id: string;
  title: string;
  dateISO: string;
  color: string;
  taskId?: string;
  blockId?: string;
};

interface Props {
  goToTab: (t: TabName) => void;
  currentUser: StoredUser;
  theme: AppTheme;
  notifications: AppNotification[];
  onOpenSettings: () => void;
  checked: Set<string>;
  toggleChecked: (id: string) => void;
  extraBlocks: ExtraBlock[];
  addBlock: (b: ExtraBlock) => void;
}

function dateLabel(dateISO?: string) {
  if (!dateISO) return 'Date not set';
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdueDate(dateISO?: string) {
  return Boolean(dateISO && dateISO < todayISO());
}

export default function DashboardScreen({
  goToTab,
  currentUser,
  theme,
  notifications,
  onOpenSettings,
  checked,
  toggleChecked,
  extraBlocks,
  addBlock,
}: Props) {
  const shared = useMemo(() => getSharedStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAddStudy, setShowAddStudy] = useState(false);

  const firstName = currentUser.firstName || currentUser.fullName.split(' ')[0] || currentUser.netId;

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const taskItems = TASKS.map(task => ({
      id: `task-${task.id}`,
      taskId: task.id,
      title: task.title,
      dateISO: TASK_DATES[task.id],
      color: COURSES[task.course].color,
    }));
    const blockItems = extraBlocks
      .filter(block => block.dateISO)
      .map(block => ({
        id: `block-${block.id}`,
        blockId: block.id,
        title: block.title,
        dateISO: block.dateISO as string,
        color: COURSES[block.course]?.color ?? COURSES.SELF.color,
      }));
    return [...taskItems, ...blockItems];
  }, [extraBlocks]);

  const visibleTasks = TASKS.filter(task =>
    !search || [task.title, COURSES[task.course].label, task.type, task.due]
      .some(value => value.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (a.id === focusedItemId) return -1;
    if (b.id === focusedItemId) return 1;
    return 0;
  });

  const overdue = visibleTasks.filter(task => task.status === 'overdue' && !checked.has(task.id));
  const upcoming = visibleTasks.filter(task => task.status === 'upcoming' && !checked.has(task.id));
  const done = visibleTasks.filter(task => checked.has(task.id));
  const customUpcoming = extraBlocks.filter(block => !isOverdueDate(block.dateISO));
  const customOverdue = extraBlocks.filter(block => isOverdueDate(block.dateISO));
  const focusedBlock = extraBlocks.find(block => block.id === focusedItemId);

  const focusCalendarItem = (item: CalendarItem) => {
    setFocusedItemId(item.taskId ?? item.blockId ?? null);
    setSearch(item.title);
  };

  return (
    <SafeAreaView style={shared.screen}>
      <Header netId={currentUser.netId} theme={theme} notifications={notifications} onProfilePress={onOpenSettings} />

      <View style={[s.searchOuter, { backgroundColor: theme.colors.brand }]}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            searchFocused && { borderColor: theme.colors.accent },
          ]}
        >
          <Ionicons name="search-outline" size={16} color={theme.colors.textSoft} />
          <TextInput
            style={[s.searchInput, { color: theme.colors.text }]}
            placeholder="Search assignments, courses, dates..."
            placeholderTextColor={theme.colors.textSoft}
            value={search}
            onChangeText={value => {
              setSearch(value);
              if (!value) setFocusedItemId(null);
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearch(''); setFocusedItemId(null); }}>
              <Ionicons name="close" size={16} color={theme.colors.textSoft} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView style={shared.body} contentContainerStyle={[s.bodyPad, isWide && s.bodyPadWide]} showsVerticalScrollIndicator={false}>
        <View style={[s.shell, isWide && s.shellWide]}>
          <View style={s.mainCol}>
            <View style={[s.welcomeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.welcomeTitle, { color: theme.colors.text }]}>Welcome back, {firstName}</Text>
                <Text style={[s.welcomeSub, { color: theme.colors.textMuted }]}>
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity style={[s.studyBtn, { backgroundColor: theme.colors.accent }]} onPress={() => setShowAddStudy(true)}>
                <Text style={s.studyBtnTxt}>+ Add Study Block</Text>
              </TouchableOpacity>
            </View>

            <View style={s.badgeRow}>
              <StatusBadge label="Upcoming" count={upcoming.length + customUpcoming.length} color="#1D4ED8" bg="#DBEAFE" />
              <StatusBadge label="Overdue" count={overdue.length + customOverdue.length} color="#DC2626" bg="#FEE2E2" />
              <StatusBadge label="Done" count={done.length} color="#15803D" bg="#DCFCE7" />
            </View>

            {!isWide ? (
              <MiniCalendar theme={theme} items={calendarItems} onItemPress={focusCalendarItem} onOpen={() => goToTab('Calendar')} />
            ) : null}

            <TaskGridSection title="Upcoming Assignments" color="#3B82F6" count={upcoming.length} shared={shared}>
              {upcoming.map(task => (
                <View key={task.id} style={s.taskTile}>
                  <TaskCard task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                </View>
              ))}
              {customUpcoming.map(block => (
                <CustomBlockCard key={block.id} block={block} theme={theme} focused={block.id === focusedItemId} onPress={() => setFocusedItemId(block.id)} />
              ))}
            </TaskGridSection>

            <TaskGridSection title="Overdue Assignments" color="#EF4444" count={overdue.length} shared={shared}>
              {overdue.map(task => (
                <View key={task.id} style={s.taskTile}>
                  <TaskCard task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                </View>
              ))}
              {customOverdue.map(block => (
                <CustomBlockCard key={block.id} block={block} theme={theme} focused={block.id === focusedItemId} onPress={() => setFocusedItemId(block.id)} />
              ))}
            </TaskGridSection>

            {done.length > 0 ? (
              <TaskGridSection title="Completed" color="#22C55E" count={done.length} shared={shared}>
                {done.map(task => (
                  <View key={task.id} style={s.taskTile}>
                    <TaskCard task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                  </View>
                ))}
              </TaskGridSection>
            ) : null}

            {visibleTasks.length === 0 && !focusedBlock ? (
              <View style={s.empty}>
                <Ionicons name="search-outline" size={36} color={theme.colors.textSoft} />
                <Text style={[s.emptyTxt, { color: theme.colors.textMuted }]}>No tasks match "{search}"</Text>
              </View>
            ) : null}

            <View style={[s.proTip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[s.proTipHead, { color: theme.colors.accent }]}>Recommendation</Text>
              <Text style={[s.proTipBody, { color: theme.colors.textMuted }]}>Use MiniTA AI to generate your personalized study schedule.</Text>
              <TouchableOpacity style={[s.proTipBtn, { backgroundColor: theme.colors.accent }]} onPress={() => goToTab('AI Chat')}>
                <Text style={s.proTipBtnTxt}>Open MiniTA AI</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isWide ? (
            <View style={s.sideCol}>
              <MiniCalendar theme={theme} items={calendarItems} onItemPress={focusCalendarItem} onOpen={() => goToTab('Calendar')} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <TaskDetailModal
        task={selectedTask}
        isComplete={selectedTask ? checked.has(selectedTask.id) : false}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={toggleChecked}
      />
      <AddStudyModal visible={showAddStudy} onClose={() => setShowAddStudy(false)} onAdd={addBlock} />
    </SafeAreaView>
  );
}

function TaskGridSection({ title, color, count, shared, children }: any) {
  return (
    <View style={s.sectionWrap}>
      <View style={shared.sectionHead}>
        <View style={[shared.sectionAccent, { backgroundColor: color }]} />
        <Text style={shared.sectionTitle}>{title}</Text>
        <View style={[shared.sectionBadge, { backgroundColor: `${color}22` }]}>
          <Text style={[shared.sectionBadgeTxt, { color }]}>{count}</Text>
        </View>
      </View>
      <View style={s.taskGrid}>{children}</View>
    </View>
  );
}

function StatusBadge({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <View style={[s.statusBadge, { backgroundColor: bg }]}>
      <Text style={[s.statusCount, { color }]}>{count}</Text>
      <Text style={[s.statusLabel, { color }]}>{label}</Text>
    </View>
  );
}

function CustomBlockCard({ block, theme, focused, onPress }: { block: ExtraBlock; theme: AppTheme; focused: boolean; onPress: () => void }) {
  const course = COURSES[block.course] ?? COURSES.SELF;
  const isTask = block.itemType === 'task';
  return (
    <TouchableOpacity
      style={[s.studyTile, { backgroundColor: theme.colors.surface, borderColor: focused ? theme.colors.accent : theme.colors.border, borderLeftColor: course.color }]}
      onPress={onPress}
    >
      <Text style={[s.studyType, { color: isTask ? '#DC2626' : '#7C3AED' }]}>{isTask ? 'CUSTOM TASK' : 'STUDY BLOCK'}</Text>
      <Text style={[s.studyTitle, { color: theme.colors.text }]}>{block.title}</Text>
      <Text style={[s.studySub, { color: theme.colors.textMuted }]}>{course.label}</Text>
      <Text style={[s.studySub, { color: theme.colors.textMuted }]}>
        {isTask ? `Due ${dateLabel(block.dueDateISO || block.dateISO)}` : `${dateLabel(block.dateISO)} | ${formatHour(block.startHour)} - ${formatHour(block.endHour)}`}
      </Text>
    </TouchableOpacity>
  );
}

function MiniCalendar({
  theme,
  items,
  onItemPress,
  onOpen,
}: {
  theme: AppTheme;
  items: CalendarItem[];
  onItemPress: (item: CalendarItem) => void;
  onOpen: () => void;
}) {
  const [monthDate, setMonthDate] = useState(new Date());
  const cells = monthCells(monthDate);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const todayISO = new Date().toISOString().slice(0, 10);
  const monthTitle = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <View style={[s.miniCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={s.miniHead}>
        <TouchableOpacity onPress={() => setMonthDate(new Date(year, month - 1, 1))}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.textSoft} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpen}>
          <Text style={[s.miniTitle, { color: theme.colors.text }]}>{monthTitle}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMonthDate(new Date(year, month + 1, 1))}>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSoft} />
        </TouchableOpacity>
      </View>
      <View style={s.miniWeekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={[s.miniWeek, { color: theme.colors.textSoft }]}>{day}</Text>
        ))}
      </View>
      <View style={s.miniGrid}>
        {cells.map((day, index) => {
          const dateISO = day ? toISO(year, month, day) : '';
          const dayItems = items.filter(item => item.dateISO === dateISO);
          const isToday = dateISO === todayISO;
          return (
            <View key={`${day ?? 'blank'}-${index}`} style={[s.miniCell, { borderColor: theme.colors.border }, !day && { backgroundColor: theme.colors.surfaceMuted }]}>
              {day ? (
                <>
                  <Text style={[s.miniDayText, { color: isToday ? '#EF4444' : theme.colors.textMuted }]}>{day}</Text>
                  <View style={s.miniEventList}>
                    {dayItems.slice(0, 2).map(item => (
                      <TouchableOpacity key={item.id} style={[s.miniEventPill, { backgroundColor: `${item.color}25` }]} onPress={() => onItemPress(item)}>
                        <Text numberOfLines={1} style={[s.miniEventText, { color: item.color }]}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={[s.calendarCta, { backgroundColor: theme.colors.accent }]} onPress={onOpen}>
        <Text style={s.calendarCtaText}>Go to Calendar</Text>
        <Ionicons name="arrow-forward" size={14} color="#111827" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  searchOuter: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  bodyPad: { padding: 16, gap: 14 },
  bodyPadWide: { padding: 24 },
  shell: { gap: 18 },
  shellWide: { maxWidth: 1440, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'flex-start' },
  mainCol: { flex: 1, minWidth: 0 },
  sideCol: { width: 430, marginLeft: 22 },
  welcomeCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 18, marginBottom: 14 },
  welcomeTitle: { fontSize: 24, fontWeight: '900' },
  welcomeSub: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  studyBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11 },
  studyBtnTxt: { color: '#111827', fontSize: 13, fontWeight: '900' },
  sectionWrap: { marginBottom: 18 },
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  taskTile: { width: '31.8%', minWidth: 230 },
  studyTile: { width: '31.8%', minWidth: 230, borderRadius: 10, borderWidth: 1.5, borderLeftWidth: 4, padding: 14 },
  studyType: { fontSize: 10, fontWeight: '900', marginBottom: 6, textTransform: 'uppercase' },
  studyTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  studySub: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  proTip: { borderRadius: 8, borderWidth: 1, padding: 14, marginTop: 4 },
  proTipHead: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  proTipBody: { fontSize: 12, lineHeight: 18 },
  proTipBtn: { borderRadius: 8, alignItems: 'center', paddingVertical: 10, marginTop: 10 },
  proTipBtnTxt: { color: '#111827', fontSize: 12, fontWeight: '900' },
  miniCard: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 430 },
  miniHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  miniTitle: { fontSize: 16, fontWeight: '900' },
  miniWeekRow: { flexDirection: 'row', marginBottom: 4 },
  miniWeek: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '900' },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  miniCell: { width: `${100 / 7}%`, height: 62, borderWidth: 0.5, padding: 3 },
  miniDayText: { fontSize: 10, fontWeight: '900' },
  miniEventList: { gap: 2, marginTop: 2 },
  miniEventPill: { borderRadius: 3, paddingHorizontal: 3, paddingVertical: 2 },
  miniEventText: { fontSize: 8, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statusBadge: { flex: 1, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 14 },
  statusCount: { fontSize: 26, fontWeight: '900' },
  statusLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  calendarCta: { marginTop: 12, borderRadius: 8, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  calendarCtaText: { color: '#111827', fontSize: 12, fontWeight: '900' },
});
