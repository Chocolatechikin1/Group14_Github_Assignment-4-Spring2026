import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { TabName } from '../../App';
import { TASKS, COURSES, Task } from '../data';
import { shared, RED } from '../styles/shared';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import AddStudyModal from '../components/modals/AddStudyModal';

interface Props { goToTab: (t: TabName) => void; }

interface ExtraBlock { title: string; course: string; duration: string; }

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

        {/* Welcome card */}
        <View style={s.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeTitle}>Welcome back, Ngoc! 👋</Text>
            <Text style={s.welcomeSub}>Monday, March 9, 2026</Text>
          </View>
          <TouchableOpacity style={s.studyBtn} onPress={() => setShowAddStudy(true)}>
            <Text style={s.studyBtnTxt}>+ Study Block</Text>
          </TouchableOpacity>
        </View>

        {/* Summary chips */}
        <View style={s.chipRow}>
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

        {/* Overdue section */}
        {overdue.length > 0 && (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: '#EF4444' }]} />
              <Text style={shared.sectionTitle}>Overdue Tasks</Text>
              <View style={[shared.sectionBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[shared.sectionBadgeTxt, { color: '#DC2626' }]}>{overdue.length}</Text>
              </View>
            </View>
            {overdue.map(t => (
              <TaskCard key={t.id} task={t} checked={checked.has(t.id)}
                onCheck={toggle} onViewDetails={setSelectedTask} />
            ))}
          </>
        )}

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: '#3B82F6' }]} />
              <Text style={shared.sectionTitle}>Upcoming Tasks</Text>
              <View style={[shared.sectionBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[shared.sectionBadgeTxt, { color: '#1D4ED8' }]}>{upcoming.length}</Text>
              </View>
            </View>
            {upcoming.map(t => (
              <TaskCard key={t.id} task={t} checked={checked.has(t.id)}
                onCheck={toggle} onViewDetails={setSelectedTask} />
            ))}
          </>
        )}

        {/* Extra study blocks */}
        {extraBlocks.length > 0 && (
          <>
            <View style={shared.sectionHead}>
              <View style={[shared.sectionAccent, { backgroundColor: '#A855F7' }]} />
              <Text style={shared.sectionTitle}>My Study Blocks</Text>
            </View>
            {extraBlocks.map((blk, i) => {
              const c = COURSES[blk.course] ?? COURSES['SELF'];
              return (
                <View key={i} style={[s.extraCard, { borderLeftColor: c.color }]}>
                  <View style={[s.extraDot, { backgroundColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.extraTitle}>{blk.title}</Text>
                    <Text style={s.extraSub}>{c.label} · {blk.duration}</Text>
                  </View>
                  <View style={[s.personalPill, { backgroundColor: c.color + '20' }]}>
                    <Text style={[s.personalTxt, { color: c.color }]}>PERSONAL</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Empty state */}
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
        <View style={s.proTip}>
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
        onClose={() => setSelectedTask(null)}
        onComplete={id => setChecked(prev => { const n = new Set(prev); n.add(id); return n; })}
      />
      <AddStudyModal
        visible={showAddStudy}
        onClose={() => setShowAddStudy(false)}
        onAdd={(title, course, duration) => setExtraBlocks(prev => [...prev, { title, course, duration }])}
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
  welcomeCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  welcomeTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  welcomeSub:   { fontSize: 11, color: '#6B7280', marginTop: 2 },
  studyBtn:     { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  studyBtnTxt:  { color: 'white', fontWeight: '700', fontSize: 12 },

  // Chips
  chipRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip:         { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  chipNum:      { fontSize: 22, fontWeight: '800' },
  chipLbl:      { fontSize: 10, fontWeight: '600', marginTop: 1 },

  // Extra blocks
  extraCard:    { backgroundColor: 'white', borderRadius: 12, borderLeftWidth: 4, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  extraDot:     { width: 10, height: 10, borderRadius: 5 },
  extraTitle:   { fontSize: 14, fontWeight: '700', color: '#111827' },
  extraSub:     { fontSize: 12, color: '#6B7280', marginTop: 2 },
  personalPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  personalTxt:  { fontSize: 10, fontWeight: '700' },

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
});
