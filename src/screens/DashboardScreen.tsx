import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { TabName } from '../../App';
import { TASKS, COURSES, Task } from '../data';
import { shared, ACCENT } from '../styles/shared';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';

interface Props { goToTab: (t: TabName) => void; }

interface ExtraBlock { title: string; course: string; duration: string; day: string; }

export default function DashboardScreen({ goToTab }: Props) {
  const [checked, setChecked]           = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch]             = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [extraBlocks, setExtraBlocks]   = useState<ExtraBlock[]>([]);

  const toggle = (id: string) =>
    setChecked(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const filtered = TASKS.filter(t =>
    !search || [t.title, COURSES[t.course].label, t.type]
      .some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const overdue  = filtered.filter(t => t.status === 'overdue');
  const upcoming = filtered.filter(t => t.status === 'upcoming');

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={shared.screen}>
      <Header />

      {/* Search bar */}
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

      <ScrollView style={shared.body} contentContainerStyle={shared.bodyPad} showsVerticalScrollIndicator={false}>

        <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 16 } : undefined}>
          {/* Welcome card */}
          <View style={[s.welcomeCard, isDesktop && { flex: 1, minWidth: 300, marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.welcomeTitle}>Welcome back, Ngoc! 👋</Text>
              <Text style={s.welcomeSub}>Monday, March 9, 2026</Text>
            </View>
            <TouchableOpacity style={s.studyBtn} onPress={() => setShowAddStudy(true)}>
              <Text style={s.studyBtnTxt}>+ Study Block</Text>
            </TouchableOpacity>
          </View>

          {/* Summary chips */}
          <View style={[s.chipRow, isDesktop && { flex: 1, minWidth: 350, marginVertical: 'auto' }]}>
            <TouchableOpacity style={[s.chip, { backgroundColor: '#FEE2E2' }]} onPress={() => setSearch('')}>
              <Text style={[s.chipNum, { color: '#DC2626' }]}>3</Text>
              <Text style={[s.chipLbl, { color: '#DC2626' }]}>Overdue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.chip, { backgroundColor: '#DBEAFE' }]} onPress={() => setSearch('')}>
              <Text style={[s.chipNum, { color: '#1D4ED8' }]}>5</Text>
              <Text style={[s.chipLbl, { color: '#1D4ED8' }]}>Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.chip, { backgroundColor: '#DCFCE7' }]} onPress={() => goToTab('Calendar')}>
              <Text style={[s.chipNum, { color: '#15803D' }]}>{checked.size}</Text>
              <Text style={[s.chipLbl, { color: '#15803D' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overdue section */}
        {overdue.length > 0 && (
          <>
            <View style={[shared.sectionHead, isDesktop && { marginTop: 24 }]}>
              <View style={[shared.sectionAccent, { backgroundColor: '#EF4444' }]} />
              <Text style={shared.sectionTitle}>Overdue Tasks</Text>
              <View style={[shared.sectionBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[shared.sectionBadgeTxt, { color: '#DC2626' }]}>{overdue.length}</Text>
              </View>
            </View>
            <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 16 } : undefined}>
              {overdue.map(t => (
                <View key={t.id} style={isDesktop ? { width: 'calc(25% - 12px)' as any, minWidth: 280 } : { width: '100%' }}>
                  <TaskCard task={t} checked={checked.has(t.id)}
                    onCheck={toggle} onViewDetails={setSelectedTask} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <>
            <View style={[shared.sectionHead, isDesktop && { marginTop: 24 }]}>
              <View style={[shared.sectionAccent, { backgroundColor: '#3B82F6' }]} />
              <Text style={shared.sectionTitle}>Upcoming Tasks</Text>
              <View style={[shared.sectionBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[shared.sectionBadgeTxt, { color: '#1D4ED8' }]}>{upcoming.length}</Text>
              </View>
            </View>
            <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 16 } : undefined}>
              {upcoming.map(t => (
                <View key={t.id} style={isDesktop ? { width: 'calc(25% - 12px)' as any, minWidth: 280 } : { width: '100%' }}>
                  <TaskCard task={t} checked={checked.has(t.id)}
                    onCheck={toggle} onViewDetails={setSelectedTask} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Extra study blocks */}
        {extraBlocks.length > 0 && (
          <>
            <View style={[shared.sectionHead, isDesktop && { marginTop: 24 }]}>
              <View style={[shared.sectionAccent, { backgroundColor: '#A855F7' }]} />
              <Text style={shared.sectionTitle}>My Study Blocks</Text>
            </View>
            <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 16 } : undefined}>
              {extraBlocks.map((blk, i) => {
                const c = COURSES[blk.course] ?? COURSES['SELF'];
                return (
                  <View key={i} style={[s.extraCard, { borderLeftColor: c.color }, isDesktop && { width: 'calc(50% - 8px)' as any, minWidth: 300 }]}>
                  <View style={[s.extraDot, { backgroundColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.extraTitle}>{blk.title}</Text>
                    <Text style={s.extraSub}>{c.label} · {blk.day} · {blk.duration}</Text>
                  </View>
                  <View style={[s.personalPill, { backgroundColor: c.color + '20' }]}>
                    <Text style={[s.personalTxt, { color: c.color }]}>PERSONAL</Text>
                  </View>
                </View>
              );
            })}
            </View>
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={[s.empty, isDesktop && { marginTop: 40 }]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
            <Text style={s.emptyTxt}>No tasks match "{search}"</Text>
            <TouchableOpacity onPress={() => setSearch('')} style={s.clearSearchBtn}>
              <Text style={s.clearSearchTxt}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pro tip */}
        <View style={[s.proTip, isDesktop && { maxWidth: 600, alignSelf: 'center', marginTop: 40, width: '100%' }]}>
          <Text style={s.proTipHead}>💡 Pro Tip</Text>
          <Text style={s.proTipBody}>Use MiniTA AI to generate your personalized study schedule!</Text>
          <TouchableOpacity style={s.proTipBtn} onPress={() => goToTab('AI Chat')}>
            <Text style={s.proTipBtnTxt}>Open MiniTA AI →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isChecked={selectedTask ? checked.has(selectedTask.id) : false}
        onClose={() => setSelectedTask(null)}
        onComplete={id => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
      />
      <AddStudyModal
        visible={showAddStudy}
        onClose={() => setShowAddStudy(false)}
        onAdd={(title, course, duration, dayNum, startTime) => {
          const { WEEK_DAYS, addCalendarEvent, HOUR_LABELS, HOURS } = require('../data');
          const dayName = WEEK_DAYS[dayNum - 1];
          const timeLabel = HOUR_LABELS[HOURS.indexOf(startTime)];
          
          setExtraBlocks(prev => [...prev, { title, course, duration, day: `${dayName} at ${timeLabel}` }]);
          
          // Also add to the shared calendar data
          let hours = 1;
          if (duration === '30 min') hours = 0.5;
          if (duration === '1.5 hours') hours = 1.5;
          if (duration === '2 hours') hours = 2;
          if (duration === '3 hours') hours = 3;
          
          addCalendarEvent({
            title,
            course: course as any,
            day: dayNum,
            startHour: startTime,
            endHour: startTime + hours,
            detail: `User-created study block: ${title} (${duration})`
          });
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // Search
  searchBar:    { marginHorizontal: 16, marginBottom: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchFocused:{ backgroundColor: 'white' },
  searchInput:  { flex: 1, fontSize: 13, color: '#111827' },
  clearX:       { color: '#9CA3AF', fontSize: 14, fontWeight: '600', paddingHorizontal: 4 },

  // Welcome
  welcomeCard:  { flexDirection: 'column', alignItems: 'flex-start', backgroundColor: 'transparent', padding: 0, marginBottom: 24, marginTop: 8 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  welcomeSub:   { fontSize: 15, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  studyBtn:     { backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  studyBtnTxt:  { color: 'white', fontWeight: '600', fontSize: 14 },

  // Chips
  chipRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  chip:         { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', alignItems: 'flex-start' },
  chipNum:      { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  chipLbl:      { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Extra blocks
  extraCard:    { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4 },
  extraDot:     { width: 8, height: 8, borderRadius: 4 },
  extraTitle:   { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  extraSub:     { fontSize: 13, color: '#64748b', marginTop: 4 },
  personalPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  personalTxt:  { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Empty
  empty:          { alignItems: 'center', paddingVertical: 40 },
  emptyTxt:       { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 12 },
  clearSearchBtn: { backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  clearSearchTxt: { color: 'white', fontWeight: '700', fontSize: 13 },

  // Pro tip
  proTip:       { backgroundColor: '#F5F3FF', borderRadius: 14, borderWidth: 1.5, borderColor: '#DDD6FE', padding: 14, marginTop: 4 },
  proTipHead:   { fontSize: 13, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  proTipBody:   { fontSize: 12, color: '#6D28D9', lineHeight: 18 },
  proTipBtn:    { marginTop: 10, backgroundColor: ACCENT, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  proTipBtnTxt: { color: 'white', fontWeight: '700', fontSize: 12 },
});
