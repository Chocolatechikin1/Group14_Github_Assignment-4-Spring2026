import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, useWindowDimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification, TabName } from '../../App';
import { TASKS, COURSES, Task, ExtraBlock, WEEK_DAYS, WEEK_DATES, formatHour } from '../data';
import { AppTheme, getSharedStyles } from '../styles/shared';
import { StoredUser } from '../services/authStorage';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';

type Filter = 'all' | 'overdue' | 'upcoming' | 'done';

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
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = TASKS.filter(t =>
    !search || [t.title, COURSES[t.course].label, t.type]
      .some(value => value.toLowerCase().includes(search.toLowerCase()))
  );

  const overdue = filtered.filter(t => t.status === 'overdue' && !checked.has(t.id));
  const upcoming = filtered.filter(t => t.status === 'upcoming' && !checked.has(t.id));
  const done = TASKS.filter(t => checked.has(t.id));

  const showOverdue = filter === 'all' || filter === 'overdue';
  const showUpcoming = filter === 'all' || filter === 'upcoming';
  const showDone = filter === 'all' || filter === 'done';
  const firstName = currentUser.firstName || currentUser.fullName.split(' ')[0] || currentUser.netId;

  const setOrToggle = (next: Filter) => setFilter(prev => (prev === next ? 'all' : next));

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
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close" size={16} color={theme.colors.textSoft} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={shared.body}
        contentContainerStyle={[s.bodyPad, isWide && s.bodyPadWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.shell, isWide && s.shellWide]}>
          <View style={s.mainCol}>
            <View style={[s.welcomeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.welcomeTitle, { color: theme.colors.text }]}>Welcome back, {firstName}</Text>
                <Text style={[s.welcomeSub, { color: theme.colors.textMuted }]}>Monday, March 9, 2026</Text>
              </View>
              <TouchableOpacity style={[s.studyBtn, { backgroundColor: theme.colors.accent }]} onPress={() => setShowAddStudy(true)}>
                <Text style={s.studyBtnTxt}>+ Add Study Block</Text>
              </TouchableOpacity>
            </View>

            <View style={s.chipRow}>
              <FilterChip active={filter === 'overdue'} bg="#FEE2E2" color="#DC2626" label="Overdue" count={overdue.length} onPress={() => setOrToggle('overdue')} />
              <FilterChip active={filter === 'upcoming'} bg="#DBEAFE" color="#1D4ED8" label="Upcoming" count={upcoming.length} onPress={() => setOrToggle('upcoming')} />
              <FilterChip active={filter === 'done'} bg="#DCFCE7" color="#15803D" label="Done" count={done.length} onPress={() => setOrToggle('done')} />
              <FilterChip active={false} bg="#F5F3FF" color="#7C3AED" label="Study" count={extraBlocks.length} onPress={() => goToTab('Calendar')} />
            </View>

            {!isWide ? (
              <MiniCalendar theme={theme} extraBlocks={extraBlocks} onOpen={() => goToTab('Calendar')} />
            ) : null}

            {showOverdue && overdue.length > 0 ? (
              <TaskSection title="Overdue Tasks" color="#EF4444" count={overdue.length} theme={theme} shared={shared}>
                {overdue.map(task => (
                  <TaskCard key={task.id} task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                ))}
              </TaskSection>
            ) : null}

            {showUpcoming && upcoming.length > 0 ? (
              <TaskSection title="Upcoming Tasks" color="#3B82F6" count={upcoming.length} theme={theme} shared={shared}>
                {upcoming.map(task => (
                  <TaskCard key={task.id} task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                ))}
              </TaskSection>
            ) : null}

            {showDone && done.length > 0 ? (
              <TaskSection title="Completed" color="#22C55E" count={done.length} theme={theme} shared={shared}>
                {done.map(task => (
                  <TaskCard key={task.id} task={task} checked={checked.has(task.id)} onCheck={toggleChecked} onViewDetails={setSelectedTask} theme={theme} />
                ))}
              </TaskSection>
            ) : null}

            {filter === 'all' && extraBlocks.length > 0 ? (
              <TaskSection title="My Study Blocks" color="#A855F7" count={extraBlocks.length} theme={theme} shared={shared}>
                {extraBlocks.map(block => {
                  const course = COURSES[block.course] ?? COURSES.SELF;
                  return (
                    <TouchableOpacity
                      key={block.id}
                      style={[s.extraCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderLeftColor: course.color }]}
                      onPress={() => goToTab('Calendar')}
                    >
                      <View style={[s.extraDot, { backgroundColor: course.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.extraTitle, { color: theme.colors.text }]}>{block.title}</Text>
                        <Text style={[s.extraSub, { color: theme.colors.textMuted }]}>
                          {course.label} | {WEEK_DAYS[block.day - 1]} Mar {WEEK_DATES[block.day - 1]} | {formatHour(block.startHour)} - {formatHour(block.endHour)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSoft} />
                    </TouchableOpacity>
                  );
                })}
              </TaskSection>
            ) : null}

            {filtered.length === 0 ? (
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
              <MiniCalendar theme={theme} extraBlocks={extraBlocks} onOpen={() => goToTab('Calendar')} />
              <View style={[s.aiPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[s.aiPanelTitle, { color: theme.colors.text }]}>Suggested Actions</Text>
                {['What is next?', 'Generate Study Plan', 'Grade Calculator', 'Exam Tips', 'Due Date Reminder'].map(label => (
                  <TouchableOpacity key={label} style={[s.actionPill, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[s.actionPillText, { color: theme.colors.text }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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

function FilterChip({
  active, bg, color, label, count, onPress,
}: { active: boolean; bg: string; color: string; label: string; count: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.chip, { backgroundColor: bg }, active && { borderColor: color }]} onPress={onPress}>
      <Text style={[s.chipNum, { color }]}>{count}</Text>
      <Text style={[s.chipLbl, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TaskSection({ title, color, count, theme, shared, children }: any) {
  return (
    <>
      <View style={shared.sectionHead}>
        <View style={[shared.sectionAccent, { backgroundColor: color }]} />
        <Text style={shared.sectionTitle}>{title}</Text>
        <View style={[shared.sectionBadge, { backgroundColor: `${color}22` }]}>
          <Text style={[shared.sectionBadgeTxt, { color }]}>{count}</Text>
        </View>
      </View>
      {children}
    </>
  );
}

function MiniCalendar({ theme, extraBlocks, onOpen }: { theme: AppTheme; extraBlocks: ExtraBlock[]; onOpen: () => void }) {
  const scheduled = new Map<number, string>();
  [[9, '#FCA5A5'], [10, '#86EFAC'], [11, '#D8B4FE'], [12, '#BFDBFE'], [13, '#BFDBFE'], [14, '#86EFAC']].forEach(([day, color]) => scheduled.set(day as number, color as string));
  extraBlocks.forEach(block => scheduled.set(8 + block.day, COURSES[block.course]?.color ?? '#A855F7'));
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <TouchableOpacity style={[s.miniCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={onOpen} activeOpacity={0.82}>
      <View style={s.miniHead}>
        <Text style={[s.miniTitle, { color: theme.colors.text }]}>March 2026</Text>
        <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
      </View>
      <View style={s.miniWeekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={[s.miniWeek, { color: theme.colors.textSoft }]}>{day}</Text>
        ))}
      </View>
      <View style={s.miniGrid}>
        {cells.map(day => (
          <View
            key={day}
            style={[
              s.miniCell,
              { borderColor: theme.colors.border },
              day === 7 && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
            ]}
          >
            <Text style={[s.miniDayText, { color: day === 7 ? 'white' : theme.colors.textMuted }]}>{day <= 31 ? day : ''}</Text>
            {scheduled.has(day) ? <View style={[s.miniEvent, { backgroundColor: scheduled.get(day) }]} /> : null}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  searchOuter: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  bodyPad: { padding: 16, gap: 14 },
  bodyPadWide: { padding: 24 },
  shell: { gap: 18 },
  shellWide: { maxWidth: 1360, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'flex-start' },
  mainCol: { flex: 1, minWidth: 0 },
  sideCol: { width: 320, marginLeft: 22, gap: 16 },
  welcomeCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 18, marginBottom: 14 },
  welcomeTitle: { fontSize: 24, fontWeight: '900' },
  welcomeSub: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  studyBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11 },
  studyBtnTxt: { color: '#111827', fontSize: 13, fontWeight: '900' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chip: { flex: 1, minWidth: 96, borderWidth: 2, borderColor: 'transparent', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  chipNum: { fontSize: 22, fontWeight: '900' },
  chipLbl: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  extraCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderLeftWidth: 4, borderRadius: 8, padding: 12, marginBottom: 10 },
  extraDot: { width: 9, height: 9, borderRadius: 5 },
  extraTitle: { fontSize: 14, fontWeight: '800' },
  extraSub: { fontSize: 11, marginTop: 3, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  proTip: { borderRadius: 8, borderWidth: 1, padding: 14, marginTop: 4 },
  proTipHead: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  proTipBody: { fontSize: 12, lineHeight: 18 },
  proTipBtn: { borderRadius: 8, alignItems: 'center', paddingVertical: 10, marginTop: 10 },
  proTipBtnTxt: { color: '#111827', fontSize: 12, fontWeight: '900' },
  miniCard: { borderWidth: 1, borderRadius: 8, padding: 12, aspectRatio: 1 },
  miniHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  miniTitle: { fontSize: 15, fontWeight: '900' },
  miniWeekRow: { flexDirection: 'row', marginBottom: 4 },
  miniWeek: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '900' },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  miniCell: { width: `${100 / 7}%`, height: `${100 / 5}%`, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  miniDayText: { fontSize: 10, fontWeight: '800' },
  miniEvent: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  aiPanel: { borderWidth: 1, borderRadius: 8, padding: 14 },
  aiPanelTitle: { fontSize: 13, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase' },
  actionPill: { borderRadius: 18, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 8 },
  actionPillText: { fontSize: 12, fontWeight: '800' },
});
