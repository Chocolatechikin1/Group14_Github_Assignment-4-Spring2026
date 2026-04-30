import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, useWindowDimensions, Platform,
} from 'react-native';
import { TabName } from '../../App';
import {
  TASKS, COURSES, Task, ExtraBlock,
  WEEK_DAYS, WEEK_DATES, formatHour,
} from '../data';
import { shared, RED } from '../styles/shared';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';

// ─── Class schedule (Mon–Fri, 6 AM – 10 PM) ───────────────────────────────────
// Inline so this entire feature lives inside the Dashboard, per request.
interface ClassSession {
  id: string;
  course: keyof typeof COURSES;
  day: number;        // 1=Mon … 5=Fri
  startHour: number;  // 24h float
  endHour: number;
  location: string;
}

const CLASS_SCHEDULE: ClassSession[] = [
  // Mon
  { id: 'c1', course: 'PHY',  day: 1, startHour: 9,  endHour: 10.25, location: 'ECSS 2.312' },
  { id: 'c2', course: 'MATH', day: 1, startHour: 11, endHour: 12.25, location: 'GR 2.302' },
  { id: 'c3', course: 'HIST', day: 1, startHour: 14, endHour: 15.25, location: 'JO 4.614' },
  // Tue
  { id: 'c4', course: 'CS',   day: 2, startHour: 10, endHour: 11.5,  location: 'ECS 1.204' },
  { id: 'c5', course: 'PHY',  day: 2, startHour: 13, endHour: 14.5,  location: 'ECSS 2.312' },
  // Wed
  { id: 'c6', course: 'PHY',  day: 3, startHour: 9,  endHour: 10.25, location: 'ECSS 2.312' },
  { id: 'c7', course: 'MATH', day: 3, startHour: 11, endHour: 12.25, location: 'GR 2.302' },
  { id: 'c8', course: 'HIST', day: 3, startHour: 14, endHour: 15.25, location: 'JO 4.614' },
  { id: 'c9', course: 'PHY',  day: 3, startHour: 19, endHour: 20.5,  location: 'Lab Hall' },
  // Thu
  { id: 'c10', course: 'CS',   day: 4, startHour: 10, endHour: 11.5,  location: 'ECS 1.204' },
  { id: 'c11', course: 'MATH', day: 4, startHour: 13, endHour: 14.5,  location: 'GR 2.302' },
  // Fri
  { id: 'c12', course: 'PHY',  day: 5, startHour: 9,  endHour: 10.25, location: 'ECSS 2.312' },
  { id: 'c13', course: 'MATH', day: 5, startHour: 11, endHour: 12.25, location: 'GR 2.302' },
  { id: 'c14', course: 'HIST', day: 5, startHour: 14, endHour: 15.25, location: 'JO 4.614' },
];

const SCHEDULE_DAYS  = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const SCHEDULE_HOURS = Array.from({ length: 17 }, (_, i) => 6 + i); // 6 AM … 10 PM (22)
const PX_PER_HOUR    = 38;
const SCHEDULE_HEIGHT = (SCHEDULE_HOURS.length - 1) * PX_PER_HOUR;

type Filter = 'all' | 'overdue' | 'upcoming' | 'done';

interface Props {
  goToTab: (t: TabName) => void;
  checked: Set<string>;
  toggleChecked: (id: string) => void;
  extraBlocks: ExtraBlock[];
  addBlock: (b: ExtraBlock) => void;
}

export default function DashboardScreen({
  goToTab, checked, toggleChecked, extraBlocks, addBlock,
}: Props) {
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [search, setSearch]               = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAddStudy, setShowAddStudy]   = useState(false);
  const [filter, setFilter]               = useState<Filter>('all');

  const { width } = useWindowDimensions();
  const isWide    = width >= 900;
  const isXWide   = width >= 1280;

  const filtered = TASKS.filter(t =>
    !search || [t.title, COURSES[t.course].label, t.type]
      .some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const overdueAll  = filtered.filter(t => t.status === 'overdue' && !checked.has(t.id));
  const upcomingAll = filtered.filter(t => t.status === 'upcoming' && !checked.has(t.id));
  const doneAll     = TASKS.filter(t => checked.has(t.id));

  const showOverdue  = filter === 'all' || filter === 'overdue';
  const showUpcoming = filter === 'all' || filter === 'upcoming';
  const showDone     = filter === 'all' || filter === 'done';

  const setOrToggle = (f: Filter) => setFilter(prev => (prev === f ? 'all' : f));

  const renderTaskCard = (t: Task) => (
    <TaskCard
      key={t.id}
      task={t}
      checked={checked.has(t.id)}
      onCheck={toggleChecked}
      onViewDetails={setSelectedTask}
    />
  );

  return (
    <SafeAreaView style={shared.screen}>
      <Header />

      {/* Search bar */}
      <View style={[s.searchOuter, isWide && s.searchOuterWide]}>
        <View style={[s.searchBar, searchFocused && s.searchFocused]}>
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search assignments, courses, dates…"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.clearX}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={shared.body}
        contentContainerStyle={[s.bodyPad, isWide && s.bodyPadWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[isWide && s.outer]}>
          <View style={[isWide && s.twoCol]}>

            {/* ===== LEFT COLUMN (tasks) ===== */}
            <View style={isWide ? s.mainCol : undefined}>

              {/* Welcome card */}
              <View style={[s.welcomeCard, isWide && s.welcomeCardWide]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.welcomeTitle, isWide && s.welcomeTitleWide]}>
                    Welcome back, Ngoc! 👋
                  </Text>
                  <Text style={[s.welcomeSub, isWide && s.welcomeSubWide]}>
                    Monday, March 9, 2026
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.studyBtn, isWide && s.studyBtnWide]}
                  onPress={() => setShowAddStudy(true)}
                >
                  <Text style={[s.studyBtnTxt, isWide && s.studyBtnTxtWide]}>+ Add Study Block</Text>
                </TouchableOpacity>
              </View>

              {/* Filter chips */}
              <View style={s.chipRow}>
                <FilterChip
                  active={filter === 'overdue'}
                  bg="#FEE2E2" color="#DC2626"
                  label="Overdue" count={overdueAll.length}
                  onPress={() => setOrToggle('overdue')}
                />
                <FilterChip
                  active={filter === 'upcoming'}
                  bg="#DBEAFE" color="#1D4ED8"
                  label="Upcoming" count={upcomingAll.length}
                  onPress={() => setOrToggle('upcoming')}
                />
                <FilterChip
                  active={filter === 'done'}
                  bg="#DCFCE7" color="#15803D"
                  label="Done" count={doneAll.length}
                  onPress={() => setOrToggle('done')}
                />
                <FilterChip
                  active={false}
                  bg="#F5F3FF" color="#7C3AED"
                  label="Study" count={extraBlocks.length}
                  onPress={() => goToTab('Calendar')}
                />
              </View>

              {/* Active filter banner — clarifies what's visible */}
              {filter !== 'all' && (
                <TouchableOpacity style={s.filterBanner} onPress={() => setFilter('all')}>
                  <Text style={s.filterBannerTxt}>
                    Showing: <Text style={s.filterBannerStrong}>{filterLabel(filter)}</Text> only
                  </Text>
                  <Text style={s.filterBannerClear}>Show all ✕</Text>
                </TouchableOpacity>
              )}

              {/* Overdue */}
              {showOverdue && overdueAll.length > 0 && (
                <>
                  <View style={shared.sectionHead}>
                    <View style={[shared.sectionAccent, { backgroundColor: '#EF4444' }]} />
                    <Text style={shared.sectionTitle}>Overdue Tasks</Text>
                    <View style={[shared.sectionBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[shared.sectionBadgeTxt, { color: '#DC2626' }]}>{overdueAll.length}</Text>
                    </View>
                  </View>
                  {overdueAll.map(renderTaskCard)}
                </>
              )}

              {/* Upcoming */}
              {showUpcoming && upcomingAll.length > 0 && (
                <>
                  <View style={shared.sectionHead}>
                    <View style={[shared.sectionAccent, { backgroundColor: '#3B82F6' }]} />
                    <Text style={shared.sectionTitle}>Upcoming Tasks</Text>
                    <View style={[shared.sectionBadge, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[shared.sectionBadgeTxt, { color: '#1D4ED8' }]}>{upcomingAll.length}</Text>
                    </View>
                  </View>
                  {upcomingAll.map(renderTaskCard)}
                </>
              )}

              {/* Done */}
              {showDone && doneAll.length > 0 && (
                <>
                  <View style={shared.sectionHead}>
                    <View style={[shared.sectionAccent, { backgroundColor: '#22C55E' }]} />
                    <Text style={shared.sectionTitle}>Completed</Text>
                    <View style={[shared.sectionBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[shared.sectionBadgeTxt, { color: '#15803D' }]}>{doneAll.length}</Text>
                    </View>
                  </View>
                  {doneAll.map(renderTaskCard)}
                </>
              )}

              {/* Empty filtered view */}
              {filter !== 'all' && (
                (filter === 'overdue'  && overdueAll.length  === 0) ||
                (filter === 'upcoming' && upcomingAll.length === 0) ||
                (filter === 'done'     && doneAll.length     === 0)
              ) && (
                <View style={s.empty}>
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>🎉</Text>
                  <Text style={s.emptyTxt}>No {filterLabel(filter).toLowerCase()} tasks</Text>
                  <TouchableOpacity onPress={() => setFilter('all')} style={s.clearSearchBtn}>
                    <Text style={s.clearSearchTxt}>Show All Tasks</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Extra study blocks */}
              {filter === 'all' && extraBlocks.length > 0 && (
                <>
                  <View style={shared.sectionHead}>
                    <View style={[shared.sectionAccent, { backgroundColor: '#A855F7' }]} />
                    <Text style={shared.sectionTitle}>My Study Blocks</Text>
                    <View style={[shared.sectionBadge, { backgroundColor: '#F5F3FF' }]}>
                      <Text style={[shared.sectionBadgeTxt, { color: '#7C3AED' }]}>{extraBlocks.length}</Text>
                    </View>
                  </View>
                  {extraBlocks.map(blk => {
                    const c = COURSES[blk.course] ?? COURSES['SELF'];
                    const dayLabel  = `${WEEK_DAYS[blk.day - 1]} Mar ${WEEK_DATES[blk.day - 1]}`;
                    const timeLabel = `${formatHour(blk.startHour)} – ${formatHour(blk.endHour)}`;
                    return (
                      <View key={blk.id} style={[s.extraCard, { borderLeftColor: c.color }]}>
                        <View style={[s.extraDot, { backgroundColor: c.color }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.extraTitle}>{blk.title}</Text>
                          <Text style={s.extraSub}>{c.label}</Text>
                          <Text style={s.extraTime}>📅 {dayLabel} · 🕒 {timeLabel}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => goToTab('Calendar')}
                          style={[s.calLink, { backgroundColor: c.color + '20' }]}
                        >
                          <Text style={[s.calLinkTxt, { color: c.color }]}>View →</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              )}

              {/* No-search-result empty */}
              {filtered.length === 0 && (
                <View style={s.empty}>
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
                  <Text style={s.emptyTxt}>No tasks match "{search}"</Text>
                  <TouchableOpacity onPress={() => setSearch('')} style={s.clearSearchBtn}>
                    <Text style={s.clearSearchTxt}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Pro tip */}
              {filter === 'all' && (
                <View style={s.proTip}>
                  <Text style={s.proTipHead}>💡 Pro Tip</Text>
                  <Text style={s.proTipBody}>Use MiniTA AI to generate your personalized study schedule!</Text>
                  <TouchableOpacity style={s.proTipBtn} onPress={() => goToTab('AI Chat')}>
                    <Text style={s.proTipBtnTxt}>Open MiniTA AI →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 24 }} />
            </View>

            {/* ===== RIGHT COLUMN (class schedule) — wide screens only ===== */}
            {isWide && (
              <View style={s.scheduleCol}>
                <ClassScheduleGrid />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isComplete={selectedTask ? checked.has(selectedTask.id) : false}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={id => toggleChecked(id)}
      />
      <AddStudyModal
        visible={showAddStudy}
        onClose={() => setShowAddStudy(false)}
        onAdd={(block) => addBlock(block)}
      />
    </SafeAreaView>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FilterChip({
  active, bg, color, label, count, onPress,
}: { active: boolean; bg: string; color: string; label: string; count: number; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, { backgroundColor: bg }, active && { borderColor: color, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.chipNum, { color }]}>{count}</Text>
      <Text style={[s.chipLbl, { color }]}>{label}</Text>
      {active && <View style={[s.chipActiveDot, { backgroundColor: color }]} />}
    </TouchableOpacity>
  );
}

function ClassScheduleGrid() {
  return (
    <View style={s.scheduleCard}>
      <View style={s.scheduleHead}>
        <Text style={s.scheduleTitle}>📚 Class Schedule</Text>
        <Text style={s.scheduleSub}>Mon – Fri</Text>
      </View>

      {/* Day header row */}
      <View style={s.headerRow}>
        <View style={s.timeColHead} />
        {SCHEDULE_DAYS.map(d => (
          <View key={d} style={s.dayHead}>
            <Text style={s.dayHeadTxt}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid body — relative container for absolute-positioned events */}
      <View style={s.gridBody}>
        {/* Hour rows (background lines + labels) */}
        {SCHEDULE_HOURS.map((hr, i) => (
          <View
            key={hr}
            style={[s.hourRow, { top: i * PX_PER_HOUR }, i === 0 && { borderTopWidth: 0 }]}
          >
            <Text style={s.hourLabel}>{hourLabel(hr)}</Text>
          </View>
        ))}

        {/* Day columns (vertical separators) */}
        <View style={s.daysRow} pointerEvents="box-none">
          <View style={s.timeCol} />
          {SCHEDULE_DAYS.map((_, dayIdx) => (
            <View key={dayIdx} style={s.dayCol} pointerEvents="box-none">
              {CLASS_SCHEDULE
                .filter(c => c.day === dayIdx + 1)
                .map(c => {
                  const top    = (c.startHour - SCHEDULE_HOURS[0]) * PX_PER_HOUR;
                  const height = (c.endHour - c.startHour) * PX_PER_HOUR;
                  const course = COURSES[c.course];
                  return (
                    <View
                      key={c.id}
                      style={[
                        s.classBlock,
                        {
                          top, height: Math.max(height - 4, 28),
                          backgroundColor: course.color + 'E6',
                          borderLeftColor: course.color,
                        },
                      ]}
                    >
                      <Text style={s.classTitle} numberOfLines={1}>
                        {course.label}
                      </Text>
                      <Text style={s.classTime} numberOfLines={1}>
                        {formatHour(c.startHour)} – {formatHour(c.endHour)}
                      </Text>
                      {height >= 60 && (
                        <Text style={s.classLoc} numberOfLines={1}>{c.location}</Text>
                      )}
                    </View>
                  );
                })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function hourLabel(h: number): string {
  if (h === 12) return '12 PM';
  if (h === 0)  return '12 AM';
  if (h < 12)   return `${h} AM`;
  return `${h - 12} PM`;
}

function filterLabel(f: Filter): string {
  if (f === 'overdue')  return 'Overdue';
  if (f === 'upcoming') return 'Upcoming';
  if (f === 'done')     return 'Completed';
  return 'All';
}

const s = StyleSheet.create({
  // Container
  outer:        { width: '100%', maxWidth: 1400, alignSelf: 'center' },
  twoCol:       { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  mainCol:      { flex: 1, minWidth: 0 },
  scheduleCol:  { width: 480, flexShrink: 0 },

  bodyPad:      { padding: 16 },
  bodyPadWide:  { paddingHorizontal: 32, paddingTop: 24 },

  // Search
  searchOuter:  { paddingHorizontal: 16, backgroundColor: RED },
  searchOuterWide: { paddingHorizontal: 32, paddingBottom: 12, alignItems: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, width: '100%', maxWidth: 1400 },
  searchFocused:{ backgroundColor: 'white' },
  searchInput:  {
    flex: 1, fontSize: 13, color: '#111827',
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },
  clearX:       { color: '#9CA3AF', fontSize: 14, fontWeight: '600', paddingHorizontal: 4 },

  // Welcome
  welcomeCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  welcomeCardWide: { padding: 24, borderRadius: 18, marginBottom: 20 },
  welcomeTitle:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  welcomeTitleWide:{ fontSize: 22 },
  welcomeSub:      { fontSize: 11, color: '#6B7280', marginTop: 2 },
  welcomeSubWide:  { fontSize: 14, marginTop: 6 },
  studyBtn:        { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  studyBtnWide:    { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  studyBtnTxt:     { color: 'white', fontWeight: '700', fontSize: 12 },
  studyBtnTxtWide: { fontSize: 14 },

  // Chips
  chipRow:      { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  chip:         { flex: 1, minWidth: 80, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  chipNum:      { fontSize: 22, fontWeight: '800' },
  chipLbl:      { fontSize: 10, fontWeight: '700', marginTop: 1 },
  chipActiveDot:{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3 },

  // Filter active banner
  filterBanner:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EEF2FF', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14, borderWidth: 1, borderColor: '#C7D2FE' },
  filterBannerTxt: { fontSize: 12, color: '#3730A3', fontWeight: '500' },
  filterBannerStrong: { fontWeight: '800' },
  filterBannerClear:  { fontSize: 12, color: '#3730A3', fontWeight: '700' },

  // Extra blocks
  extraCard:    { backgroundColor: 'white', borderRadius: 12, borderLeftWidth: 4, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  extraDot:     { width: 10, height: 10, borderRadius: 5 },
  extraTitle:   { fontSize: 14, fontWeight: '700', color: '#111827' },
  extraSub:     { fontSize: 12, color: '#6B7280', marginTop: 2 },
  extraTime:    { fontSize: 11, color: '#7C3AED', marginTop: 4, fontWeight: '600' },
  calLink:      { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  calLinkTxt:   { fontSize: 11, fontWeight: '700' },

  // Empty
  empty:          { alignItems: 'center', paddingVertical: 40 },
  emptyTxt:       { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 12 },
  clearSearchBtn: { backgroundColor: RED, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  clearSearchTxt: { color: 'white', fontWeight: '700', fontSize: 13 },

  // Pro tip
  proTip:       { backgroundColor: '#F5F3FF', borderRadius: 14, borderWidth: 1.5, borderColor: '#DDD6FE', padding: 14, marginTop: 4 },
  proTipHead:   { fontSize: 13, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  proTipBody:   { fontSize: 12, color: '#6D28D9', lineHeight: 18 },
  proTipBtn:    { marginTop: 10, backgroundColor: '#7C3AED', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  proTipBtnTxt: { color: 'white', fontWeight: '700', fontSize: 12 },

  // ─── Class schedule ─────────────────────────────────────────────────────────
  scheduleCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10,
    elevation: 2,
  },
  scheduleHead:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  scheduleTitle:  { fontSize: 16, fontWeight: '800', color: '#111827' },
  scheduleSub:    { fontSize: 11, color: '#6B7280', fontWeight: '600' },

  headerRow:      { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', paddingBottom: 6, marginBottom: 4 },
  timeColHead:    { width: 44 },
  dayHead:        { flex: 1, alignItems: 'center' },
  dayHeadTxt:     { fontSize: 11, fontWeight: '800', color: '#374151', letterSpacing: 0.6 },

  gridBody:       { position: 'relative', height: SCHEDULE_HEIGHT + PX_PER_HOUR, marginTop: 4 },

  // Hour rows are absolutely-positioned background lines + labels
  hourRow:        { position: 'absolute', left: 0, right: 0, height: PX_PER_HOUR, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row' },
  hourLabel:      { width: 44, fontSize: 10, color: '#9CA3AF', fontWeight: '600', paddingTop: 2, paddingLeft: 2 },

  // Day columns sit on top of the hour rows
  daysRow:        { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' },
  timeCol:        { width: 44 },
  dayCol:         { flex: 1, position: 'relative', borderLeftWidth: 1, borderLeftColor: '#F3F4F6' },

  classBlock:     {
    position: 'absolute', left: 2, right: 2,
    borderRadius: 6, borderLeftWidth: 3,
    paddingHorizontal: 6, paddingVertical: 4,
    overflow: 'hidden',
  },
  classTitle:     { color: 'white', fontSize: 11, fontWeight: '800' },
  classTime:      { color: 'rgba(255,255,255,0.92)', fontSize: 9, marginTop: 1, fontWeight: '600' },
  classLoc:       { color: 'rgba(255,255,255,0.85)', fontSize: 9, marginTop: 2 },
});
